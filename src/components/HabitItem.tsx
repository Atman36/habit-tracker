'use client';

import { useMemo } from 'react';
import type { Habit, HabitStatus, IconOption, UserDefinedCategory } from '@/lib/types';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getIconComponent, availableIcons as allAvailableIcons, defaultIconKey } from '@/components/icons';
import { format, parseISO, startOfWeek, startOfDay, addDays, isAfter, isSameDay } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';
import { Flame, Trash2, TrendingUp, CalendarDays, Check, X, Plus, Shield, AlertTriangle, RotateCcw, Hand, SkipForward, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AddHabitDialog } from './AddHabitDialog';
import { ProgressChartClient } from './ProgressChartClient';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations, useLanguage } from '@/components/LanguageProvider';
import { getLocalizedIconName } from '@/lib/iconLocalization';

interface HabitItemProps {
  habit: Habit;
  selectedDate: string;
  onToggleComplete: (id: string, date: string, status: HabitStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Omit<Habit, 'id' | 'completions' | 'createdAt' | 'streak'>, id: string) => void;
  availableIcons: Record<string, IconOption>;
  userCategories: UserDefinedCategory[];
  isCompactHabitView?: boolean;
  isMinimalHabitView?: boolean;
}

// Pastel icon-tile backgrounds (light theme), cycled deterministically by category name.
const PASTEL_TILE_CLASSES = ['bg-[#FFE9E3]', 'bg-[#E3F2FF]', 'bg-[#F0EBFF]', 'bg-[#FFF4D6]'];

