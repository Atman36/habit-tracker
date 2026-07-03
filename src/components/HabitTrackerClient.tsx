'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Habit, HabitCompletion, OpenRouterSettings, HabitType, HabitStatus, UserDefinedCategory, UserAchievements } from '@/lib/types';
import useLocalStorage from '@/lib/localStorage';
import { AddHabitDialog } from './AddHabitDialog';
import { HabitItem } from './HabitItem';
import { PersonalizedTipsSection } from './PersonalizedTipsSection';
import { StatsOverview } from './StatsOverview';
import { WeeklyProgress } from './WeeklyProgress';
import { AchievementsShelf } from './AchievementsShelf';
import { updateUserAchievements, getAllAchievementsWithProgress, calculateUserLevel } from '@/lib/achievements';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { format, parseISO, isValid, subDays, isSameDay, startOfDay, addDays, isToday, isYesterday, startOfWeek, endOfWeek, eachDayOfInterval, isAfter } from 'date-fns';
import { ru } from 'date-fns/locale';
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { availableIcons, defaultIconKey } from '@/components/icons';

const EMPTY_USER_ACHIEVEMENTS: UserAchievements = {
  unlockedAchievements: [],
  totalPoints: 0,
  level: 1,
};

interface ParsedImportData {
  habits: Omit<Habit, 'id' | 'streak'>[];
  userCategories: UserDefinedCategory[];
}

