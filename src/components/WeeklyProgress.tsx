
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

const getProgressBarColor = (percentage: number, activeHabits: number): string => {
  if (activeHabits === 0 || percentage === 0) return 'bg-card';
  if (percentage < 40) return 'bg-success-1';
  if (percentage < 70) return 'bg-success-2';
  if (percentage < 100) return 'bg-success-3';
  return 'bg-success-4';
};

const LEGEND_ITEMS = [
  { className: 'bg-card', label: '0%' },
  { className: 'bg-success-1', label: '1–39%' },
  { className: 'bg-success-2', label: '40–69%' },
  { className: 'bg-success-3', label: '70–99%' },
  { className: 'bg-success-4', label: '100%' },
];

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
        dayName: format(day, 'E', { locale: dateLocale }),
        dateOfMonth: format(day, 'd'),
        activeHabitsCount: activeHabitsOnDay.length,
        completedHabitsCount: completedHabitsOnDay,
        progressPercentage: progressPercentage,
        isToday: isSameDay(day, startOfDay(new Date())),
      };
    });
  }, [weekInterval, habits, dateLocale]);

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
    <Card className="my-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{t.weeklyProgress.title}</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateWeek('prev')} aria-label={t.weeklyProgress.previousWeekAria}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateWeek('next')} disabled={!canGoToNextWeek} aria-label={t.weeklyProgress.nextWeekAria}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {format(weekInterval.start, 'd MMM', { locale: dateLocale })} – {format(weekInterval.end, 'd MMM yyyy', { locale: dateLocale })}
        </p>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <p className="text-muted-foreground">{t.weeklyProgress.noHabits}</p>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-6">
              {daysOfWeekData.map(dayData => (
                <div
                  key={dayData.date.toISOString()}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">{dayData.dayName}</span>
                  <div
                    className={cn(
                      "relative w-full h-[34px] overflow-hidden rounded border-2 border-border bg-card",
                      dayData.isToday && "border-primary"
                    )}
                    title={`${dayData.progressPercentage}% ${t.weeklyProgress.progressTooltipSuffix}`}
                  >
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 w-full",
                        getProgressBarColor(dayData.progressPercentage, dayData.activeHabitsCount)
                      )}
                      style={{ height: `${dayData.activeHabitsCount > 0 ? dayData.progressPercentage : 0}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
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

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="font-mono text-[10px] font-semibold text-muted-foreground">{t.weeklyProgress.legendLabel}</span>
              {LEGEND_ITEMS.map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={cn("h-3 w-3 rounded border-2 border-border", item.className)} />
                  <span className="font-mono text-[10px] text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
