import assert from 'node:assert/strict';
import test from 'node:test';
import { formatStreakUnit } from './formatStreakUnit';

test('formatStreakUnit pluralizes the EN streak unit and keeps the RU unit invariant', () => {
  assert.equal(formatStreakUnit(1, 'en'), ' day');
  assert.equal(formatStreakUnit(2, 'en'), ' days');
  assert.equal(formatStreakUnit(0, 'en'), ' days');
  assert.equal(formatStreakUnit(1, 'ru'), ' дн.');
  assert.equal(formatStreakUnit(5, 'ru'), ' дн.');
});
