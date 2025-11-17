
'use client';

import type { Habit, HabitCompletion } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subDays, eachDayOfInterval, isSameDay, parseISO, startOfDay } from 'date-fns';
import { TrendingUp, CheckCircle2, Repeat, Award, BarChartBig } from 'lucide-react';
import React from 'react';
import { useTranslations, useLanguage } from '@/components/LanguageProvider';

interface StatsOverviewProps {
  habits: Habit[];
}

const getCompletionsOnDate = (completions: HabitCompletion[], date: Date, status: 'completed' | 'failed' | 'skipped' = 'completed'): boolean => {
  const dateString = format(date, 'yyyy-MM-dd');
  return completions.some(c => c.date === dateString && c.status === status);
};

export function StatsOverview({ habits }: StatsOverviewProps) {
  const t = useTranslations();
  const { language } = useLanguage();
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
    if (habits.length === 0) return t.stats.motivational.empty;
    if (averageCompletionPercentage > 75) return t.stats.motivational.excellent;
    if (averageCompletionPercentage > 50) return t.stats.motivational.good;
    if (averageCompletionPercentage > 25) return t.stats.motivational.gettingThere;
    return t.stats.motivational.keepGoing;
  };

  const completionTodayValue = language === 'ru'
    ? `${habitsCompletedToday} из ${habits.length}`
    : `${habitsCompletedToday} of ${habits.length}`;
  const streakUnit = language === 'ru' ? ' дн.' : ' days';

  const stats = [
    {
      label: t.stats.cards.completedToday,
      value: completionTodayValue,
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      label: t.stats.cards.completionRate,
      value: `${averageCompletionPercentage}%`,
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      label: t.stats.cards.averageStreak,
      value: `${averageStreak}${streakUnit}`,
      icon: Repeat,
      color: "text-orange-500",
    },
    {
      label: t.stats.cards.bestStreak,
      value: `${bestStreak}${streakUnit}`,
      icon: Award,
      color: "text-yellow-500",
    },
    {
      label: t.stats.cards.completedThisMonth,
      value: totalCompletionsLast30Days,
      icon: BarChartBig,
      color: "text-purple-500",
    },
  ];

  return (
    <Card className="my-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t.stats.title}</CardTitle>
        </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <p className="text-muted-foreground">{getMotivationalMessage()}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center text-center p-3 bg-card rounded-lg shadow-sm border min-h-[100px] justify-center">
                  <stat.icon className={`h-8 w-8 mb-2 ${stat.color}`} />
                  <p className="text-xs text-muted-foreground mb-1 leading-tight">{stat.label}</p>
                  <p className="text-lg font-bold leading-none">{stat.value}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-center text-muted-foreground italic">{getMotivationalMessage()}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
