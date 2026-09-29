'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { Habit, HabitCompletion, OpenRouterSettings, HabitStatus, UserDefinedCategory } from '@/lib/types';
import useLocalStorage from '@/lib/localStorage';
import { AddHabitDialog } from './AddHabitDialog';
import { HabitItem } from './HabitItem';
import { PersonalizedTipsSection } from './PersonalizedTipsSection';
import { StatsOverview } from './StatsOverview';
import { WeeklyProgress } from './WeeklyProgress';
import { AchievementsShelf } from './AchievementsShelf';
import {
  calculateUserLevel,
  deriveUserAchievements,
  EMPTY_USER_ACHIEVEMENTS,
  getAchievementsToPersist,
  getAllAchievementsWithProgress,
  normalizeStoredUserAchievements,
} from '@/lib/achievements';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { format, subDays, isSameDay, startOfDay, addDays, isToday, isYesterday, startOfWeek, endOfWeek, eachDayOfInterval, isAfter } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CalendarDays, ChevronLeft, ChevronRight, FolderOpen, ListChecks, Download, Upload, Settings, Plus, Flame } from 'lucide-react';
import { ApiKeyDialog } from './ApiKeyDialog';
import { CategorySettingsDialog } from './CategorySettingsDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { availableIcons, defaultIconKey } from '@/components/icons';
import { useTranslations, useLanguage } from '@/components/LanguageProvider';
import { getDayProgress, getDayProgressColorClass } from '@/lib/dayProgress';
import { formatHabitToMarkdown, parseHabitMarkdown } from '@/lib/habitMarkdown';
import { recalculateAllStreaks } from '@/lib/streak';





