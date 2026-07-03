
'use client';

import type { Habit, HabitCompletion } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { format, subDays, eachDayOfInterval, parseISO, startOfDay } from 'date-fns';
import { TrendingUp, Repeat, Award, BarChartBig, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface StatsOverviewProps {
  habits: Habit[];
}

const getCompletionsOnDate = (completions: HabitCompletion[], date: Date, status: 'completed' | 'failed' | 'skipped' = 'completed'): boolean => {
  const dateString = format(date, 'yyyy-MM-dd');
  return completions.some(c => c.date === dateString && c.status === status);
};

interface MetricTile {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tileClassName: string;
  iconClassName: string;
}

export function StatsOverview({ habits }: StatsOverviewProps) {
  const today = startOfDay(new Date());
  const last30DaysInterval = {
    start: subDays(today, 29), // 30 days including today
    end: today,
  };
  const daysInInterval = eachDayOfInterval(last30DaysInterval);

  const habitsCompletedToday = habits.filter(habit =>
    getCompletionsOnDate(habit.completions, today)
  ).length;

  let totalCompletionPercentageSum = 0;
  let activeHabitsForPercentage = 0;

  habits.forEach(habit => {
    // Consider a habit active for percentage if it was created before or during the 30-day window
    const habitCreationDate = parseISO(habit.createdAt);
    if (habitCreationDate <= last30DaysInterval.end) {
      let completedCountLast30Days = 0;
      let daysSinceCreationInInterval = 0;

      daysInInterval.forEach(day => {
        // Only count days from habit creation onwards
        if (day >= startOfDay(habitCreationDate)) {
          daysSinceCreationInInterval++;
          if (getCompletionsOnDate(habit.completions, day)) {
            completedCountLast30Days++;
          }
        }
      });

      if (daysSinceCreationInInterval > 0) {
        totalCompletionPercentageSum += (completedCountLast30Days / daysSinceCreationInInterval) * 100;
        activeHabitsForPercentage++;
      }
    }
  });

  const averageCompletionPercentage = activeHabitsForPercentage > 0 ? Math.round(totalCompletionPercentageSum / activeHabitsForPercentage) : 0;


  const totalStreakSum = habits.reduce((sum, habit) => sum + habit.streak, 0);
  const averageStreak = habits.length > 0 ? Math.round(totalStreakSum / habits.length) : 0;

  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0;

  const totalCompletionsLast30Days = habits.reduce((sum, habit) => {
    const habitCompletionsInInterval = habit.completions.filter(c => {
      const compDate = parseISO(c.date);
      return c.status === 'completed' && compDate >= last30DaysInterval.start && compDate <= last30DaysInterval.end;
    }).length;
    return sum + habitCompletionsInInterval;
  }, 0);

  const getMotivationalMessage = () => {
    if (habits.length === 0) return "Добавьте привычки, чтобы увидеть статистику!";
    if (averageCompletionPercentage > 75) return "Отличная работа! Вы на высоте! 💪";
    if (averageCompletionPercentage > 50) return "Хороший прогресс! Продолжайте в том же духе. 🚀";
    if (averageCompletionPercentage > 25) return "Неплохое начало! Маленькие шаги ведут к большим результатам. ✨";
    return "Каждый день - новая возможность стать лучше! 🌱";
  };

  const metricTiles: MetricTile[] = [
    {
      label: "% выполнения (30 дн.)",
      value: `${averageCompletionPercentage}%`,
      icon: TrendingUp,
      tileClassName: "bg-background/10 border-background/20",
      iconClassName: "text-secondary",
    },
    {
      label: "Средняя серия",
      value: `${averageStreak} дн.`,
      icon: Repeat,
      tileClassName: "bg-background/10 border-background/20",
      iconClassName: "text-primary",
    },
    {
      label: "Лучшая серия",
      value: `${bestStreak} дн.`,
      icon: Award,
      tileClassName: "bg-amber border-background/20 text-foreground",
      iconClassName: "text-foreground",
    },
    {
      label: "Выполнено за месяц",
      value: totalCompletionsLast30Days,
      icon: BarChartBig,
      tileClassName: "bg-background/10 border-background/20",
      iconClassName: "text-accent",
    },
  ];

  return (
    <Card className="my-6 bg-foreground text-background dark:bg-card dark:text-card-foreground">
      <CardContent className="p-5">
        {habits.length === 0 ? (
          <p className="font-mono text-xs italic opacity-70">{getMotivationalMessage()}</p>
        ) : (
          <>
            <p className="font-mono text-[10px] uppercase tracking-wider opacity-60">Сегодня</p>
            <p className="mt-1 font-display font-black text-4xl">
              <span className="text-accent">{habitsCompletedToday}</span>
              <span>/{habits.length}</span>
            </p>

            <div className="mt-3 flex gap-1">
              {habits.map(habit => {
                const doneToday = getCompletionsOnDate(habit.completions, today);
                return (
                  <div
                    key={habit.id}
                    className={cn(
                      "h-2 flex-1 rounded-full border-2 border-background/30",
                      doneToday ? "bg-accent border-accent" : "bg-background/10"
                    )}
                  />
                );
              })}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {metricTiles.map(tile => (
                <div
                  key={tile.label}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-panel border-2 p-3 text-center",
                    tile.tileClassName
                  )}
                >
                  <tile.icon className={cn("h-5 w-5", tile.iconClassName)} />
                  <p className="font-display font-bold text-lg leading-none">{tile.value}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wide opacity-70 leading-tight">{tile.label}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 text-center font-mono text-xs italic opacity-70">{getMotivationalMessage()}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
