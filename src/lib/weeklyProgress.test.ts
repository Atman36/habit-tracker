import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateWeeklyStats } from './weeklyProgress';

test('current-week aggregate excludes future days while retaining their display data', () => {
  const monday = new Date(2026, 2, 16, 12);
  const stats = calculateWeeklyStats([
    { date: monday, activeHabitsCount: 2, completedHabitsCount: 1 },
    { date: new Date(2026, 2, 17, 12), activeHabitsCount: 2, completedHabitsCount: 2 },
  ], monday);
  assert.deepEqual(stats, { totalCompleted: 1, totalPossible: 2, overallPercentage: 50 });
});
