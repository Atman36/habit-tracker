import assert from 'node:assert/strict';
import test from 'node:test';
import { formatHabitToMarkdown, parseHabitMarkdown } from './habitMarkdown';

const now = new Date(2026, 2, 18, 12);
const validHabit = `### Read
- IconKey: CheckCircle
- Goal: Read a chapter
- Frequency: weekly
- Type: positive
- CreatedAt: 2026-03-01T12:00:00.000Z
- Completions:
  - date: 2026-03-16 | status: completed`;
const markdown = (body = validHabit) => `# Habits Export

---
${body}
---
`;

test('Markdown export round-trips JSON descriptions, canonical completions, and comma-bearing English categories', () => {
  const source = {
    id: 'habit-1', name: 'Read', description: 'First line\nSecond \\ line, exactly.', icon: 'CheckCircle', goal: 'Read a chapter', frequency: 'weekly' as const,
    type: 'positive' as const, createdAt: '2026-03-01T12:00:00.000Z', streak: 0,
    completions: [{ date: '2026-03-16', status: 'completed' as const }],
  };
  const emptyDescriptionSource = { ...source, id: 'habit-2', name: 'Empty', description: '' };
  const categories = [{ id: 'work', name: 'Work, personal', iconKey: 'CheckCircle' }];
  const exported = formatHabitToMarkdown([source, emptyDescriptionSource], categories, 'en');
  const parsed = parseHabitMarkdown(exported, 'en', now);
  assert.equal(parsed.habits[0].description, source.description);
  assert.equal(parsed.habits[1].description, '');
  assert.deepEqual(parsed.userCategories, categories);
});

test('Markdown export round-trips category-only backups through the explicit no-habits marker', () => {
  const categories = [{ id: 'work', name: 'Work, personal', iconKey: 'CheckCircle' }];
  const exported = formatHabitToMarkdown([], categories, 'en');

  assert.ok(exported.includes('# Habits Export\n\n## No Habits\n'));
  assert.deepEqual(parseHabitMarkdown(exported, 'en', now), { habits: [], userCategories: categories });
});

test('Markdown export escapes Unicode line separators in DescriptionJSON and restores them exactly', () => {
  const source = {
    id: 'habit-1', name: 'Read', description: 'Before\u2028between\u2029after', icon: 'CheckCircle', goal: 'Read a chapter', frequency: 'weekly' as const,
    type: 'positive' as const, createdAt: '2026-03-01T12:00:00.000Z', streak: 0, completions: [],
  };
  const exported = formatHabitToMarkdown([source], [], 'en');

  assert.ok(exported.includes('DescriptionJSON: "Before\\u2028between\\u2029after"'));
  assert.equal(parseHabitMarkdown(exported, 'en', now).habits[0].description, source.description);
});

test('Markdown import accepts Russian category headings', () => {
  const parsed = parseHabitMarkdown(`# Habits Export

## Категория: Общее

---
${validHabit}
---
`, 'ru', now);
  assert.equal(parsed.habits.length, 1);
});

test('Markdown import rejects unrelated, unmarked, and non-exclusive zero-habit payloads', () => {
  assert.throws(() => parseHabitMarkdown('# Something Else\n', 'en', now));
  assert.throws(() => parseHabitMarkdown('# Habits Export\n', 'en', now));
  assert.throws(() => parseHabitMarkdown('# Habits Export\n\n## Category: Health\n', 'en', now));
  assert.throws(() => parseHabitMarkdown('# Habits Export\n\n## No Habits\n---\n', 'en', now));
});

test('Markdown import rejects incomplete and invalid habit blocks', () => {
  assert.throws(() => parseHabitMarkdown(markdown('### Read\n- Frequency: yearly\n- Type: positive\n- CreatedAt: 2026-03-01T12:00:00.000Z'), 'en', now));
  assert.throws(() => parseHabitMarkdown(markdown(validHabit.replace('2026-03-16', 'not-a-date')), 'en', now));
});

test('Markdown import rejects future completion dates', () => {
  assert.throws(() => parseHabitMarkdown(markdown(validHabit.replace('2026-03-16', '2026-03-19')), 'en', now));
});

test('Markdown import rejects duplicate canonical completion dates', () => {
  const duplicateDay = markdown(`${validHabit}\n  - date: 2026-03-16T00:00:00 | status: failed`);
  assert.throws(() => parseHabitMarkdown(duplicateDay, 'en', now));
});

test('Markdown import rejects duplicate export sections before parsing habit blocks', () => {
  assert.throws(() => parseHabitMarkdown(`${markdown()}
# Habits Export
`, 'en', now));
  assert.throws(() => parseHabitMarkdown(`${markdown()}
# User Categories Export
- id: work, name: Work, iconKey: CheckCircle
# User Categories Export
`, 'en', now));
});

test('Markdown import remains compatible with legacy single-line descriptions', () => {
  const parsed = parseHabitMarkdown(markdown(validHabit.replace('- IconKey:', '- Description: Legacy description\n- IconKey:')), 'en', now);
  assert.equal(parsed.habits[0].description, 'Legacy description');
});

test('Markdown import rejects invalid or duplicated description formats', () => {
  assert.throws(() => parseHabitMarkdown(markdown(validHabit.replace('- IconKey:', '- DescriptionJSON: 1\n- IconKey:')), 'en', now));
  assert.throws(() => parseHabitMarkdown(markdown(validHabit.replace('- IconKey:', '- Description: legacy\n- DescriptionJSON: "new"\n- IconKey:')), 'en', now));
});
