import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveUserAchievements, getAchievementsToPersist, isSameUserAchievements, normalizeStoredUserAchievements, updateUserAchievements } from './achievements';
import type { Achievement, Habit, UserAchievements } from './types';

// Mirrors the placeholder initial state of useLocalStorage('unlocked_achievements', ...)
// on the first (hydration) render, before the stored value has been applied.
const EMPTY: UserAchievements = { unlockedAchievements: [], totalPoints: 0, level: 1 };

const createdAt = new Date(2026, 8, 1, 12).toISOString();
const habit = (id: string): Habit => ({
  id,
  name: `Habit ${id}`,
  icon: 'CheckCircle',
  goal: 'Goal',
  frequency: 'daily',
  type: 'positive',
  createdAt,
  streak: 0,
  completions: [],
});

// A persisted habit_creator (common = 10 pts, level 1) earned on 2026-09-01;
// its condition (>= 10 habits) no longer holds for the seeded datasets below.
const seededCreator: Achievement = {
  id: 'seeded-creator',
  type: 'habit_creator',
  name: 'Habit Architect',
  description: 'Create 10 distinct habits',
  badgeIcon: 'habit_creator.svg',
  rarity: 'common',
  unlockedAt: '2026-09-01T00:00:00.000Z',
  progress: 10,
  maxProgress: 10,
  category: 'Creativity',
};
const storedWithCreator: UserAchievements = {
  unlockedAchievements: [seededCreator],
  totalPoints: 10,
  level: 1,
};

test('null stored achievements fall back to the empty state', () => {
  assert.deepEqual(normalizeStoredUserAchievements(null), EMPTY);
});

test('an object without an achievement array falls back to the empty state', () => {
  assert.deepEqual(normalizeStoredUserAchievements({}), EMPTY);
});

test('an achievement with an unknown rarity is dropped while the stored totals are kept', () => {
  assert.deepEqual(normalizeStoredUserAchievements({
    unlockedAchievements: [{ ...seededCreator, rarity: 'mythic' }],
    totalPoints: 10,
    level: 1,
  }), { unlockedAchievements: [], totalPoints: 10, level: 1 });
});

test('one invalid element does not discard the valid ones, and the next unlock keeps them', () => {
  const normalized = normalizeStoredUserAchievements({
    unlockedAchievements: [
      { ...seededCreator, id: 'bad-rarity', rarity: 'mythic' },
      seededCreator,
      null,
    ],
    totalPoints: 10,
    level: 1,
  });
  assert.equal(normalized.unlockedAchievements.length, 1);
  assert.equal(normalized.unlockedAchievements[0], seededCreator);
  assert.equal(normalized.totalPoints, 10);
  assert.equal(normalized.level, 1);

  // A legitimate unlock (7-day streak) on top of the normalized value still carries the creator.
  const streaky = { ...habit('streaky'), streak: 7 };
  const afterUnlock = updateUserAchievements([streaky], normalized);
  assert.equal(afterUnlock.unlockedAchievements[0], seededCreator);
  assert.deepEqual(afterUnlock.unlockedAchievements.map(a => a.type), ['habit_creator', 'first_week']);
});

test('a non-array achievement list still falls back to the empty state', () => {
  assert.deepEqual(normalizeStoredUserAchievements({
    unlockedAchievements: { 0: seededCreator },
    totalPoints: 10,
    level: 1,
  }), EMPTY);
});

test('a stored element with an unknown achievement type is dropped while a valid sibling is kept', () => {
  const normalized = normalizeStoredUserAchievements({
    unlockedAchievements: [
      { ...seededCreator, id: 'unknown-type', type: 'not_a_real_type' },
      { ...seededCreator, id: 'proto-type', type: '__proto__' },
      seededCreator,
    ],
    totalPoints: 10,
    level: 1,
  });
  assert.deepEqual(normalized.unlockedAchievements, [seededCreator]);
});

test('a stored element without unlockedAt is dropped because the UI would treat it as locked', () => {
  const withoutUnlockedAt: Record<string, unknown> = { ...seededCreator };
  delete withoutUnlockedAt.unlockedAt;
  const normalized = normalizeStoredUserAchievements({
    unlockedAchievements: [
      withoutUnlockedAt,
      { ...seededCreator, id: 'undefined-stamp', unlockedAt: undefined },
      { ...seededCreator, id: 'numeric-stamp', unlockedAt: 5 },
      seededCreator,
    ],
    totalPoints: 10,
    level: 1,
  });
  assert.deepEqual(normalized.unlockedAchievements, [seededCreator]);
});

