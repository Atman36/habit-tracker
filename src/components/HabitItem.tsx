'use client';

import { useMemo } from 'react';
import type { Habit, HabitStatus, HabitFrequency, IconOption, UserDefinedCategory } from '@/lib/types';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getIconComponent, availableIcons as allAvailableIcons, defaultIconKey } from '@/components/icons';
import { format, parseISO, startOfWeek, startOfDay, addDays, isAfter, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
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

const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
};

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

  const handleAction = (status: HabitStatus) => {
    onToggleComplete(habit.id, selectedDate, status);
  };

  // Category display name (also used to derive the pastel icon-tile color and the meta line).
  const uniqueSelectedValue = determineInitialIconValueForItem(habit, userCategories);
  let habitCategoryDisplayName = allAvailableIcons[habit.icon]?.name || 'Категория';
  if (uniqueSelectedValue.startsWith('user:')) {
    const userId = uniqueSelectedValue.substring('user:'.length);
    const userCat = userCategories.find(uc => uc.id === userId);
    if (userCat) {
      habitCategoryDisplayName = userCat.name;
    }
  }

  const pastelTileClass = PASTEL_TILE_CLASSES[hashString(habitCategoryDisplayName) % PASTEL_TILE_CLASSES.length];

  // A streak is treated as a "personal record" once it reaches the first achievement
  // milestone already used elsewhere in the app (see src/lib/achievements.ts, `first_week`).
  const isPersonalRecord = habit.streak >= 7;

  // Border color for the card, tinted to the day's status (see DESIGN-SPEC "Card status coding").
  const getCardBorderClass = () => {
    if (isSkippedOnSelectedDate) return 'border-dashed border-border';
    if (isFailedOnSelectedDate) return 'border-primary';
    if (isCompletedOnSelectedDate) {
      return habit.type === 'positive' ? 'border-success-4' : 'border-secondary';
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

  const isStopHabitUnmarked = habit.type === 'negative' && !isCompletedOnSelectedDate && !isFailedOnSelectedDate && !isSkippedOnSelectedDate;

  // "Week battery": 7 cells for the current calendar week (Mon-Sun), independent of selectedDate.
  const weekBatteryDays = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      const dateString = format(day, 'yyyy-MM-dd');
      const completion = habit.completions.find(c => c.date === dateString);
      let cellState: 'done' | 'today' | 'missed' | 'future';
      if (completion?.status === 'completed') {
        cellState = 'done';
      } else if (isAfter(startOfDay(day), startOfDay(now))) {
        cellState = 'future';
      } else if (isSameDay(day, now)) {
        cellState = 'today';
      } else {
        cellState = 'missed';
      }
      return { dateString, cellState };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habit.completions]);
  const weekDoneCount = weekBatteryDays.filter(d => d.cellState === 'done').length;

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
            ? (habit.type === 'positive' ? 'Отмечено как выполнено' : 'Отмечено как удержался')
            : (habit.type === 'positive' ? 'Отметить как выполнено' : 'Отметить как удержался')}
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

  // Right-side action cluster for positive habits: big circle + small ✕ / trash (or undo) buttons.
  const renderPositiveActionCluster = () => (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <button
        type="button"
        onClick={() => handleAction('completed')}
        aria-label={isCompletedOnSelectedDate ? 'Отмечено как выполнено' : 'Отметить как выполнено'}
        className={cn(
          "flex items-center justify-center h-[60px] w-[60px] rounded-full border-2 transition-all active:scale-95",
          isCompletedOnSelectedDate
            ? "bg-accent border-border shadow-hard-xs text-accent-foreground"
            : "border-dashed border-primary bg-card text-primary"
        )}
      >
        {isCompletedOnSelectedDate ? <Check className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
      </button>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleAction('failed')}
          aria-label={isFailedOnSelectedDate ? 'Отмечено как не выполнено' : 'Отметить как не выполнено'}
          className="flex items-center justify-center h-[26px] w-[26px] rounded-[8px] border-2 border-border bg-card shadow-hard-xs active:translate-y-[1px] active:shadow-none transition-all"
        >
          <X className="h-3.5 w-3.5 text-primary" />
        </button>
        {isFailedOnSelectedDate ? (
          <button
            type="button"
            onClick={() => handleAction('failed')}
            aria-label="Отменить отметку о невыполнении"
            className="flex items-center justify-center h-[26px] w-[26px] rounded-[8px] border-2 border-border bg-card shadow-hard-xs active:translate-y-[1px] active:shadow-none transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5 text-foreground" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onDelete(habit.id)}
            aria-label="Удалить привычку"
            className="flex items-center justify-center h-[26px] w-[26px] rounded-[8px] border-2 border-border bg-card shadow-hard-xs active:translate-y-[1px] active:shadow-none transition-all"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </button>
        )}
      </div>
    </div>
  );

  // Right-side action cluster for negative (stop) habits: state circle + trash.
  // The three pill buttons (Удержался!/Сорвался/Пропуск) are rendered separately, below the header row.
  const renderNegativeActionCluster = () => {
    const circleState: 'held' | 'broken' | 'neutral' = isCompletedOnSelectedDate ? 'held' : isFailedOnSelectedDate ? 'broken' : 'neutral';
    return (
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
        <div className={cn(
          "flex flex-col items-center justify-center h-[60px] w-[60px] rounded-full border-2 gap-0.5",
          circleState === 'held' && "bg-secondary border-border text-secondary-foreground shadow-hard-xs",
          circleState === 'broken' && "bg-primary border-border text-primary-foreground shadow-hard-xs",
          circleState === 'neutral' && "border-dashed border-secondary bg-card text-secondary"
        )}>
          {circleState === 'held' && <Hand className="h-5 w-5" />}
          {circleState === 'broken' && <AlertTriangle className="h-5 w-5" />}
          {circleState === 'neutral' && <Shield className="h-5 w-5" />}
          {circleState !== 'neutral' && (
            <span className="font-mono text-[8px] uppercase leading-none">{circleState === 'held' ? 'держусь' : 'срыв'}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(habit.id)}
          aria-label="Удалить привычку"
          className="flex items-center justify-center h-[26px] w-[26px] rounded-[8px] border-2 border-border bg-card shadow-hard-xs active:translate-y-[1px] active:shadow-none transition-all"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </button>
      </div>
    );
  };

  // The three pill action buttons for negative (stop) habits.
  const renderNegativePills = () => {
    const pillBase = "flex items-center justify-center gap-1.5 rounded-full border-2 border-border px-2 py-1.5 text-xs font-sans font-semibold shadow-hard-xs transition-all active:translate-y-[1px] active:shadow-none";
    return (
      <div className="grid grid-cols-3 gap-2 px-4 pb-3">
        <button
          type="button"
          onClick={() => handleAction('completed')}
          aria-label={isCompletedOnSelectedDate ? 'Отмечено как удержался' : 'Отметить как удержался'}
          className={cn(pillBase, isCompletedOnSelectedDate ? "bg-secondary text-secondary-foreground" : "bg-card text-foreground")}
        >
          <Shield className="h-3.5 w-3.5" /> Удержался!
        </button>
        <button
          type="button"
          onClick={() => handleAction('failed')}
          aria-label={isFailedOnSelectedDate ? 'Отмечено как сорвался' : 'Отметить как сорвался'}
          className={cn(pillBase, isFailedOnSelectedDate ? "bg-primary text-primary-foreground" : "bg-card text-foreground")}
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Сорвался
        </button>
        <button
          type="button"
          onClick={() => handleAction('skipped')}
          aria-label={isSkippedOnSelectedDate ? 'Отмечено как пропущено' : 'Отметить как пропущено'}
          className={cn(pillBase, "bg-card text-foreground")}
        >
          <SkipForward className="h-3.5 w-3.5" /> Пропуск
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
          aria-label={isCompletedOnSelectedDate ? 'Отмечено как выполнено' : 'Отметить как выполнено'}
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
          aria-label={isFailedOnSelectedDate ? 'Отмечено как не выполнено' : 'Отметить как не выполнено'}
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
        isStopHabitUnmarked && "bg-stop-bg dark:bg-card",
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
                <div className={cn("h-[54px] w-[52px] rounded-panel border-2 border-border flex items-center justify-center flex-shrink-0 dark:bg-muted", pastelTileClass)}>
                  <IconComponent className={cn("h-7 w-7", isIconGrayscale && "grayscale")} />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CardTitle className="text-[15px] font-sans font-bold leading-tight truncate">{habit.name}</CardTitle>
                    <div className={cn(
                      "inline-flex items-center gap-1 rounded-full border-2 border-border px-2 py-0.5 font-mono text-[11px] shrink-0",
                      isPersonalRecord ? "bg-amber" : "bg-card"
                    )}>
                      <Flame className={cn("h-3 w-3", habit.streak > 0 ? 'text-primary' : 'text-muted-foreground')} />
                      <span>{habit.streak}</span>
                    </div>
                    {habit.type === 'negative' && (
                      <Badge variant="destructive" className="shrink-0">СТОП</Badge>
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground truncate mt-0.5">
                    {habitCategoryDisplayName} · {FREQUENCY_LABELS[habit.frequency]}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {weekBatteryDays.map(({ dateString, cellState }) => (
                      <div
                        key={dateString}
                        className={cn(
                          "h-[13px] w-5 rounded-[4px] border-[1.5px]",
                          cellState === 'done' && "bg-success-3 border-border",
                          cellState === 'today' && "bg-card border-primary",
                          cellState === 'missed' && "bg-card border-primary",
                          cellState === 'future' && "bg-card border-dashed border-border opacity-50"
                        )}
                      />
                    ))}
                    <span className="font-mono text-[10px] text-muted-foreground ml-1 whitespace-nowrap">нед. {weekDoneCount}/7</span>
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
                  <TrendingUp className="h-3.5 w-3.5"/> Показать прогресс
                </div>
              </AccordionTrigger>
              <AccordionContent>
                 <ProgressChartClient habit={habit} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="history" className="border-b-0">
              <AccordionTrigger className="flex-none w-fit py-1.5 px-3 rounded-full border-2 border-border bg-card font-mono text-[11px] shadow-hard-xs hover:no-underline [&>svg]:h-3.5 [&>svg]:w-3.5">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5"/> История отметок
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {habit.completions.length > 0 ? (
                  <ul className="space-y-1 text-sm text-muted-foreground max-h-32 overflow-y-auto">
                    {[...habit.completions]
                      .sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
                      .map(comp => (
                      <li key={comp.date} className="text-xs flex items-center">
                        {format(parseISO(comp.date), 'PPP', { locale: ru })}:
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
                  <p className="text-xs text-muted-foreground">Пока нет отметок.</p>
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
