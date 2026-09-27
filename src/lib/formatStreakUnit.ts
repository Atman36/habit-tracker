import { translations, type Language } from './translations';

/**
 * Formats the unit suffix appended after a streak count (e.g. "3" + formatStreakUnit(3, 'en') => "3 days").
 * EN pluralizes ("1 day" vs "2 days"); RU keeps the same unit for every count (review N2:
 * StatsOverview previously always used the plural EN string, rendering "1 days").
 */
export function formatStreakUnit(n: number, language: Language): string {
  const { streakUnit, streakUnitOne } = translations[language].stats.cards;
  return n === 1 ? streakUnitOne : streakUnit;
}