function hashString(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function HabitItem({
  habit,
  selectedDate,
  onToggleComplete,
  onDelete,
  onEdit,
  availableIcons,
  userCategories,
  isCompactHabitView,
  isMinimalHabitView
}: HabitItemProps) {
  const t = useTranslations();
  const { language } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    position: 'relative' as 'relative', // Ensure type correctness for style prop
  };

  const completionForSelectedDate = habit.completions.find(c => c.date === selectedDate);
  const isCompletedOnSelectedDate = completionForSelectedDate?.status === 'completed';
  const isFailedOnSelectedDate = completionForSelectedDate?.status === 'failed';
  const isSkippedOnSelectedDate = completionForSelectedDate?.status === 'skipped';

  const IconComponent = getIconComponent(habit.icon);
  const isIconGrayscale = isFailedOnSelectedDate || isSkippedOnSelectedDate;
  const dateLocale = language === 'ru' ? ru : enUS;

  const handleAction = (status: HabitStatus) => {
    onToggleComplete(habit.id, selectedDate, status);
  };

  // Category display name (used in the meta line only — see the pastel hash key below for why
  // the tile color must NOT be derived from this localized string).
  const uniqueSelectedValue = determineInitialIconValueForItem(habit, userCategories);
  let habitCategoryDisplayName = habit.icon ? getLocalizedIconName(habit.icon, language) : t.addHabit.form.categoryLabel;

  if (uniqueSelectedValue.startsWith('user:')) {
    const userId = uniqueSelectedValue.substring('user:'.length);
    const userCat = userCategories.find(uc => uc.id === userId);
    if (userCat) {
      habitCategoryDisplayName = userCat.name;
    }
  }

  const frequencyLabel = habit.frequency === 'daily'
    ? t.addHabit.form.frequencyDaily
    : habit.frequency === 'weekly'
      ? t.addHabit.form.frequencyWeekly
      : t.addHabit.form.frequencyMonthly;

  // Pastel tile color must stay stable across language switches, so hash a language-independent
  // key: the raw (unlocalized) category string from availableIcons, or the icon key itself.
  const pastelHashKey = (habit.icon && allAvailableIcons[habit.icon])
    ? allAvailableIcons[habit.icon].category
    : (habit.icon || defaultIconKey);
  const pastelTileClass = PASTEL_TILE_CLASSES[hashString(pastelHashKey) % PASTEL_TILE_CLASSES.length];

  // A streak is treated as a "personal record" once it reaches the first achievement
  // milestone already used elsewhere in the app (see src/lib/achievements.ts, `first_week`).
  const isPersonalRecord = habit.streak >= 7;

  // Border color for the card, tinted to the day's status (see DESIGN-SPEC "Card status coding").
  const getCardBorderClass = () => {
    if (isSkippedOnSelectedDate) return 'border-dashed border-border/35';
    if (isFailedOnSelectedDate) return 'border-primary';
    if (isCompletedOnSelectedDate) {
      return habit.type === 'positive' ? 'border-success-3' : 'border-secondary';
    }
    return 'border-border';
  };

  // The hard-shadow color needs to match the border above. Custom `shadow-hard` bakes its
  // color directly into `--tw-shadow`, so overriding it via the usual `shadow-{color}` utility
  // gets stripped by tailwind-merge (both share the `shadow-hard` prefix) once Card's own
  // className merge runs, and the two-class trick never reaches the DOM. An `!`-important
  // arbitrary-value box-shadow sidesteps that: it survives the merge and always wins the cascade.
  const getCardShadowClass = () => {
    if (isDragging) return '!shadow-[0_10px_0_hsl(var(--border))]';
    if (isSkippedOnSelectedDate) return '';
    if (isFailedOnSelectedDate) return '!shadow-[0_4px_0_hsl(var(--primary))]';
    if (isCompletedOnSelectedDate) {
      return habit.type === 'positive' ? '!shadow-[0_4px_0_#7CC93F]' : '!shadow-[0_4px_0_hsl(var(--secondary))]';
    }
    return '';
  };

  // "Week battery": 7 cells for the current calendar week (Mon-Sun), independent of selectedDate.
  // isToday/isFuture are tracked independently of isDone so today's cell always gets a coral
  // border regardless of whether it's filled (see mock screen 2a).
  const weekBatteryDays = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      const dateString = format(day, 'yyyy-MM-dd');
      const completion = habit.completions.find(c => c.date === dateString);
      return {
        dateString,
        isDone: completion?.status === 'completed',
        isToday: isSameDay(day, now),
        isFuture: isAfter(startOfDay(day), startOfDay(now)),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habit.completions]);
  const weekDoneCount = weekBatteryDays.filter(d => d.isDone).length;

  // Minimal view: just a single line with checkbox and name
  if (isMinimalHabitView) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 bg-card border rounded-panel hover:bg-muted/50 transition-colors",
          getCardBorderClass(),
          isSkippedOnSelectedDate && "opacity-85",
          isDragging && "rotate-[-1.2deg] opacity-90"
        )}
      >
        {/* Drag handle */}
        <div {...attributes} {...listeners} className={cn("cursor-grab touch-none", isDragging ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
          <GripVertical className="h-3.5 w-3.5" />
        </div>

        {/* Habit icon */}
        <IconComponent className={cn("h-4 w-4 text-primary flex-shrink-0", isIconGrayscale && "grayscale")} />

        {/* Habit name */}
        <span className="flex-grow min-w-0 truncate font-sans text-sm font-medium">{habit.name}</span>

        {/* Streak */}
        <span className="flex items-center gap-0.5 font-mono text-[10px] text-muted-foreground flex-shrink-0">
          <Flame className={cn("h-3 w-3", habit.streak > 0 ? 'text-primary' : 'text-muted-foreground')} />
          {habit.streak}
        </span>

        {/* Circle checkbox for completion */}
        <button
          type="button"
          role="checkbox"
          aria-checked={isCompletedOnSelectedDate}
          onClick={() => handleAction(isCompletedOnSelectedDate ? 'failed' : 'completed')}
          aria-label={isCompletedOnSelectedDate
            ? (habit.type === 'positive' ? t.habitItem.aria.markedComplete : t.habitItem.aria.markedResisted)
            : (habit.type === 'positive' ? t.habitItem.aria.markComplete : t.habitItem.aria.markResisted)}
          className={cn(
            "flex items-center justify-center h-5 w-5 rounded-full border-2 border-border flex-shrink-0",
            isCompletedOnSelectedDate ? (habit.type === 'negative' ? "bg-secondary text-secondary-foreground" : "bg-success-3 text-foreground") : "bg-card"
          )}
        >
          {isCompletedOnSelectedDate && <Check className="h-3 w-3" />}
        </button>
      </div>
    );
  }

  // Right-side action cluster for positive habits: big circle (unmarked/completed/failed,
  // each with its own micro-label) + small ✕ / trash (or undo) buttons.
  const renderPositiveActionCluster = () => {
    const circleState: 'completed' | 'failed' | 'unmarked' = isCompletedOnSelectedDate ? 'completed' : isFailedOnSelectedDate ? 'failed' : 'unmarked';
    return (
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => handleAction('completed')}
          aria-label={
            circleState === 'completed' ? t.habitItem.aria.markedComplete
              : circleState === 'failed' ? t.habitItem.aria.markedFailed
              : t.habitItem.aria.markComplete
          }
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 h-[58px] w-[58px] rounded-full border-2 transition-all active:scale-95",
            circleState === 'completed' && "bg-accent border-border !shadow-[0_4px_0_hsl(var(--border))] text-accent-foreground",
            circleState === 'failed' && "bg-primary border-border !shadow-[0_4px_0_hsl(var(--border))] text-primary-foreground",
            circleState === 'unmarked' && "border-dashed border-primary bg-card text-primary"
          )}
        >
          {circleState === 'completed' && <Check className="h-7 w-7" />}
          {circleState === 'failed' && <X className="h-7 w-7" />}
          {circleState === 'unmarked' && <Plus className="h-7 w-7" />}
          <span className={cn("font-mono text-[7.5px] uppercase leading-none", circleState === 'unmarked' && "text-muted-foreground")}>
            {circleState === 'completed' ? t.habitItem.doneLabel : circleState === 'failed' ? t.habitItem.failLabel : t.habitItem.markLabel}
          </span>
        </button>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleAction('failed')}
            aria-label={isFailedOnSelectedDate ? t.habitItem.aria.markedFailed : t.habitItem.aria.markFailed}
            className="flex items-center justify-center h-[26px] w-[26px] rounded-[9px] border-2 border-border bg-card shadow-hard-xs active:translate-y-[1px] active:shadow-none transition-all"
          >
            <X className="h-3.5 w-3.5 text-primary" />
          </button>
          {isFailedOnSelectedDate ? (
            <button
              type="button"
              onClick={() => handleAction('failed')}
              aria-label={t.habitItem.aria.markedFailed}
              className="flex items-center justify-center h-[26px] w-[26px] rounded-[9px] border-2 border-border bg-card shadow-hard-xs active:translate-y-[1px] active:shadow-none transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete(habit.id)}
              aria-label={t.habitItem.aria.deleteHabit}
              className="flex items-center justify-center h-[26px] w-[26px] rounded-[9px] border-2 border-border bg-card shadow-hard-xs opacity-[.65] active:translate-y-[1px] active:shadow-none transition-all"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Right-side action cluster for negative (stop) habits: state circle + trash.
  // The three pill buttons (Resisted!/Relapsed/Skip) are rendered separately, below the header row.
  const renderNegativeActionCluster = () => {
    const circleState: 'held' | 'broken' | 'neutral' = isCompletedOnSelectedDate ? 'held' : isFailedOnSelectedDate ? 'broken' : 'neutral';
    return (
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
        <div className={cn(
          "flex flex-col items-center justify-center h-[58px] w-[58px] rounded-full border-2 gap-0.5",
          circleState === 'held' && "bg-border border-border text-[#F7F1E5] shadow-hard-xs",
          circleState === 'broken' && "bg-card border-primary text-primary",
          circleState === 'neutral' && "border-dashed border-secondary bg-card text-secondary"
        )}>
          {circleState === 'held' && <Hand className="h-5 w-5" />}
          {circleState === 'broken' && <AlertTriangle className="h-5 w-5" />}
          {circleState === 'neutral' && <Shield className="h-5 w-5" />}
          {circleState !== 'neutral' && (
            <span className="font-mono text-[8px] uppercase leading-none">{circleState === 'held' ? t.habitItem.holdingLabel : t.habitItem.relapseLabel}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(habit.id)}
          aria-label={t.habitItem.aria.deleteHabit}
          className="flex items-center justify-center h-[26px] w-[26px] rounded-[9px] border-2 border-border bg-card shadow-hard-xs opacity-[.65] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </button>
      </div>
    );
  };

  // The three pill action buttons for negative (stop) habits.
  const renderNegativePills = () => {
    const pillBase = "flex items-center justify-center gap-1.5 rounded-full border-2 px-2 py-1.5 text-xs font-sans font-semibold transition-all active:translate-y-[1px] active:shadow-none";
    return (
      <div className="grid grid-cols-3 gap-2 px-4 pb-3">
        <button
          type="button"
          onClick={() => handleAction('completed')}
          aria-label={isCompletedOnSelectedDate ? t.habitItem.aria.markedResisted : t.habitItem.aria.markResisted}
          className={cn(
            pillBase,
            isCompletedOnSelectedDate
              ? "bg-secondary text-white border-border !shadow-[0_2px_0_hsl(var(--border))]"
              : "bg-card text-secondary border-secondary/50"
          )}
        >
          <Shield className="h-3.5 w-3.5" /> {isCompletedOnSelectedDate ? t.habitItem.negativeCompleted : t.habitItem.negativeComplete}
        </button>
        <button
          type="button"
          onClick={() => handleAction('failed')}
          aria-label={isFailedOnSelectedDate ? t.habitItem.aria.markedRelapse : t.habitItem.aria.markRelapse}
          className={cn(
            pillBase,
            isFailedOnSelectedDate
              ? "bg-primary text-primary-foreground border-border !shadow-[0_2px_0_hsl(var(--border))]"
              : "bg-card text-primary dark:text-[#FF9B85] border-primary/50"
          )}
        >
          <AlertTriangle className="h-3.5 w-3.5" /> {isFailedOnSelectedDate ? t.habitItem.negativeFailedCompleted : t.habitItem.negativeFailed}
        </button>
        <button
          type="button"
          onClick={() => handleAction('skipped')}
          aria-label={isSkippedOnSelectedDate ? t.habitItem.negativeSkipAria.checked : t.habitItem.negativeSkipAria.unchecked}
          className={cn(
            pillBase,
            isSkippedOnSelectedDate
              ? "bg-border text-[#F7F1E5] border-border"
              : "bg-card text-muted-foreground border-border/30"
          )}
        >
          <SkipForward className="h-3.5 w-3.5" /> {t.habitItem.skip}
        </button>
      </div>
    );
  };

  // Compact view: icon tile + title row, then a row with ✓/✕ 22px buttons + streak + drag handle.
  const renderCompactBottomRow = () => (
    <div className="flex items-center justify-between px-3 pb-3 mt-auto">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleAction('completed')}
          aria-label={isCompletedOnSelectedDate ? t.habitItem.aria.markedComplete : t.habitItem.aria.markComplete}
          className={cn(
            "flex items-center justify-center h-[22px] w-[22px] rounded-[6px] border-2 border-border",
            isCompletedOnSelectedDate ? (habit.type === 'negative' ? "bg-secondary text-secondary-foreground" : "bg-success-3 text-foreground") : "bg-card text-muted-foreground"
          )}
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => handleAction('failed')}
          aria-label={isFailedOnSelectedDate ? t.habitItem.aria.markedFailed : t.habitItem.aria.markFailed}
          className={cn(
            "flex items-center justify-center h-[22px] w-[22px] rounded-[6px] border-2 border-border",
            isFailedOnSelectedDate ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
          )}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-0.5 font-mono text-[10px] text-muted-foreground">
          <Flame className={cn("h-3 w-3", habit.streak > 0 ? 'text-primary' : 'text-muted-foreground')} />
          {habit.streak}
        </span>
        <div {...attributes} {...listeners} className={cn("cursor-grab touch-none", isDragging ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col",
        getCardBorderClass(),
        getCardShadowClass(),
        isSkippedOnSelectedDate && "opacity-85",
        isDragging && "rotate-[-1.2deg] opacity-90",
        habit.type === 'negative' && "bg-stop-bg dark:bg-card",
        isCompactHabitView ? "h-full" : ""
      )}
    >
      <div className={cn("flex items-start gap-3", isCompactHabitView ? "p-3" : "p-4 pb-2")}>
        {/* Drag handle */}
        {!isCompactHabitView && (
          <div {...attributes} {...listeners} className={cn("cursor-grab touch-none pt-1", isDragging ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {/* Icon tile + title/meta/week-battery (clickable to edit), or compact icon+title */}
        {!isCompactHabitView ? (
          <AddHabitDialog
            existingHabit={habit}
            onSave={(updatedHabitData) => onEdit(updatedHabitData, habit.id)}
            availableIcons={availableIcons}
            userCategories={userCategories}
            triggerButton={
              <div className="flex-grow flex items-start gap-3 min-w-0 cursor-pointer hover:bg-muted/50 p-1 -ml-1 rounded-panel">
                <div className={cn("h-[52px] w-[52px] rounded-panel border-2 border-border flex items-center justify-center flex-shrink-0 dark:bg-muted", pastelTileClass)}>
                  <IconComponent className={cn("h-7 w-7", isIconGrayscale && "grayscale")} />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CardTitle className="text-[15px] font-sans font-bold leading-tight truncate">{habit.name}</CardTitle>
                    <div className={cn(
                      "inline-flex items-center gap-1 rounded-full border-2 border-border px-2 py-0.5 font-mono text-[11px] shrink-0",
                      isPersonalRecord ? "bg-amber" : "bg-[#F7F1E5] dark:bg-[#201A38] dark:border-[rgba(242,238,255,0.3)]"
                    )}>
                      <Flame className={cn("h-3 w-3", habit.streak > 0 ? 'text-primary' : 'text-muted-foreground')} />
                      <span>{habit.streak}{isPersonalRecord && ` · ${t.habitItem.recordSuffix}`}</span>
                    </div>
                    {habit.type === 'negative' && (
                      <Badge variant="destructive" className="shrink-0 font-display text-[8px] tracking-[.06em] border-[1.5px]">{t.habitItem.stopBadge}</Badge>
                    )}
                  </div>
                  {habit.type === 'negative' && isFailedOnSelectedDate ? (
                    <p className="font-sans text-[11.5px] font-bold text-primary truncate mt-0.5">{t.habitItem.streakResetToday}</p>
                  ) : (
                    <p className="font-mono text-xs text-muted-foreground truncate mt-0.5">
                      {habitCategoryDisplayName} · {frequencyLabel}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    {weekBatteryDays.map(({ dateString, isDone, isToday, isFuture }) => (
                      <div
                        key={dateString}
                        className={cn(
                          "h-[13px] w-5 rounded-[4px] border-[1.5px]",
                          isDone ? "bg-success-3" : "bg-card",
                          isToday ? "border-primary" : isFuture ? "border-border/25" : "border-border"
                        )}
                      />
                    ))}
                    <span className="font-mono text-[10px] text-muted-foreground ml-1 whitespace-nowrap">{t.habitItem.weekCounter(weekDoneCount)}</span>
                  </div>
                </div>
              </div>
            }
          />
        ) : (
          <div className="flex-grow flex items-center gap-2 min-w-0">
            <div className={cn("h-10 w-10 rounded-panel border-2 border-border flex items-center justify-center flex-shrink-0 dark:bg-muted", pastelTileClass)}>
              <IconComponent className={cn("h-5 w-5", isIconGrayscale && "grayscale")} />
            </div>
            <CardTitle className="text-[13px] font-sans font-bold truncate">{habit.name}</CardTitle>
          </div>
        )}

        {/* Right action cluster */}
        {!isCompactHabitView && (habit.type === 'positive' ? renderPositiveActionCluster() : renderNegativeActionCluster())}
      </div>

      {!isCompactHabitView && habit.type === 'negative' && renderNegativePills()}
      {isCompactHabitView && renderCompactBottomRow()}

      {/* Progress and History Accordion - only show if not in compact view */}
      {!isCompactHabitView && (
        <CardContent className="pt-0 px-4 pb-3">
          <Accordion type="multiple" className="w-full space-y-2 text-muted-foreground">
            <AccordionItem value="progress" className="border-b-0">
              <AccordionTrigger className="flex-none w-fit py-1.5 px-3 rounded-full border-2 border-border bg-card font-mono text-[11px] shadow-hard-xs hover:no-underline [&>svg]:h-3.5 [&>svg]:w-3.5">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5"/> {t.habitItem.showProgress}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                 <ProgressChartClient habit={habit} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="history" className="border-b-0">
              <AccordionTrigger className="flex-none w-fit py-1.5 px-3 rounded-full border-2 border-border bg-card font-mono text-[11px] shadow-hard-xs hover:no-underline [&>svg]:h-3.5 [&>svg]:w-3.5">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5"/> {t.habitItem.showHistory}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {habit.completions.length > 0 ? (
                  <ul className="space-y-1 text-sm text-muted-foreground max-h-32 overflow-y-auto">
                    {[...habit.completions]
                      .sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
                      .map(comp => (
                      <li key={comp.date} className="text-xs flex items-center">
                        {format(parseISO(comp.date), 'PPP', { locale: dateLocale })}:
                        {comp.status === 'completed' && (
                          <Check className={cn(
                              "h-3 w-3 ml-1.5",
                              habit.type === 'positive' ? 'text-success-4' : 'text-secondary'
                           )} />
                        )}
                         {comp.status === 'failed' && (
                          <X className="h-3 w-3 ml-1.5 text-primary" />
                        )}
                        {comp.notes && <span className="italic text-muted-foreground ml-1"> - {comp.notes}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">{t.habitItem.noHistory}</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
}

// Helper function specifically for HabitItem to determine the value for displaying category name logic.
// It aims to correctly identify if a habit's icon links to a user-defined category
// for display purposes, or if it's a standard icon.
const determineInitialIconValueForItem = (
  habit: Habit | undefined,
  userCategories: UserDefinedCategory[]
): string => {
  if (habit?.icon) {
    const iconKey = habit.icon; // This is the base icon key (e.g., "BookOpen")

    // Check if any user-defined category uses this iconKey AND has a name that matches the habit's name.
    // This is a heuristic. A more robust solution would be to store userCategoryId on the habit if it was selected via a user category.
    // Since we don't store that, we try to infer.
    const matchingUserCat = userCategories.find(
      (uc) => uc.iconKey === iconKey && uc.name === habit.name // This exact name match is a strong indicator
    );

    if (matchingUserCat) {
      return `user:${matchingUserCat.id}`;
    }

    // If no exact name match, but a user category uses this icon (less precise but possible)
    // This might be too broad, but let's consider it. For AddHabitDialog, we are more precise.
    // For display, if a user category *exists* with this icon, we might prefer its name if no direct habit name match.
    // However, if multiple user cats use the same icon, which one? This is why AddHabitDialog's `std:iconKey` vs `user:id` is better.
    // For HabitItem display, if the habit.icon (base key) is part of a user category, we'd want that user category's name.
    // The challenge is identifying *which* user category if multiple use the same iconKey.
    // The current logic outside this function tries to find `userCategoryUsingThisIcon`.

    // If it's a valid standard icon (exists in allAvailableIcons)
    if (allAvailableIcons[iconKey]) {
      return `std:${iconKey}`;
    }
  }
  // Fallback to default standard icon if no specific match or invalid iconKey
  return `std:${defaultIconKey}`;
};
