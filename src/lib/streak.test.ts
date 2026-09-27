import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateStreak, recalculateAllStreaks } from './streak';

const createdAt = new Date(2026, 0, 1, 12).toISOString();
const completion = (date: string, status: 'completed' | 'failed' | 'skipped' = 'completed') => ({ date, status });

test('daily streak keeps completed, failed, skipped, and current-day grace behavior', () => {
  const now = new Date(2026, 2, 18, 12);
  assert.equal(calculateStreak([completion('2026-03-17'), completion('2026-03-16')], 'daily', 'positive', createdAt, now), 2);
  assert.equal(calculateStreak([completion('2026-03-18', 'skipped'), completion('2026-03-17')], 'daily', 'positive', createdAt, now), 1);
  assert.equal(calculateStreak([completion('2026-03-18', 'failed'), completion('2026-03-17')], 'daily', 'positive', createdAt, now), 0);
});

test('weekly streak counts consecutive periods rather than completion records', () => {
  const now = new Date(2026, 2, 18, 12);
  assert.equal(calculateStreak([completion('2026-03-16'), completion('2026-03-17'), completion('2026-03-09')], 'weekly', 'positive', createdAt, now), 2);
  assert.equal(calculateStreak([completion('2026-01-12')], 'weekly', 'positive', createdAt, now), 0);
  assert.equal(calculateStreak([completion('2026-03-09')], 'weekly', 'positive', createdAt, now), 1);
  assert.equal(calculateStreak([completion('2026-03-16', 'skipped'), completion('2026-03-09')], 'weekly', 'positive', createdAt, now), 1);
  assert.equal(calculateStreak([completion('2026-03-16', 'failed'), completion('2026-03-09')], 'weekly', 'positive', createdAt, now), 0);
});

test('weekly streak ignores future and pre-creation records at Monday boundaries', () => {
  const now = new Date(2026, 2, 18, 12);
  const createdToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12).toISOString();
  assert.equal(calculateStreak([completion('2026-03-23'), completion('2026-03-09')], 'weekly', 'positive', createdAt, now), 1);
  assert.equal(calculateStreak([completion('2026-03-16')], 'weekly', 'positive', createdToday, now), 0);
  assert.equal(calculateStreak([completion('2026-03-18')], 'weekly', 'positive', createdToday, now), 1);
});

test('monthly streak crosses month boundaries as periods', () => {
  const now = new Date(2026, 3, 2, 12);
  assert.equal(calculateStreak([completion('2026-04-01'), completion('2026-03-30')], 'monthly', 'positive', createdAt, now), 2);
  assert.equal(calculateStreak([completion('2026-03-30')], 'monthly', 'positive', createdAt, now), 1);
});

test('period streaks use the latest status and count one completion per weekly or monthly period', () => {
  const weeklyNow = new Date(2026, 2, 18, 12);
  assert.equal(calculateStreak([completion('2026-03-16'), completion('2026-03-18', 'failed'), completion('2026-03-09')], 'weekly', 'positive', createdAt, weeklyNow), 0);
  assert.equal(calculateStreak([completion('2026-03-16'), completion('2026-03-18', 'skipped'), completion('2026-03-09')], 'weekly', 'positive', createdAt, weeklyNow), 1);
  assert.equal(calculateStreak([completion('2026-03-16'), completion('2026-03-17'), completion('2026-03-09')], 'weekly', 'positive', createdAt, weeklyNow), 2);
  assert.equal(calculateStreak([completion('2026-03-16', 'failed'), completion('2026-03-18'), completion('2026-03-09')], 'weekly', 'positive', createdAt, weeklyNow), 2);
  assert.equal(calculateStreak([completion('2026-03-16', 'skipped'), completion('2026-03-18'), completion('2026-03-09')], 'weekly', 'positive', createdAt, weeklyNow), 2);


  const monthlyNow = new Date(2026, 3, 2, 12);
  assert.equal(calculateStreak([completion('2026-04-01'), completion('2026-04-02', 'failed'), completion('2026-03-30')], 'monthly', 'positive', createdAt, monthlyNow), 0);
  assert.equal(calculateStreak([completion('2026-04-01'), completion('2026-04-02', 'skipped'), completion('2026-03-30')], 'monthly', 'positive', createdAt, monthlyNow), 1);
  assert.equal(calculateStreak([completion('2026-04-01', 'failed'), completion('2026-04-02'), completion('2026-03-30')], 'monthly', 'positive', createdAt, monthlyNow), 2);
  assert.equal(calculateStreak([completion('2026-04-01', 'skipped'), completion('2026-04-02'), completion('2026-03-30')], 'monthly', 'positive', createdAt, monthlyNow), 2);
});

test('date-only and local timestamp completions share the same local-day behavior', () => {
  const now = new Date(2026, 2, 18, 12);
  const localTimestamp = new Date(2026, 2, 17, 12).toISOString();
  assert.equal(
    calculateStreak([completion('2026-03-17')], 'daily', 'positive', createdAt, now),
    calculateStreak([completion(localTimestamp)], 'daily', 'positive', createdAt, now),
  );
});

test('all-habit recalculation replaces stale streaks after a frequency edit', () => {
  const now = new Date(2026, 2, 18, 12);
  const habits = [{
    id: 'habit-1',
    name: 'Read',
    icon: 'CheckCircle',
    goal: 'Read',
    frequency: 'monthly' as const,
    type: 'positive' as const,
    createdAt,
    streak: 99,
    completions: [completion('2026-03-16'), completion('2026-03-09')],
  }];
  assert.equal(recalculateAllStreaks(habits, now)[0].streak, 1);
});
