import { isAfter, startOfDay } from 'date-fns';

export interface WeeklyProgressDay {
  date: Date;
  activeHabitsCount: number;
  completedHabitsCount: number;
}

export function calculateWeeklyStats(days: WeeklyProgressDay[], now: Date = new Date()) {
  const today = startOfDay(now);
  let totalCompleted = 0;
  let totalPossible = 0;

  for (const day of days) {
    if (isAfter(startOfDay(day.date), today)) continue;
    totalCompleted += day.completedHabitsCount;
    totalPossible += day.activeHabitsCount;
  }

  return {
    totalCompleted,
    totalPossible,
    overallPercentage: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
  };
}
