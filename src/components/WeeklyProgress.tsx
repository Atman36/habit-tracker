
'use client';

import type { Habit } from '@/lib/types';
import { useState, useMemo } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO,
  isBefore,
  isAfter,
  startOfDay, 
} from 'date-fns';
import { enUS, ru } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTranslations, useLanguage } from '@/components/LanguageProvider';

interface WeeklyProgressProps {
  habits: Habit[];
}

interface DayData {
  date: Date;
  dayName: string;
  dateOfMonth: string;
  activeHabitsCount: number;
  completedHabitsCount: number;
  progressPercentage: number;
  isToday: boolean;
}

const getProgressColor = (percentage: number, activeHabits: number): string => {
  if (activeHabits === 0) return 'bg-muted/30'; 
  if (percentage === 0 && activeHabits > 0) return 'bg-muted/50'; 
  if (percentage < 50) return 'bg-red-500/70 dark:bg-red-600/60';
  if (percentage <= 80) return 'bg-yellow-500/70 dark:bg-yellow-600/60';
  return 'bg-green-500/70 dark:bg-green-600/60';
};

const getProgressTextColor = (percentage: number, activeHabits: number): string => {
    if (activeHabits === 0) return 'text-muted-foreground';
    if (percentage === 0 && activeHabits > 0) return 'text-muted-foreground';
    if (percentage < 50) return 'text-red-100 dark:text-red-200';
    if (percentage <= 80) return 'text-yellow-100 dark:text-yellow-900';
    return 'text-green-100 dark:text-green-200';
}


export function WeeklyProgress({ habits }: WeeklyProgressProps) {
  const t = useTranslations();
  const { language } = useLanguage();
  const dateLocale = language === 'ru' ? ru : enUS;
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekInterval = useMemo(() => {
    return {
      start: startOfWeek(currentDate, { weekStartsOn: 1 }), 
      end: endOfWeek(currentDate, { weekStartsOn: 1 }), 
    };
  }, [currentDate]);

  const daysOfWeekData: DayData[] = useMemo(() => {
    const daysInCurrentWeek = eachDayOfInterval(weekInterval);
    return daysInCurrentWeek.map(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      
      const activeHabitsOnDay = habits.filter(habit => {
        const habitCreationDayStart = startOfDay(parseISO(habit.createdAt));
        // Habit is active if the current day is not before its creation date
        return !isBefore(day, habitCreationDayStart);
      });
      
      const completedHabitsOnDay = activeHabitsOnDay.filter(habit =>
        habit.completions.some(c => c.date === dayString && c.status === 'completed')
      ).length;

      const progressPercentage = activeHabitsOnDay.length > 0
        ? Math.round((completedHabitsOnDay / activeHabitsOnDay.length) * 100)
        : 0;
        
      return {
        date: day,
        dayName: format(day, 'E', { locale: ru }), 
        dateOfMonth: format(day, 'd'), 
        activeHabitsCount: activeHabitsOnDay.length,
        completedHabitsCount: completedHabitsOnDay,
        progressPercentage: progressPercentage,
        isToday: isSameDay(day, startOfDay(new Date())),
      };
    });
  }, [weekInterval, habits]);

  const weeklyStats = useMemo(() => {
    let totalCompleted = 0;
    let totalPossible = 0;
    daysOfWeekData.forEach(day => {
      totalCompleted += day.completedHabitsCount;
      totalPossible += day.activeHabitsCount;
    });
    const overallPercentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    return {
      totalCompleted,
      totalPossible,
      overallPercentage,
    };
  }, [daysOfWeekData]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
  };

  const canGoToNextWeek = isBefore(weekInterval.end, startOfWeek(new Date(), { weekStartsOn: 1 }));


  return (
    <Card className="my-6 shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-semibold">{t.weeklyProgress.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')} aria-label={t.weeklyProgress.previousWeekAria}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-32 text-center">
              {format(weekInterval.start, 'd MMM', { locale: dateLocale })} - {format(weekInterval.end, 'd MMM yyyy', { locale: dateLocale })}
            </span>
            <Button variant="outline" size="icon" onClick={() => navigateWeek('next')} disabled={!canGoToNextWeek} aria-label={t.weeklyProgress.nextWeekAria}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>{t.weeklyProgress.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <p className="text-muted-foreground">{t.weeklyProgress.noHabits}</p>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-6">
              {daysOfWeekData.map(dayData => (
                <div
                  key={dayData.date.toISOString()}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-md border",
                    dayData.isToday ? "border-primary ring-1 ring-primary shadow-lg" : "border-border"
                  )}
                >
                  <span className="text-xs font-medium text-muted-foreground">{dayData.dayName}</span>
                  <span className={cn("text-lg font-bold mb-1", dayData.isToday ? "text-primary" : "")}>
                    {dayData.dateOfMonth}
                  </span>
                  <div className={cn(
                      "w-full h-6 rounded flex items-center justify-center mb-1",
                      getProgressColor(dayData.progressPercentage, dayData.activeHabitsCount)
                    )}
                    title={`${dayData.progressPercentage}% ${t.weeklyProgress.progressTooltipSuffix}`}
                  >
                     <span className={cn("text-xs font-semibold", getProgressTextColor(dayData.progressPercentage, dayData.activeHabitsCount))}>
                        {dayData.activeHabitsCount > 0 ? `${dayData.progressPercentage}%` : '-'}
                     </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {dayData.activeHabitsCount > 0 ? `${dayData.completedHabitsCount}/${dayData.activeHabitsCount}` : '0/0'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{t.weeklyProgress.overallLabel}</span>
                <span className="font-semibold">{weeklyStats.overallPercentage}% ({t.weeklyProgress.overallDetails(weeklyStats.totalCompleted, weeklyStats.totalPossible)})</span>
              </div>
              <Progress value={weeklyStats.overallPercentage} className="h-3" />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="font-semibold">{t.weeklyProgress.legendLabel}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500/70"></div>
                <span>{t.weeklyProgress.legendHigh}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-yellow-500/70"></div>
                <span>{t.weeklyProgress.legendMedium}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-500/70"></div>
                <span>{t.weeklyProgress.legendLow}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-muted/50"></div>
                <span>{t.weeklyProgress.legendZero}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-muted/30"></div>
                <span>{t.weeklyProgress.legendNoHabits}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