test('non-finite achievement totals fall back without causing repeat writes', () => {
  for (const corrupted of [
    { unlockedAchievements: [], totalPoints: Number.NaN, level: 1 },
    { unlockedAchievements: [], totalPoints: 0, level: Number.NaN },
  ]) {
    const normalized = normalizeStoredUserAchievements(corrupted);
    assert.deepEqual(normalized, EMPTY);
    assert.equal(
      getAchievementsToPersist(true, normalized, updateUserAchievements([], normalized)),
      null,
    );
  }
});

test('stale stored streaks do not unlock achievements before habit normalization', () => {
  const staleHabit = { ...habit('stale-streak'), streak: 7 };
  const derived = deriveUserAchievements(
    [staleHabit],
    EMPTY,
    new Date(2026, 8, 29, 12),
  );

  assert.equal(staleHabit.streak, 7);
  assert.deepEqual(derived.unlockedAchievements.map(achievement => achievement.type), []);
});

test('nothing is persisted before hydration lands, so a mount cannot erase stored achievements', () => {
  // What the memo computes on the first render: both inputs are still placeholders,
  // so the derived value contains no unlocked achievements.
  const computedOnMount = updateUserAchievements([], EMPTY);
  assert.equal(computedOnMount.unlockedAchievements.length, 0);

  // Writing that value to storage is exactly what destroyed the persisted state.
  // The decision must be "no write" until hydration of habits + stored achievements.
  assert.equal(getAchievementsToPersist(false, storedWithCreator, computedOnMount), null);
  // Even when the pre-hydration value already "contains" unlocks, still no write.
  assert.equal(getAchievementsToPersist(false, storedWithCreator, storedWithCreator), null);
});

test('after hydration a valid stored achievement survives although its condition no longer holds', () => {
  const normalizedStored = normalizeStoredUserAchievements(storedWithCreator);
  const computed = updateUserAchievements([habit('only-one')], normalizedStored);

  // Carried by reference with the original unlockedAt — never revoked, never re-stamped.
  assert.equal(computed.unlockedAchievements.length, 1);
  assert.equal(computed.unlockedAchievements[0], seededCreator);
  assert.equal(computed.unlockedAchievements[0].unlockedAt, '2026-09-01T00:00:00.000Z');

  // Content unchanged -> no write, so localStorage keeps the seeded achievement.
  assert.equal(getAchievementsToPersist(true, normalizedStored, computed), null);
});

test('a new unlock after hydration is persisted, then reaches a fixed point without further writes', () => {
  const tenHabits = Array.from({ length: 10 }, (_, i) => habit(`h-${i}`));
  const computed = updateUserAchievements(tenHabits, EMPTY);

  assert.equal(computed.unlockedAchievements.length, 1);
  assert.equal(computed.unlockedAchievements[0].type, 'habit_creator');

  // New unlock -> write the computed value.
  assert.equal(getAchievementsToPersist(true, EMPTY, computed), computed);

  // Re-running against the now-stored value changes nothing: same reference carried,
  // fresh wrapper object compared equal by content -> no second write, no re-stamp.
  const recomputed = updateUserAchievements(tenHabits, computed);
  assert.equal(recomputed.unlockedAchievements[0], computed.unlockedAchievements[0]);
  assert.equal(getAchievementsToPersist(true, computed, recomputed), null);
});

test('isSameUserAchievements detects fresh-but-equal wrappers and added achievements', () => {
  const carried = updateUserAchievements([habit('only-one')], storedWithCreator);
  assert.equal(isSameUserAchievements(storedWithCreator, carried), true);
  // A habit with a 7-day streak unlocks first_week on top of the stored creator.
  const streaky = { ...habit('streaky'), streak: 7 };
  const withNewUnlock = updateUserAchievements([streaky], storedWithCreator);
  assert.equal(isSameUserAchievements(storedWithCreator, withNewUnlock), false);
});

test('isSameUserAchievements treats two wrappers with NaN totals as the same', () => {
  const a: UserAchievements = { unlockedAchievements: [seededCreator], totalPoints: Number.NaN, level: 1 };
  const b: UserAchievements = { unlockedAchievements: [seededCreator], totalPoints: Number.NaN, level: 1 };
  assert.equal(isSameUserAchievements(a, b), true);
});