export function HabitTrackerClient() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
  const [userCategories, setUserCategories] = useLocalStorage<UserDefinedCategory[]>('userCategories', []);
  const { toast } = useToast();
  const t = useTranslations();
  const { language, setLanguage } = useLanguage();
  const dateLocale = language === 'ru' ? ru : enUS;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setHabits((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isCategorySettingsDialogOpen, setIsCategorySettingsDialogOpen] = useState(false);
  
  // State for compact habit view and analytics sections visibility
  const [isCompactHabitView, setIsCompactHabitView] = useLocalStorage<boolean>('compact_habit_view', false);
  const [isMinimalHabitView, setIsMinimalHabitView] = useLocalStorage<boolean>('minimal_habit_view', false);
  const [showStatsOverviewSection, setShowStatsOverviewSection] = useLocalStorage<boolean>('show_stats_overview_section', true);
  const [showWeeklyProgressSection, setShowWeeklyProgressSection] = useLocalStorage<boolean>('show_weekly_progress_section', true);
  
  const [openRouterSettings, setOpenRouterSettings] = useLocalStorage<OpenRouterSettings | null>('openrouter_settings', null);
  const [rawStoredUserAchievements, setStoredUserAchievements] = useLocalStorage<unknown>('unlocked_achievements', EMPTY_USER_ACHIEVEMENTS);
  const storedUserAchievements = useMemo(
    () => normalizeStoredUserAchievements(rawStoredUserAchievements),
    [rawStoredUserAchievements],
  );
  // Parsed import waiting for user confirmation before it replaces all data (see confirmImport).
  const [pendingImport, setPendingImport] = useState<{ habits: Habit[]; userCategories: UserDefinedCategory[] } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  useEffect(() => setMounted(true), []);
  


  const addHabit = (newHabitData: Omit<Habit, 'id' | 'completions' | 'createdAt' | 'streak'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: crypto.randomUUID(),
      completions: [],
      createdAt: new Date().toISOString(),
      type: newHabitData.type || 'positive',
      icon: newHabitData.icon || defaultIconKey,
      streak: 0, 
    };
    setHabits(prev => recalculateAllStreaks([...prev, newHabit]));
    toast({ title: t.toasts.habitAddedTitle, description: t.toasts.habitAddedDescription(newHabit.name) });
  };

  const editHabit = (updatedHabitData: Omit<Habit, 'id' | 'completions' | 'createdAt' | 'streak'>, id: string) => {
    setHabits(prev =>
      recalculateAllStreaks(prev.map(h => {
        if (h.id === id) {
          const originalCreatedAt = h.createdAt; 
          return {
            ...h, 
            ...updatedHabitData, 
            createdAt: h.createdAt || originalCreatedAt, 
            type: updatedHabitData.type || h.type,
            icon: updatedHabitData.icon || h.icon || defaultIconKey,
          };
        }
        return h;
      }))
    );
    toast({ title: t.toasts.habitUpdatedTitle, description: t.toasts.habitUpdatedDescription(updatedHabitData.name) });
  };

  const deleteHabit = (id: string) => {
    const habitToDelete = habits.find(h => h.id === id);
    setHabits(prev => recalculateAllStreaks(prev.filter(h => h.id !== id)));
    if (habitToDelete) {
      toast({ title: t.toasts.habitDeletedTitle, description: t.toasts.habitDeletedDescription(habitToDelete.name), variant: 'destructive' });
    }
  };

  const toggleHabitCompletion = (id: string, date: string, statusToSet: HabitStatus) => {
    setHabits(prevHabits => {
      const newHabits = prevHabits.map(h => {
        if (h.id === id) {
          const existingCompletionIndex = h.completions.findIndex(c => c.date === date);
          let newCompletions: HabitCompletion[];

          if (existingCompletionIndex > -1) { 
            const existingCompletion = h.completions[existingCompletionIndex];
            if (existingCompletion.status === statusToSet) { 
              newCompletions = h.completions.filter((_, index) => index !== existingCompletionIndex);
            } else { 
              newCompletions = [...h.completions];
              newCompletions[existingCompletionIndex] = { ...existingCompletion, status: statusToSet };
            }
          } else { 
            newCompletions = [...h.completions, { date, status: statusToSet }];
          }
          newCompletions.sort((a,b) => a.date.localeCompare(b.date)); 
          return { ...h, completions: newCompletions };
        }
        return h;
      });
      return recalculateAllStreaks(newHabits);
    });
  };

  const addUserCategoryHandler = (name: string, iconKey: string) => {
    if (!availableIcons[iconKey]) {
      toast({ title: t.toasts.invalidIconTitle, description: t.toasts.invalidIconDescription, variant: 'destructive' });
      return;
    }
    const newUserCategory: UserDefinedCategory = {
      id: crypto.randomUUID(),
      name,
      iconKey,
    };
    setUserCategories(prev => [...prev, newUserCategory]);
    toast({ title: t.toasts.categoryAddedTitle, description: t.toasts.categoryAddedDescription(name)});
  };
  
  const deleteUserCategoryHandler = (id: string) => {
    const categoryToDelete = userCategories.find(c => c.id === id);
    setUserCategories(prev => prev.filter(c => c.id !== id));
    if (categoryToDelete) {
      toast({ title: t.toasts.categoryDeletedTitle, description: t.toasts.categoryDeletedDescription(categoryToDelete.name), variant: 'destructive' });
    }
  };


  useEffect(() => {
    if (mounted) {
      setHabits(prev => recalculateAllStreaks(
        prev.map(h => ({
          ...h,
          createdAt: h.createdAt || new Date().toISOString(), 
          type: h.type || 'positive',
          icon: h.icon || defaultIconKey, 
          completions: (h.completions || []).map(c => ({
            ...c,
            status: c.status || 'completed' 
          }))
        }))
      ));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]); 

  const handleExportHabits = () => {
    if (habits.length === 0 && userCategories.length === 0) {
      toast({ title: t.toasts.exportEmptyTitle, description: t.toasts.exportEmptyDescription, variant: 'default' });
      return;
    }
    const habitsToExport = habits.map(h => ({
        ...h, 
        type: h.type || 'positive', 
        icon: h.icon || defaultIconKey,
        createdAt: h.createdAt || new Date().toISOString() 
    }));
    const markdownContent = formatHabitToMarkdown(habitsToExport, userCategories, language);
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'habits-export.md');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: t.toasts.exportSuccessTitle, description: t.toasts.exportSuccessDescription });
  };

  const handleImportHabits = (event: React.ChangeEvent<HTMLInputElement>) => {
    const resetFileInput = () => {
      event.target.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    const file = event.target.files?.[0];
    if (!file) {
      resetFileInput();
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const markdownContent = loadEvent.target?.result;
        if (typeof markdownContent !== 'string') throw new Error('Import did not produce text');
        const { habits: importedHabitData, userCategories: importedUserCategories } = parseHabitMarkdown(markdownContent, language);
        const newHabitsWithIdsAndStreak = importedHabitData.map(habit => ({
          ...habit,
          id: crypto.randomUUID(),
          streak: 0,
        }));
        const recalculatedHabits = recalculateAllStreaks(newHabitsWithIdsAndStreak);

        // Import is destructive (replaces all habits and categories) — require
        // explicit confirmation via the AlertDialog before applying it.
        setPendingImport({ habits: recalculatedHabits, userCategories: importedUserCategories });
      } catch (error) {
        console.error('Error importing data:', error);
        toast({ title: t.toasts.importErrorTitle, description: t.toasts.importErrorDescription, variant: 'destructive' });
      } finally {
        resetFileInput();
      }
    };
    reader.onerror = () => {
      toast({ title: t.toasts.importErrorTitle, description: t.toasts.importErrorDescription, variant: 'destructive' });
      resetFileInput();
    };
    reader.onabort = reader.onerror;
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    setHabits(pendingImport.habits);
    setUserCategories(pendingImport.userCategories);
    toast({ title: t.toasts.importSuccessTitle, description: t.toasts.importSuccessDescription(pendingImport.habits.length) });
    setPendingImport(null);
  };

  const handleSaveApiSettings = (settings: OpenRouterSettings) => {
    setOpenRouterSettings(settings);
    setIsApiKeyDialogOpen(false);
    toast({ title: t.toasts.aiSettingsSavedTitle, description: t.toasts.aiSettingsSavedDescription });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(startOfDay(date));
    }
  };

  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const goToToday = () => {
    setSelectedDate(startOfDay(new Date()));
  };
  
  const goToYesterday = () => {
    setSelectedDate(startOfDay(subDays(new Date(), 1)));
  };

  const goToDayBeforeYesterday = () => {
    setSelectedDate(startOfDay(subDays(new Date(), 2)));
  };

  // Достижения/уровень: разблокировки персистентны в localStorage под ключом
  // 'unlocked_achievements'; unlockedAt проставляется один раз при первой разблокировке,
  // а достижение не отзывается, если позже условие перестаёт выполняться.
  // Хуки обязаны выполняться до раннего return (Rules of Hooks).
  const userAchievements = useMemo(
    () => deriveUserAchievements(habits, storedUserAchievements),
    [habits, storedUserAchievements]
  );
  useEffect(() => {
    // `mounted` flips in the same commit in which useLocalStorage applies the stored
    // `habits` and `unlocked_achievements`, so once it is true both memo inputs are
    // the real persisted state. Writing any earlier would clobber storage with
    // placeholder-derived content (see getAchievementsToPersist). Persist only real
    // changes: updateUserAchievements returns a fresh object on every run, so
    // unchanged content must not produce a state or localStorage write.
    const next = getAchievementsToPersist(mounted, storedUserAchievements, userAchievements);
    if (next !== null) {
      setStoredUserAchievements(next);
    }
  }, [mounted, storedUserAchievements, userAchievements, setStoredUserAchievements]);
  const achievementsWithProgress = useMemo(
    () => getAllAchievementsWithProgress(habits, userAchievements),
    [habits, userAchievements]
  );
  const nextLevelThreshold = useMemo(() => {
    let points = userAchievements.totalPoints;
    const safetyLimit = points + 10000;
    while (calculateUserLevel(points) <= userAchievements.level && points < safetyLimit) {
      points++;
    }
    return points;
  }, [userAchievements]);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
        <ListChecks className="h-16 w-16 animate-pulse text-primary" />
        <p className="text-muted-foreground mt-4">{t.general.loadingHabits}</p>
      </div>
    );
  }

  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

  const xpPercent = Math.min(100, Math.round((userAchievements.totalPoints / nextLevelThreshold) * 100));
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="shrink-0 -rotate-2 rounded-panel border-2 border-border bg-[#23203A] px-4 py-2 font-display text-lg font-black uppercase text-[#F7F1E5] shadow-hard-xs dark:bg-[#F7F1E5] dark:text-[#23203A]">
            {t.general.appName}
          </div>

          <div className="shrink-0 rounded-full border-2 border-border bg-secondary px-3 py-1.5 font-display text-xs text-secondary-foreground shadow-hard-xs">
            {t.header.levelChip(userAchievements.level)}
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-1.5 font-mono text-xs lg:flex">
            <Flame className="h-3.5 w-3.5 text-primary" />
            {t.stats.cards.bestStreak} {bestStreak}
          </div>

          <p className="ml-auto font-mono text-[10.5px] text-muted-foreground">
            {t.header.xpProgress(userAchievements.totalPoints, nextLevelThreshold, userAchievements.level + 1)}
          </p>

          <div
            role="group"
            aria-label={t.languageSwitcher.label}
            className="hidden shrink-0 overflow-hidden rounded-[12px] border-2 border-border bg-card shadow-hard-xs lg:flex"
          >
            <button
              type="button"
              onClick={() => setLanguage('ru')}
              aria-label={t.languageSwitcher.russian}
              aria-pressed={language === 'ru'}
              className={cn(
                "px-[11px] py-[9px] font-mono text-[11px] uppercase ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                language === 'ru'
                  ? "bg-[#23203A] text-[#F7F1E5] dark:bg-[#F7F1E5] dark:text-[#23203A]"
                  : "bg-transparent text-muted-foreground"
              )}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-label={t.languageSwitcher.english}
              aria-pressed={language === 'en'}
              className={cn(
                "px-[11px] py-[9px] font-mono text-[11px] uppercase ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                language === 'en'
                  ? "bg-[#23203A] text-[#F7F1E5] dark:bg-[#F7F1E5] dark:text-[#23203A]"
                  : "bg-transparent text-muted-foreground"
              )}
            >
              EN
            </button>
          </div>

          <div className="order-last mt-1 h-4 w-full overflow-hidden rounded-full border-2 border-border bg-card">
            <div
              className="h-full rounded-full"
              style={{ width: `${xpPercent}%`, background: 'linear-gradient(90deg,#FF6B4A,#7C5CFF)' }}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <Button onClick={handleExportHabits} variant="outline" size="icon" className="h-[38px] w-[38px] rounded-[10px]" aria-label={t.header.exportAria}>
                <Download className="h-4 w-4" />
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="icon" className="h-[38px] w-[38px] rounded-[10px]" aria-label={t.header.importAria}>
                <Upload className="h-4 w-4" />
              </Button>
              <ThemeSwitcher />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImportHabits} accept=".md,text/markdown" className="hidden" />
            <Button onClick={() => setIsCategorySettingsDialogOpen(true)} variant="outline" size="icon" className="h-[38px] w-[38px] rounded-[10px]" aria-label={t.header.categorySettingsAria}>
              <Settings className="h-4 w-4" />
            </Button>
            <AddHabitDialog
              onSave={addHabit}
              availableIcons={availableIcons}
              userCategories={userCategories}
              triggerButton={
                <Button className="gap-2 font-bold uppercase">
                  <Plus className="h-4 w-4" />
                  <span className="hidden lg:inline">{t.addHabit.triggerLabel}</span>
                </Button>
              }
            />
          </div>
        </div>
      </header>

      <div className="mb-6 rounded-card border-2 border-border bg-card p-3 shadow-hard">
        <div className="flex items-center gap-2">
          <Button onClick={goToPreviousDay} variant="outline" size="icon" aria-label={t.dateNavigator.previousDayAria} className="h-11 w-11 shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex flex-1 items-center gap-1.5 overflow-x-auto lg:justify-between lg:overflow-visible">
            {weekDays.map(day => {
              const isFutureDay = isAfter(startOfDay(day), today);
              const isSelected = isSameDay(day, selectedDate);
              const dayProgress = getDayProgress(habits, day);
              // The success-1..4 fills are fixed light colors (not theme-aware), so the default
              // theme-aware foreground text (light in dark mode) becomes unreadable on them —
              // force the light-mode ink color whenever one of those fills is applied.
              const hasProgressFill = dayProgress.percentage > 0 && dayProgress.activeCount > 0;
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isFutureDay}
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-full border-2 border-border font-mono transition-all lg:h-[52px] lg:w-[52px]",
                    isFutureDay && "cursor-not-allowed border-dashed opacity-50",
                    isSelected && !isFutureDay && "bg-primary text-primary-foreground shadow-hard-xs",
                    !isSelected && !isFutureDay && getDayProgressColorClass(dayProgress.percentage, dayProgress.activeCount),
                    !isSelected && !isFutureDay && hasProgressFill && "text-[#23203A]"
                  )}
                >
                  <span className="text-[9px] uppercase leading-none">{format(day, 'EEEEE', { locale: dateLocale })}</span>
                  <span className="text-xs font-bold leading-none lg:text-sm">{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>

          <Button onClick={goToNextDay} variant="outline" size="icon" aria-label={t.dateNavigator.nextDayAria} disabled={isToday(selectedDate)} className="h-11 w-11 shrink-0">
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 font-mono text-xs"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">{format(selectedDate, "d MMM", { locale: dateLocale })}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                locale={dateLocale}
                disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t-2 border-dashed border-border pt-3">
          <button
            type="button"
            onClick={goToToday}
            disabled={isToday(selectedDate)}
            className={cn(
              "min-h-[44px] rounded-full border-2 border-border px-3 font-mono text-[11px] uppercase",
              isToday(selectedDate) ? "bg-foreground text-background" : "bg-card"
            )}
          >
            {t.general.today}
          </button>
          <button
            type="button"
            onClick={goToYesterday}
            disabled={isYesterday(selectedDate)}
            className={cn(
              "min-h-[44px] rounded-full border-2 border-border px-3 font-mono text-[11px] uppercase",
              isYesterday(selectedDate) ? "bg-foreground text-background" : "bg-card"
            )}
          >
            {t.general.yesterday}
          </button>
          <button
            type="button"
            onClick={goToDayBeforeYesterday}
            disabled={isSameDay(selectedDate, subDays(new Date(), 2))}
            className={cn(
              "min-h-[44px] rounded-full border-2 border-border px-3 font-mono text-[11px] uppercase",
              isSameDay(selectedDate, subDays(new Date(), 2)) ? "bg-foreground text-background" : "bg-card"
            )}
          >
            {t.general.dayBeforeYesterday}
          </button>
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {format(selectedDate, "PPP", { locale: dateLocale })}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="-rotate-1 rounded-[10px] border-2 border-border bg-amber px-2.5 py-1.5 font-display text-[10.5px] uppercase tracking-wider text-[#23203A]">
              {t.general.habitsBadge}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {habits.length} · {t.general.dragHint}
            </span>
          </div>

          {habits.length === 0 ? (
            <div className="rounded-card border-2 border-dashed border-border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFE9E3] dark:bg-muted">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="mx-auto mb-6 flex max-w-[220px] flex-col gap-2">
                <div className="h-2 rounded-full border-2 border-dashed border-border" />
                <div className="mx-auto h-2 w-4/5 rounded-full border-2 border-dashed border-border" />
                <div className="mx-auto h-2 w-3/5 rounded-full border-2 border-dashed border-border" />
              </div>
              <h2 className="mb-2 font-display text-xl font-black">{t.emptyState.title}</h2>
              <p className="mb-6 text-muted-foreground">{t.emptyState.description}</p>
              <AddHabitDialog
                onSave={addHabit}
                availableIcons={availableIcons}
                userCategories={userCategories}
                triggerButton={
                  <Button className="gap-2 font-bold uppercase">
                    <Plus className="h-4 w-4" />
                    {t.emptyState.action}
                  </Button>
                }
              />
            </div>
          ) : (
            // Streamlined view - continuous list without category headers
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={habits.map(h => h.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className={
                  isMinimalHabitView
                    ? "space-y-1"
                    : isCompactHabitView
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                      : "space-y-4"
                }>
                  {habits.map(habit => (
                    <HabitItem // This will be made sortable in the next step
                      key={habit.id}
                      habit={habit}
                      selectedDate={selectedDateString}
                      onToggleComplete={toggleHabitCompletion}
                      onDelete={deleteHabit}
                      onEdit={editHabit}
                      availableIcons={availableIcons}
                      userCategories={userCategories}
                      isCompactHabitView={isCompactHabitView}
                      isMinimalHabitView={isMinimalHabitView}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {showStatsOverviewSection && <StatsOverview habits={habits} />}
          {showWeeklyProgressSection && <WeeklyProgress habits={habits} />}
          <PersonalizedTipsSection
            habits={habits}
            openRouterSettings={openRouterSettings}
            onOpenSettingsDialog={() => setIsApiKeyDialogOpen(true)}
          />
          <AchievementsShelf achievements={achievementsWithProgress} userAchievements={userAchievements} />
        </div>
      </div>

      <ApiKeyDialog
        isOpen={isApiKeyDialogOpen}
        onClose={() => setIsApiKeyDialogOpen(false)}
        onSave={handleSaveApiSettings}
        currentSettings={openRouterSettings}
      />
      <CategorySettingsDialog
        isOpen={isCategorySettingsDialogOpen}
        onClose={() => setIsCategorySettingsDialogOpen(false)}
        userCategories={userCategories}
        onAddCategory={addUserCategoryHandler}
        onDeleteCategory={deleteUserCategoryHandler}
        onExportHabits={handleExportHabits}
        onImportHabitsClick={() => fileInputRef.current?.click()}

        isCompactHabitView={isCompactHabitView}
        onCompactHabitViewToggle={setIsCompactHabitView}
        isMinimalHabitView={isMinimalHabitView}
        onMinimalHabitViewToggle={setIsMinimalHabitView}
        showStatsOverviewSection={showStatsOverviewSection}
        onShowStatsOverviewSectionToggle={setShowStatsOverviewSection}
        showWeeklyProgressSection={showWeeklyProgressSection}
        onShowWeeklyProgressSectionToggle={setShowWeeklyProgressSection}
      />

      <AlertDialog
        open={pendingImport !== null}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.toasts.importConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.toasts.importConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.toasts.importConfirmCancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>{t.toasts.importConfirmConfirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