const parseHabitMarkdown = (markdown: string): ParsedImportData => {
  const habits: Omit<Habit, 'id' | 'streak'>[] = [];
  const userCategories: UserDefinedCategory[] = [];
  
  const sections = markdown.split(/^# (Habits Export|User Categories Export|Standard Categories Export)$/m);
  let currentSection: 'habits' | 'user_categories' | 'standard_categories' | null = null;

  for (const sectionContent of sections) {
    const trimmedContent = sectionContent.trim();
    if (trimmedContent === 'Habits Export') {
      currentSection = 'habits';
      continue;
    } else if (trimmedContent === 'User Categories Export') {
      currentSection = 'user_categories';
      continue;
    } else if (trimmedContent === 'Standard Categories Export') {
      // This section is for AI reference, not direct app import, so we skip processing its content.
      currentSection = 'standard_categories'; 
      continue;
    }
    if (!currentSection || !trimmedContent) continue;

    if (currentSection === 'habits') {
      // Handle both old format and new category-based format
      let habitBlocks: string[];
      
      // Check if the content has category sections
      if (trimmedContent.includes('## Категория:')) {
        // New format with categories
        const categoryBlocks = trimmedContent.split(/^## Категория:/m).filter(block => block.trim().length > 0);
        habitBlocks = [];
        
        // Extract habit blocks from each category
        categoryBlocks.forEach(categoryBlock => {
          const habitBlocksInCategory = categoryBlock.split(/^---$/m)
            .map(block => block.trim())
            .filter(block => block.length > 0 && !block.startsWith('Категория:'));
          habitBlocks.push(...habitBlocksInCategory);
        });
      } else {
        // Old format without categories
        habitBlocks = trimmedContent.split(/^---$/m)
          .map(block => block.trim())
          .filter(block => block.length > 0);
      }
      
      habitBlocks.forEach(block => {
        const lines = block.split('\n');
        const habit: Partial<Omit<Habit, 'id' | 'streak'>> & { completions: HabitCompletion[] } = {
            completions: [],
            type: 'positive' 
        };
        let readingCompletions = false;

        lines.forEach(line => {
          line = line.trim();
          // Handle both old and new markdown header formats (## and ###)
          if (line.startsWith('## ') || line.startsWith('### ')) {
            habit.name = line.substring(line.indexOf(' ') + 1).trim();
          } else if (line.startsWith('- Description: ')) {
            habit.description = line.substring('- Description: '.length).trim();
          } else if (line.startsWith('- IconKey: ')) { 
            const iconKey = line.substring('- IconKey: '.length).trim();
            habit.icon = iconKey || defaultIconKey; 
          } else if (line.startsWith('- Goal: ')) {
            habit.goal = line.substring('- Goal: '.length).trim();
            
            // Generate specific goals if the goal is too generic
            if (habit.goal === 'цель' || habit.goal.toLowerCase() === 'goal' || !habit.goal) {
              // Generate a more specific goal based on the habit name and icon
              const iconKey = habit.icon || defaultIconKey;
              const iconInfo = availableIcons[iconKey];
              const habitCategory = iconInfo?.category || 'Общее';
              
              if (habitCategory === 'Здоровье и Фитнес') {
                habit.goal = 'Улучшить физическое здоровье и активность';
              } else if (habitCategory === 'Благополучие и Осознанность') {
                habit.goal = 'Достичь внутренней гармонии и спокойствия';
              } else if (habitCategory === 'Питание и Напитки') {
                habit.goal = 'Поддерживать здоровое питание';
              } else if (habitCategory === 'Развитие') {
                habit.goal = 'Постоянное личностное и профессиональное развитие';
              } else if (habitCategory === 'Продуктивность') {
                habit.goal = 'Повысить эффективность и результативность';
              } else if (habitCategory === 'Работа') {
                habit.goal = 'Достичь профессиональных успехов';
              } else if (habitCategory === 'Финансы') {
                habit.goal = 'Улучшить финансовое благополучие';
              } else if (habitCategory === 'Режим дня') {
                habit.goal = 'Оптимизировать распорядок дня';
              } else if (habitCategory === 'Хобби и Отдых') {
                habit.goal = 'Получать удовольствие от увлечений';
              } else if (habitCategory === 'Дом и Быт') {
                habit.goal = 'Поддерживать порядок и комфорт';
              } else if (habitCategory === 'Ограничения / Негативные привычки') {
                habit.goal = 'Избавиться от негативного влияния';
              } else {
                habit.goal = 'Регулярно выполнять и отслеживать прогресс';
              }
            }
          } else if (line.startsWith('- Frequency: ')) {
            habit.frequency = line.substring('- Frequency: '.length).trim() as Habit['frequency'];
          } else if (line.startsWith('- Type: ')) {
            habit.type = line.substring('- Type: '.length).trim() as HabitType;
          } else if (line.startsWith('- CreatedAt: ')) {
             const createdAtRaw = line.substring('- CreatedAt: '.length).trim();
             const createdAtDate = parseISO(createdAtRaw);
             if (isValid(createdAtDate)) {
                habit.createdAt = createdAtDate.toISOString();
             } else {
                console.warn(`Invalid CreatedAt date "${createdAtRaw}" for habit "${habit.name || 'Unknown'}". Using current date.`);
                habit.createdAt = new Date().toISOString();
             }
          } else if (line.startsWith('- Completions:')) {
            readingCompletions = true;
          } else if (readingCompletions && line.startsWith('- date: ')) {
            const parts = line.substring('- date: '.length).split(' | status: ');
            const dateRaw = parts[0].trim();
            const date = isValid(parseISO(dateRaw)) ? dateRaw : null;
            
            const statusAndNotes = parts[1]?.split(' (Notes: ');
            const status = (statusAndNotes?.[0].trim() as HabitStatus) || 'completed';
            const notes = statusAndNotes?.[1]?.endsWith(')') ? statusAndNotes[1].slice(0, -1).trim() : undefined;
            
            const validStatuses: HabitStatus[] = ['completed', 'failed', 'skipped'];
            const finalStatus = validStatuses.includes(status) ? status : 'completed';

            if (date) { 
              habit.completions?.push({ date, status: finalStatus, notes });
            } else if (dateRaw) {
              console.warn(`Invalid date format "${dateRaw}" in completions for habit "${habit.name || 'Unknown'}". Skipping completion.`);
            }
          }
        });

        if (habit.name && habit.frequency) {
          if (!habit.icon) habit.icon = defaultIconKey; 
          if (!habit.createdAt) habit.createdAt = new Date().toISOString();
          if (!habit.type) habit.type = 'positive';
          if (!habit.goal) habit.goal = 'Регулярно выполнять и отслеживать прогресс';
          habits.push(habit as Omit<Habit, 'id' | 'streak'>);
        } else {
          console.warn("Skipping habit due to missing name or frequency:", habit);
        }
      });
    } else if (currentSection === 'user_categories') {
        const categoryLines = trimmedContent.split('\n').filter(line => line.startsWith('- id: '));
        categoryLines.forEach(line => {
            const idMatch = line.match(/- id: ([\w-]+)/);
            const nameMatch = line.match(/name: ([^,]+),/);
            const iconKeyMatch = line.match(/iconKey: ([\w\d_]+)/); 

            if (idMatch && nameMatch && iconKeyMatch) {
                const id = idMatch[1].trim();
                const name = nameMatch[1].trim();
                const iconKey = iconKeyMatch[1].trim();
                if (availableIcons[iconKey]) { 
                    userCategories.push({ id, name, iconKey });
                } else {
                    console.warn(`Imported user category "${name}" has an invalid or missing iconKey: "${iconKey}". Skipping category.`);
                }
            }
        });
    }
  }
  return { habits, userCategories };
};

const formatHabitToMarkdown = (habits: Habit[], userCategories: UserDefinedCategory[]): string => {
  let markdown = "# Habits Export\n\n";
  
  // Group habits by category
  const habitsByCategory: Record<string, Habit[]> = {};
  const unknownCategoryKey = 'Без категории';
  
  // First pass - organize habits by their icon category
  habits.forEach(habit => {
    const iconKey = habit.icon || defaultIconKey;
    const iconInfo = availableIcons[iconKey];
    
    if (iconInfo) {
      const categoryName = iconInfo.category;
      if (!habitsByCategory[categoryName]) {
        habitsByCategory[categoryName] = [];
      }
      habitsByCategory[categoryName].push(habit);
    } else {
      if (!habitsByCategory[unknownCategoryKey]) {
        habitsByCategory[unknownCategoryKey] = [];
      }
      habitsByCategory[unknownCategoryKey].push(habit);
    }
  });
  
  // Second pass - output habits grouped by category
  Object.keys(habitsByCategory).sort().forEach(categoryName => {
    markdown += `## Категория: ${categoryName}\n\n`;
    
    habitsByCategory[categoryName].forEach(habit => {
      markdown += `---\n`;
      markdown += `### ${habit.name}\n`;
      if (habit.description) markdown += `- Description: ${habit.description}\n`;
      markdown += `- IconKey: ${habit.icon || defaultIconKey}\n`; 
      markdown += `- Goal: ${habit.goal}\n`;
      markdown += `- Frequency: ${habit.frequency}\n`;
      markdown += `- Type: ${habit.type || 'positive'}\n`;
      markdown += `- CreatedAt: ${habit.createdAt}\n`;
      if (habit.completions.length > 0) {
        markdown += `- Completions:\n`;
        [...habit.completions].sort((a,b) => a.date.localeCompare(b.date)).forEach(comp => {
          markdown += `  - date: ${comp.date} | status: ${comp.status}`;
          if (comp.notes) markdown += ` (Notes: ${comp.notes})`;
          markdown += `\n`;
        });
      }
      markdown += `---\n\n`;
    });
  });

  if (userCategories.length > 0) {
    markdown += "# User Categories Export\n\n";
    userCategories.forEach(category => {
      markdown += `- id: ${category.id}, name: ${category.name}, iconKey: ${category.iconKey}\n`;
    });
    markdown += "\n";
  }

  markdown += "# Standard Categories Export (for AI reference)\n";
  markdown += "## This section lists the main categories available in the application.\n";
  markdown += "## It is intended for AI assistants to correctly assign IconKey to habits.\n";
  markdown += "## The application itself does not import data from this section.\n\n";
  
  // Group icons by category
  const iconsByCategory: Record<string, {key: string, name: string}[]> = {};
  Object.entries(availableIcons).forEach(([key, iconOption]) => {
    const category = iconOption.category;
    if (!iconsByCategory[category]) {
      iconsByCategory[category] = [];
    }
    iconsByCategory[category].push({key, name: iconOption.name});
  });
  
  // Output grouped categories
  Object.keys(iconsByCategory).sort().forEach(category => {
    markdown += `### ${category}\n`;
    iconsByCategory[category].forEach(icon => {
      markdown += `- key: ${icon.key}, name: ${icon.name}\n`;
    });
    markdown += "\n";
  });

  return markdown;
};


function calculateStreak(completions: HabitCompletion[], frequency: Habit['frequency'], habitType: HabitType, createdAt: string): number {
  if (completions.length === 0) return 0;

  const sortedCompletions = [...completions]
    .filter(c => isValid(parseISO(c.date)))
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const habitStartDate = startOfDay(parseISO(createdAt));

  if (frequency === 'daily') {
    let streak = 0;
    let currentDateToCheck = startOfDay(new Date());

    // Don't check days before the habit was created or after today
    while (currentDateToCheck >= habitStartDate && !isAfter(currentDateToCheck, startOfDay(new Date()))) {
      const dateToCheckStr = format(currentDateToCheck, 'yyyy-MM-dd');
      const completionOnDate = sortedCompletions.find(c => c.date === dateToCheckStr);

      if (completionOnDate) {
        if (completionOnDate.status === 'completed') { // 'completed' means success for both positive & negative
          streak++;
        } else if (completionOnDate.status === 'failed') { // 'failed' means failure for both
          return streak; // Streak broken by a failure, return current accumulated streak before this failure
        }
        // 'skipped' does not break streak and does not count towards it.
      } else {
        // No completion record for this day.
        // If this day is today, the streak is based on previous days.
        // If this day is in the past (but on or after creation), it breaks the streak.
        if (!isSameDay(currentDateToCheck, startOfDay(new Date()))) { // If it's a past, unmarked day
             if (currentDateToCheck >= habitStartDate) { // And it's on or after the habit started
                return streak; // Streak broken
             }
        }
      }
      currentDateToCheck = subDays(currentDateToCheck, 1);
    }
    return streak;
  } else { 
    // For non-daily habits, a simpler streak: count consecutive 'completed' from most recent.
    let nonDailyStreak = 0;
    for (const comp of sortedCompletions) {
      if (parseISO(comp.date) < habitStartDate) continue; 

      if (comp.status === 'completed') {
        nonDailyStreak++;
      } else if (comp.status === 'failed') {
        break; 
      }
      // Skipped doesn't break or add.
    }
    return nonDailyStreak;
  }
}

export function HabitTrackerClient() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
  const [userCategories, setUserCategories] = useLocalStorage<UserDefinedCategory[]>('userCategories', []);
  const { toast } = useToast();

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
  
  // State for categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [categorizedHabits, setCategorizedHabits] = useState<{
    habitsByCategory: Record<string, Habit[]>;
    sortedCategories: string[];
  }>({ habitsByCategory: {}, sortedCategories: [] });
  
  // State for view mode toggle

  // State for compact habit view and analytics sections visibility
  const [isCompactHabitView, setIsCompactHabitView] = useLocalStorage<boolean>('compact_habit_view', false);
  const [isMinimalHabitView, setIsMinimalHabitView] = useLocalStorage<boolean>('minimal_habit_view', false);
  const [showStatsOverviewSection, setShowStatsOverviewSection] = useLocalStorage<boolean>('show_stats_overview_section', true);
  const [showWeeklyProgressSection, setShowWeeklyProgressSection] = useLocalStorage<boolean>('show_weekly_progress_section', true);
  
  // Create habit categories whenever habits change
  useEffect(() => {
    const habitsByCategory: Record<string, Habit[]> = {};
    const unknownCategoryKey = 'Без категории';
    
    // First pass - organize habits by their icon category
    habits.forEach(habit => {
      const iconKey = habit.icon || defaultIconKey;
      const iconInfo = availableIcons[iconKey];
      
      if (iconInfo) {
        const categoryName = iconInfo.category;
        if (!habitsByCategory[categoryName]) {
          habitsByCategory[categoryName] = [];
        }
        habitsByCategory[categoryName].push(habit);
      } else {
        if (!habitsByCategory[unknownCategoryKey]) {
          habitsByCategory[unknownCategoryKey] = [];
        }
        habitsByCategory[unknownCategoryKey].push(habit);
      }
    });
    
    // Sort categories alphabetically but keep 'Без категории' at the end if it exists
    const sortedCategories = Object.keys(habitsByCategory).sort((a, b) => {
      if (a === unknownCategoryKey) return 1;
      if (b === unknownCategoryKey) return -1;
      return a.localeCompare(b);
    });
    
    setCategorizedHabits({ habitsByCategory, sortedCategories });
    
    // Initialize expandedCategories for new categories
    const newExpandedState = {...expandedCategories};
    let hasChanges = false;
    
    sortedCategories.forEach(category => {
      if (expandedCategories[category] === undefined) {
        newExpandedState[category] = true; // Default to expanded
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setExpandedCategories(newExpandedState);
    }
  }, [habits, availableIcons]);
  
  const [openRouterSettings, setOpenRouterSettings] = useLocalStorage<OpenRouterSettings | null>('openrouter_settings', null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  useEffect(() => setMounted(true), []);
  
  const recalculateAllStreaks = useCallback((currentHabits: Habit[]): Habit[] => {
    return currentHabits.map(h => ({ ...h, streak: calculateStreak(h.completions, h.frequency, h.type, h.createdAt) }));
  }, []);

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
    toast({ title: 'Привычка добавлена', description: `"${newHabit.name}" успешно добавлена.` });
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
    toast({ title: 'Привычка обновлена', description: `"${updatedHabitData.name}" успешно обновлена.` });
  };

  const deleteHabit = (id: string) => {
    const habitToDelete = habits.find(h => h.id === id);
    setHabits(prev => recalculateAllStreaks(prev.filter(h => h.id !== id)));
    if (habitToDelete) {
      toast({ title: 'Привычка удалена', description: `"${habitToDelete.name}" удалена.`, variant: 'destructive' });
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
      toast({ title: 'Ошибка', description: 'Выбрана неверная иконка.', variant: 'destructive' });
      return;
    }
    const newUserCategory: UserDefinedCategory = {
      id: crypto.randomUUID(),
      name,
      iconKey,
    };
    setUserCategories(prev => [...prev, newUserCategory]);
    toast({ title: 'Категория добавлена', description: `Категория "${name}" успешно добавлена.`});
  };
  
  const deleteUserCategoryHandler = (id: string) => {
    const categoryToDelete = userCategories.find(c => c.id === id);
    setUserCategories(prev => prev.filter(c => c.id !== id));
    if (categoryToDelete) {
      toast({ title: 'Категория удалена', description: `Категория "${categoryToDelete.name}" удалена.`, variant: 'destructive' });
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
      toast({ title: 'Нет данных для экспорта', description: 'Добавьте привычки или категории, чтобы экспортировать их.', variant: 'default' });
      return;
    }
    const habitsToExport = habits.map(h => ({
        ...h, 
        type: h.type || 'positive', 
        icon: h.icon || defaultIconKey,
        createdAt: h.createdAt || new Date().toISOString() 
    }));
    const markdownContent = formatHabitToMarkdown(habitsToExport, userCategories);
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
    toast({ title: 'Данные экспортированы', description: 'Файл habits-export.md был успешно скачан.' });
  };

  const handleImportHabits = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const markdownContent = e.target?.result as string;
          const { habits: importedHabitData, userCategories: importedUserCategories } = parseHabitMarkdown(markdownContent);

          const newHabitsWithIdsAndStreak = importedHabitData.map(hData => ({
            ...hData,
            id: crypto.randomUUID(),
            createdAt: hData.createdAt || new Date().toISOString(), 
            type: hData.type || 'positive',
            icon: hData.icon || defaultIconKey, 
            completions: (hData.completions || []).map(c => ({...c, status: c.status || 'completed'})),
            streak: 0, 
          }));
          
          setHabits(recalculateAllStreaks(newHabitsWithIdsAndStreak)); 
          
          if (importedUserCategories.length > 0) {
            setUserCategories(prevUserCategories => {
              const existingIds = new Set(prevUserCategories.map(uc => uc.id));
              const newUniqueCategories = importedUserCategories.filter(iuc => {
                if (!availableIcons[iuc.iconKey]) { 
                  console.warn(`Imported user category "${iuc.name}" uses an invalid iconKey "${iuc.iconKey}". Skipping this user category.`);
                  return false;
                }
                return !existingIds.has(iuc.id);
              });
              return [...prevUserCategories, ...newUniqueCategories];
            });
          }
          toast({ title: 'Данные импортированы', description: `${newHabitsWithIdsAndStreak.length} привычек успешно импортировано.` });
        } catch (error) {
          console.error("Error importing data:", error);
          toast({ title: 'Ошибка импорта', description: 'Не удалось обработать файл. Убедитесь, что формат корректен.', variant: 'destructive' });
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; 
            }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSaveApiSettings = (settings: OpenRouterSettings) => {
    setOpenRouterSettings(settings);
    setIsApiKeyDialogOpen(false);
    toast({ title: 'Настройки AI сохранены', description: 'Теперь вы можете получать персональные советы с выбранными параметрами.' });
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

  // Достижения/уровень: производные данные из habits (см. lib/achievements.ts).
  // Не персистентны — пересчитываются от пустой базы при каждом изменении habits.
  // Хуки обязаны выполняться до раннего return (Rules of Hooks).
  const userAchievements = useMemo(
    () => updateUserAchievements(habits, EMPTY_USER_ACHIEVEMENTS),
    [habits]
  );
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
        <p className="text-muted-foreground mt-4">Загрузка привычек...</p>
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

  const getDayCompletionRatio = (day: Date): number => {
    if (habits.length === 0) return 0;
    const dayString = format(day, 'yyyy-MM-dd');
    const completedCount = habits.filter(h =>
      h.completions.some(c => c.date === dayString && c.status === 'completed')
    ).length;
    return completedCount / habits.length;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="shrink-0 -rotate-2 rounded-panel border-2 border-border bg-[#F7F1E5] px-4 py-2 font-display text-lg font-black uppercase text-[#23203A] shadow-hard-xs">
            ПРИВЫЧКА!
          </div>

          <div className="shrink-0 rounded-full border-2 border-border bg-secondary px-3 py-1.5 font-display text-xs text-secondary-foreground shadow-hard-xs">
            УР. {userAchievements.level}
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-1.5 font-mono text-xs lg:flex">
            <Flame className="h-3.5 w-3.5 text-primary" />
            {bestStreak}
          </div>

          <div className="order-last w-full lg:order-none lg:w-auto lg:flex-1">
            <div className="h-4 w-full overflow-hidden rounded-full border-2 border-border bg-card">
              <div
                className="h-full rounded-full"
                style={{ width: `${xpPercent}%`, background: 'linear-gradient(90deg,#FF6B4A,#7C5CFF)' }}
              />
            </div>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              {userAchievements.totalPoints} / {nextLevelThreshold} очков до ур. {userAchievements.level + 1}
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <Button onClick={handleExportHabits} variant="outline" size="icon" className="h-[38px] w-[38px] rounded-[10px]" aria-label="Экспорт в Markdown">
                <Download className="h-4 w-4" />
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="icon" className="h-[38px] w-[38px] rounded-[10px]" aria-label="Импорт из Markdown">
                <Upload className="h-4 w-4" />
              </Button>
              <ThemeSwitcher />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImportHabits} accept=".md,text/markdown" className="hidden" />
            <Button onClick={() => setIsCategorySettingsDialogOpen(true)} variant="outline" size="icon" className="h-[38px] w-[38px] rounded-[10px]" aria-label="Настройки категорий">
              <Settings className="h-4 w-4" />
            </Button>
            <AddHabitDialog
              onSave={addHabit}
              availableIcons={availableIcons}
              userCategories={userCategories}
              triggerButton={
                <Button className="gap-2 font-bold uppercase">
                  <Plus className="h-4 w-4" />
                  <span className="hidden lg:inline">Добавить привычку</span>
                </Button>
              }
            />
          </div>
        </div>
      </header>

      <div className="mb-6 rounded-card border-2 border-border bg-card p-3 shadow-hard">
        <div className="flex items-center gap-2">
          <Button onClick={goToPreviousDay} variant="outline" size="icon" aria-label="Предыдущий день" className="h-11 w-11 shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex flex-1 items-center gap-1.5 overflow-x-auto lg:justify-between lg:overflow-visible">
            {weekDays.map(day => {
              const isFutureDay = isAfter(startOfDay(day), today);
              const isSelected = isSameDay(day, selectedDate);
              const ratio = getDayCompletionRatio(day);
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
                    !isSelected && !isFutureDay && ratio >= 0.75 && "bg-success-4",
                    !isSelected && !isFutureDay && ratio >= 0.4 && ratio < 0.75 && "bg-success-3",
                    !isSelected && !isFutureDay && ratio > 0 && ratio < 0.4 && "bg-amber",
                    !isSelected && !isFutureDay && ratio === 0 && "bg-card"
                  )}
                >
                  <span className="text-[9px] uppercase leading-none">{format(day, 'EEEEE', { locale: ru })}</span>
                  <span className="text-xs font-bold leading-none lg:text-sm">{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>

          <Button onClick={goToNextDay} variant="outline" size="icon" aria-label="Следующий день" disabled={isToday(selectedDate)} className="h-11 w-11 shrink-0">
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 font-mono text-xs"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">{format(selectedDate, "d MMM", { locale: ru })}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                locale={ru}
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
            Сегодня
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
            Вчера
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
            Позавчера
          </button>
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {format(selectedDate, "PPP", { locale: ru })}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-3 inline-block rounded-full border-2 border-border bg-card px-3 py-1 font-mono text-[11px] uppercase">
            Привычки · {habits.length}
          </div>

          {habits.length === 0 ? (
            <div className="rounded-card border-2 border-dashed border-border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-panel bg-[#FFE9E3] dark:bg-muted">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="mx-auto mb-6 flex max-w-[220px] flex-col gap-2">
                <div className="h-2 rounded-full border-2 border-dashed border-border" />
                <div className="mx-auto h-2 w-4/5 rounded-full border-2 border-dashed border-border" />
                <div className="mx-auto h-2 w-3/5 rounded-full border-2 border-dashed border-border" />
              </div>
              <h2 className="mb-2 font-display text-xl font-black">Пока нет привычек</h2>
              <p className="mb-6 text-muted-foreground">Начните отслеживать свои привычки, чтобы достигать целей!</p>
              <AddHabitDialog
                onSave={addHabit}
                availableIcons={availableIcons}
                userCategories={userCategories}
                triggerButton={
                  <Button className="gap-2 font-bold uppercase">
                    <Plus className="h-4 w-4" />
                    Добавить первую привычку
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

        isCompactHabitView={isCompactHabitView}
        onCompactHabitViewToggle={setIsCompactHabitView}
        isMinimalHabitView={isMinimalHabitView}
        onMinimalHabitViewToggle={setIsMinimalHabitView}
        showStatsOverviewSection={showStatsOverviewSection}
        onShowStatsOverviewSectionToggle={setShowStatsOverviewSection}
        showWeeklyProgressSection={showWeeklyProgressSection}
        onShowWeeklyProgressSectionToggle={setShowWeeklyProgressSection}
      />
    </div>
  );
}

