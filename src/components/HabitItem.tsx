'use client';

import type { Habit, HabitType, HabitStatus, IconOption, UserDefinedCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getIconComponent, availableIcons as allAvailableIcons, defaultIconKey } from '@/components/icons';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Flame, Trash2, TrendingUp, CalendarDays, Check, X, ThumbsDown, ThumbsUp, Edit, ShieldCheck, ShieldAlert, SkipForward, GripVertical } from 'lucide-react';
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
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    boxShadow: isDragging ? '0px 5px 15px rgba(0, 0, 0, 0.1)' : 'none',
    position: 'relative' as 'relative', // Ensure type correctness for style prop
  };

  const completionForSelectedDate = habit.completions.find(c => c.date === selectedDate);
  const isCompletedOnSelectedDate = completionForSelectedDate?.status === 'completed';
  const isFailedOnSelectedDate = completionForSelectedDate?.status === 'failed';
  const isSkippedOnSelectedDate = completionForSelectedDate?.status === 'skipped';

  const IconComponent = getIconComponent(habit.icon);

  const handleAction = (status: HabitStatus) => {
    onToggleComplete(habit.id, selectedDate, status);
  };

  const getCardBorderColor = () => {
    if (isFailedOnSelectedDate) {
      return 'border-red-400 dark:border-red-600 shadow-md shadow-red-300/50 dark:shadow-red-700/30';
    }
    if (isCompletedOnSelectedDate) {
      return habit.type === 'positive' 
        ? 'border-green-400 dark:border-green-600 shadow-md shadow-green-300/50 dark:shadow-green-700/30' 
        : 'border-blue-400 dark:border-blue-600 shadow-md shadow-blue-300/50 dark:shadow-blue-700/30';
    }
    return 'shadow-sm';
  };

  // Minimal view: just a single line with checkbox and name
  if (isMinimalHabitView) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className={cn(
          "flex items-center gap-3 p-2 bg-card border rounded hover:bg-muted/50 transition-colors",
          getCardBorderColor()
        )}
      >
        {/* Drag handle */}
        <div {...attributes} {...listeners} className="cursor-grab touch-none">
          <GripVertical className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </div>
        
        {/* Habit icon */}
        <div className="h-4 w-4 text-primary flex items-center justify-center flex-shrink-0">
          <IconComponent className="h-full w-full" />
        </div>
        
        {/* Habit name */}
        <div className="flex-grow min-w-0">
          <span className="text-sm font-medium truncate">{habit.name}</span>
        </div>
        
        {/* Streak */}
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Flame className={cn("h-3 w-3", habit.streak > 0 ? 'text-orange-500' : 'text-gray-400')} />
          <span>{habit.streak}</span>
        </div>
        
        {/* Checkbox for completion */}
        <div className="flex items-center gap-1">
          {habit.type === 'positive' ? (
            <input
              type="checkbox"
              checked={isCompletedOnSelectedDate}
              onChange={() => handleAction(isCompletedOnSelectedDate ? 'failed' : 'completed')}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
              aria-label={isCompletedOnSelectedDate ? 'Отмечено как выполнено' : 'Отметить как выполнено'}
            />
          ) : (
            <input
              type="checkbox"
              checked={isCompletedOnSelectedDate}
              onChange={() => handleAction(isCompletedOnSelectedDate ? 'failed' : 'completed')}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              aria-label={isCompletedOnSelectedDate ? 'Отмечено как удержался' : 'Отметить как удержался'}
            />
          )}
        </div>
      </div>
    );
  }

  const renderActionButtons = () => {
    const commonButtonClass = "transition-all duration-200 ease-in-out transform active:scale-95 w-full";
    const compactIconClass = "h-3 w-3";
    const normalIconClassWithMargin = "mr-2 h-4 w-4";

    if (isCompactHabitView) {
      // Compact view: icon-only buttons in a flex row with streak and drag handle
      return (
        <div className="flex items-center justify-between mt-auto">
          {/* Left side: Action buttons */}
          <div className="flex gap-1">
            {habit.type === 'positive' ? (
              <>
                <ThumbsUp
                  onClick={() => handleAction('completed')}
                  className={cn(
                    compactIconClass,
                    'cursor-pointer transition-colors',
                    isCompletedOnSelectedDate ? 'text-green-600' : 'text-gray-400 hover:text-green-500'
                  )}
                  aria-label={isCompletedOnSelectedDate ? 'Отмечено как выполнено' : 'Отметить как выполнено'}
                />
                <ThumbsDown
                  onClick={() => handleAction('failed')}
                  className={cn(
                    compactIconClass,
                    'cursor-pointer transition-colors',
                    isFailedOnSelectedDate ? 'text-red-600' : 'text-gray-400 hover:text-red-500'
                  )}
                  aria-label={isFailedOnSelectedDate ? 'Отмечено как не выполнено' : 'Отметить как не выполнено'}
                />
              </>
            ) : ( // Negative habit in compact view
              <>
                <ThumbsUp
                  onClick={() => handleAction('completed')}
                  className={cn(
                    compactIconClass,
                    'cursor-pointer transition-colors',
                    isCompletedOnSelectedDate ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'
                  )}
                  aria-label={isCompletedOnSelectedDate ? 'Отмечено как удержался' : 'Отметить как удержался'}
                />
                <ThumbsDown
                  onClick={() => handleAction('failed')}
                  className={cn(
                    compactIconClass,
                    'cursor-pointer transition-colors',
                    isFailedOnSelectedDate ? 'text-red-600' : 'text-gray-400 hover:text-red-500'
                  )}
                  aria-label={isFailedOnSelectedDate ? 'Отмечено как сорвался' : 'Отметить как сорвался'}
                />
              </>
            )}
          </div>
          
          {/* Right side: Streak and drag handle */}
          <div className="flex items-center gap-1">
            {/* Streak */}
            <div className="flex items-center space-x-0.5 text-xs">
              <Flame className={cn("h-3 w-3", habit.streak > 0 ? 'text-orange-500' : 'text-gray-400')} />
              <span>{habit.streak}</span>
            </div>
            
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="cursor-grab touch-none p-1">
              <GripVertical className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </div>
          </div>
        </div>
      );
    }

    // Normal view: existing button layout
    if (habit.type === 'positive') { // This is for the normal view now
      return (
        <div className="grid grid-cols-5 gap-2 mt-3">
          <Button
            onClick={() => handleAction('completed')}
            variant={isCompletedOnSelectedDate ? 'default' : 'outline'}
            className={cn(
              "col-span-4 transition-all duration-200 ease-in-out transform active:scale-95 w-full",
              isCompletedOnSelectedDate ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''
            )}
            aria-label={isCompletedOnSelectedDate ? 'Отмечено как выполнено' : 'Отметить как выполнено'}
          >
            <ThumbsUp className={normalIconClassWithMargin} />
            {isCompletedOnSelectedDate ? 'Выполнено!' : 'Выполнил'}
          </Button>
          <Button
            onClick={() => handleAction('failed')}
            variant={isFailedOnSelectedDate ? 'destructive' : 'outline'}
            className={cn(
              "col-span-1 transition-all duration-200 ease-in-out transform active:scale-95 w-full flex items-center justify-center",
               isFailedOnSelectedDate ? '' : 'text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive'
            )}
            aria-label={isFailedOnSelectedDate ? 'Отмечено как не выполнено' : 'Отметить как не выполнено'}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      );
    } else { // Negative habit
      return (
        <div className="grid grid-cols-5 gap-2 mt-3">
           <Button
            onClick={() => handleAction('completed')} 
            variant={isCompletedOnSelectedDate ? 'default' : 'outline'}
            className={cn(
              "col-span-2 transition-all duration-200 ease-in-out transform active:scale-95 w-full", 
              isCompletedOnSelectedDate ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-blue-500/50 text-blue-600 hover:bg-blue-500/10'
            )}
            aria-label={isCompletedOnSelectedDate ? 'Отмечено как удержался' : 'Отметить как удержался'}
          >
             <ShieldCheck className={normalIconClassWithMargin} />
            {isCompletedOnSelectedDate ? 'Удержался!' : 'Удержался'}
          </Button>
          <Button
            onClick={() => handleAction('failed')}
            variant={isFailedOnSelectedDate ? 'destructive' : 'outline'}
            className={cn(
              "col-span-2 transition-all duration-200 ease-in-out transform active:scale-95 w-full", 
               isFailedOnSelectedDate ? '' : 'text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive'
            )}
            aria-label={isFailedOnSelectedDate ? 'Отмечено как сорвался' : 'Отметить как сорвался'}
          >
            <ShieldAlert className={normalIconClassWithMargin} />
            {isFailedOnSelectedDate ? 'Сорвался!' : 'Сорвался'}
          </Button>
          <Button
            onClick={() => handleAction('skipped')}
            variant={isSkippedOnSelectedDate ? 'secondary' : 'outline'}
            className={cn(
              "col-span-1 transition-all duration-200 ease-in-out transform active:scale-95 w-full flex items-center justify-center", 
              isSkippedOnSelectedDate ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'text-gray-600 border-gray-500/50 hover:bg-gray-500/10'
            )}
            aria-label={isSkippedOnSelectedDate ? 'Отмечено как пропущено' : 'Отметить как пропущено'}
          >
            <SkipForward className={normalIconClassWithMargin} />
          </Button>
        </div>
      );
    }
  };
  
  const uniqueSelectedValue = determineInitialIconValueForItem(habit, userCategories); 
  let habitCategoryDisplayName = allAvailableIcons[habit.icon]?.name || 'Категория'; 

  if (uniqueSelectedValue.startsWith('user:')) {
    const userId = uniqueSelectedValue.substring('user:'.length);
    const userCat = userCategories.find(uc => uc.id === userId);
    if (userCat) {
      habitCategoryDisplayName = userCat.name;
    }
  }


  return (
    <Card ref={setNodeRef} style={style} className={cn("flex flex-col", getCardBorderColor(), isCompactHabitView ? "h-full" : "")}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 pt-3 px-4">
        {/* Item 1: Habit Info (potentially triggering dialog) */}
        {!isCompactHabitView ? (
          <AddHabitDialog
            existingHabit={habit}
            onSave={(updatedHabitData) => onEdit(updatedHabitData, habit.id)}
            availableIcons={availableIcons}
            userCategories={userCategories}
            triggerButton={
              <div className="flex-grow flex items-center gap-3 min-w-0 cursor-pointer hover:bg-muted/50 p-1 -ml-1 rounded">
                <div className={cn("h-8 w-8 text-primary flex items-center justify-center flex-shrink-0")}>
                  <IconComponent className="h-full w-full" />
                </div>
                <div className="flex-grow min-w-0">
                  <CardTitle className={cn("text-xl truncate")}>{habit.name}</CardTitle>
                  <CardDescription className="truncate">{habit.goal} <span className="text-xs text-muted-foreground font-normal">({habitCategoryDisplayName})</span></CardDescription>
                </div>
              </div>
            }
          />
        ) : (
          // Original Habit Info for compact view (not clickable for dialog)
          <div className="flex-grow flex items-center gap-3 min-w-0">
            <div className={cn("h-8 w-8 text-primary flex items-center justify-center flex-shrink-0", "h-5 w-5")}>
              <IconComponent className="h-full w-full" />
            </div>
            <div className="flex-grow min-w-0">
              <CardTitle className={cn("text-xl truncate", "text-sm font-medium")}>{habit.name}</CardTitle>
            </div>
          </div>
        )}

        {/* Item 2: Right Controls (Drag Handle, Streak, Delete) */}
        {!isCompactHabitView && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Drag Handle - Moved and Resized */}
            <div {...attributes} {...listeners} className="cursor-grab touch-none p-1 self-center">
              <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </div>

            {/* Streak */}
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mr-1">
              <Flame className={cn("h-4 w-4", habit.streak > 0 ? 'text-orange-500' : 'text-gray-400')} />
              <span>{habit.streak}</span>
            </div>

            {/* Delete Button */}
            <Button variant="ghost" size="icon" onClick={() => onDelete(habit.id)} className="text-destructive hover:text-destructive h-7 w-7">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className={cn("pt-4 px-4 pb-3 flex-grow flex flex-col", isCompactHabitView && "p-1.5 pt-0")}>
        {/* Action Buttons */}
        {renderActionButtons()}

        {/* Progress and History Accordion - only show if not in compact view */}
        {!isCompactHabitView && (
          <Accordion type="multiple" className="w-full mt-3 text-muted-foreground">
            <AccordionItem value="progress" className="border-b-0">
              <AccordionTrigger className="text-sm py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4"/> Показать прогресс
                </div>
              </AccordionTrigger>
              <AccordionContent>
                 <ProgressChartClient habit={habit} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="history" className="border-b-0">
              <AccordionTrigger className="text-sm py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4"/> История отметок
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
                              habit.type === 'positive' ? 'text-green-500' : 'text-blue-500'
                           )} />
                        )}
                         {comp.status === 'failed' && (
                          <X className="h-3 w-3 ml-1.5 text-red-500" />
                        )}
                        {comp.notes && <span className="italic text-gray-500 ml-1"> - {comp.notes}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">Пока нет отметок.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
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
    
