import type { Habit } from '@/lib/types';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';

export interface DayProgress {
  percentage: number;
  activeCount: number;
  completedCount: number;
}

export function getDayProgress(habits: Habit[], day: Date): DayProgress {
  const dayString = format(day, 'yyyy-MM-dd');

  const activeHabitsOnDay = habits.filter(habit => {
    const habitCreationDayStart = startOfDay(parseISO(habit.createdAt));
    // Habit is active if the current day is not before its creation date
    return !isBefore(day, habitCreationDayStart);
  });

  const completedCount = activeHabitsOnDay.filter(habit =>
    habit.completions.some(c => c.date === dayString && c.status === 'completed')
  ).length;

  const percentage = activeHabitsOnDay.length > 0
    ? Math.round((completedCount / activeHabitsOnDay.length) * 100)
    : 0;

  return {
    percentage,
    activeCount: activeHabitsOnDay.length,
    completedCount,
  };
}

export function getDayProgressColorClass(percentage: number, activeCount: number): string {
  if (activeCount === 0 || percentage === 0) return 'bg-card';
  if (percentage < 40) return 'bg-success-1';
  if (percentage < 70) return 'bg-success-2';
  if (percentage < 100) return 'bg-success-3';
  return 'bg-success-4';
}
