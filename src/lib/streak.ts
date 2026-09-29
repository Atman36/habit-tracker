import { format, isAfter, isValid, parseISO, startOfDay, startOfMonth, startOfWeek, subDays, subMonths } from 'date-fns';
import type { Habit, HabitCompletion, HabitFrequency, HabitType } from './types';

const toLocalDay = (value: string): Date | null => {
  const date = parseISO(value);
  return isValid(date) ? startOfDay(date) : null;
};

const periodStart = (day: Date, frequency: HabitFrequency): Date => {
  if (frequency === 'weekly') return startOfWeek(day, { weekStartsOn: 1 });
  if (frequency === 'monthly') return startOfMonth(day);
  return day;
};

const previousPeriod = (period: Date, frequency: HabitFrequency): Date => {
  if (frequency === 'weekly') return subDays(period, 7);
  if (frequency === 'monthly') return subMonths(period, 1);
  return subDays(period, 1);
};

const periodKey = (day: Date, frequency: HabitFrequency) => format(periodStart(day, frequency), 'yyyy-MM-dd');

export function calculateStreak(
  completions: HabitCompletion[],
  frequency: HabitFrequency,
  habitType: HabitType,
  createdAt: string,
  now: Date = new Date(),
): number {
  const today = startOfDay(now);
  const createdDay = toLocalDay(createdAt);
  if (!createdDay || isAfter(createdDay, today)) return 0;

  const statuses = new Map<string, { day: Date; status: HabitCompletion['status'] }>();
  for (const completion of completions) {
    const day = toLocalDay(completion.date);
    if (!day || isAfter(day, today) || isAfter(createdDay, day)) continue;
    const key = periodKey(day, frequency);
    const existing = statuses.get(key);
    if (existing && !isAfter(day, existing.day)) continue;
    statuses.set(key, { day, status: completion.status });
  }

  const creationPeriod = periodStart(createdDay, frequency);
  let period = periodStart(today, frequency);
  let streak = 0;
  let isCurrentPeriod = true;

  while (!isAfter(creationPeriod, period)) {
    const status = statuses.get(format(period, 'yyyy-MM-dd'))?.status;
    if (status === 'completed') {
      streak++;
    } else if (status === 'failed') {
      return streak;
    } else if (!status && !isCurrentPeriod) {
      // Negative ("avoid") habits: an untracked day/period means the user did not
      // relapse (or simply did not log), so it must not break the streak.
      if (habitType !== 'negative') return streak;
    }

    period = previousPeriod(period, frequency);
    isCurrentPeriod = false;
  }

  return streak;
}

export function recalculateAllStreaks(habits: Habit[], now: Date = new Date()): Habit[] {
  return habits.map(habit => ({
    ...habit,
    streak: calculateStreak(habit.completions, habit.frequency, habit.type, habit.createdAt, now),
  }));
}
