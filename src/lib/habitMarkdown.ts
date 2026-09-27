import { format, isAfter, isValid, parseISO, startOfDay } from 'date-fns';
import { availableIcons, defaultIconKey } from '@/components/icons';
import { getGenericGoalFallback, getGoalFallbackForCategory, getLocalizedCategoryName } from '@/lib/iconLocalization';
import type { Language } from '@/lib/translations';
import { defaultLanguage } from '@/lib/translations';
import type { Habit, HabitCompletion, HabitFrequency, HabitStatus, HabitType, UserDefinedCategory } from '@/lib/types';

export interface ParsedImportData {
  habits: Omit<Habit, 'id' | 'streak'>[];
  userCategories: UserDefinedCategory[];
}

const frequencies: HabitFrequency[] = ['daily', 'weekly', 'monthly'];
const types: HabitType[] = ['positive', 'negative'];

function parseLocalDay(value: string, now: Date): string {
  const date = parseISO(value);
  if (!isValid(date) || isAfter(startOfDay(date), startOfDay(now))) {
    throw new Error(`Invalid completion date: ${value}`);
  }
  return format(date, 'yyyy-MM-dd');
}

function sectionHeadings(markdown: string, heading: string): RegExpMatchArray[] {
  return [...markdown.matchAll(new RegExp(`^# ${heading}\\s*$`, 'gm'))];
}

function extractSection(markdown: string, heading: string): string | null {
  const matches = sectionHeadings(markdown, heading);
  if (matches.length > 1) throw new Error(`Duplicate ${heading} section`);
  const match = matches[0];
  if (!match || match.index === undefined) return null;
  const contentStart = match.index + match[0].length;
  const nextHeading = /^# /m.exec(markdown.slice(contentStart));
  return markdown.slice(contentStart, nextHeading ? contentStart + nextHeading.index : undefined).trim();
}

function parseHabitBlock(block: string, language: Language, now: Date): Omit<Habit, 'id' | 'streak'> {
  const fields: Record<string, string> = {};
  const completions: HabitCompletion[] = [];
  const completionDates = new Set<string>();
  let readingCompletions = false;

  for (const rawLine of block.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const nameMatch = /^(?:##|###)\s+(.+)$/.exec(line);
    if (nameMatch) {
      if (fields.name) throw new Error('Habit contains multiple names');
      fields.name = nameMatch[1].trim();
      continue;
    }
    if (line === '- Completions:') {
      if (readingCompletions) throw new Error('Habit contains multiple completion sections');
      readingCompletions = true;
      continue;
    }
    const completionMatch = /^- date: (.+?) \| status: (completed|failed|skipped)(?: \(Notes: (.*)\))?$/.exec(line);
    if (completionMatch) {
      if (!readingCompletions) throw new Error('Completion is outside its section');
      const date = parseLocalDay(completionMatch[1].trim(), now);
      if (completionDates.has(date)) throw new Error(`Duplicate completion date: ${date}`);
      completionDates.add(date);
      completions.push({ date, status: completionMatch[2] as HabitStatus, ...(completionMatch[3] ? { notes: completionMatch[3] } : {}) });
      continue;
    }
    const fieldMatch = /^- (DescriptionJSON|Description|IconKey|Goal|Frequency|Type|CreatedAt): (.*)$/.exec(line);
    if (!fieldMatch || readingCompletions || fields[fieldMatch[1]] !== undefined) {
      throw new Error(`Malformed habit line: ${line}`);
    }
    fields[fieldMatch[1]] = fieldMatch[2].trim();
  }

  if (fields.Description !== undefined && fields.DescriptionJSON !== undefined) {
    throw new Error('Habit contains both description formats');
  }
  let description: string | undefined;
  if (fields.DescriptionJSON !== undefined) {
    try {
      const parsedDescription: unknown = JSON.parse(fields.DescriptionJSON);
      if (typeof parsedDescription !== 'string') throw new Error('DescriptionJSON must contain a string');
      description = parsedDescription;
    } catch {
      throw new Error('Invalid DescriptionJSON');
    }
  } else if (fields.Description) {
    description = fields.Description;
  }

  const frequency = fields.Frequency as HabitFrequency;
  const type = fields.Type as HabitType;
  const createdAt = fields.CreatedAt ? parseISO(fields.CreatedAt) : null;
  if (!fields.name || !frequencies.includes(frequency) || !types.includes(type) || !createdAt || !isValid(createdAt) || isAfter(startOfDay(createdAt), startOfDay(now))) {
    throw new Error('Habit is incomplete or invalid');
  }

  const icon = fields.IconKey || defaultIconKey;
  const iconInfo = availableIcons[icon];
  if (!iconInfo) throw new Error(`Invalid icon: ${icon}`);
  const goal = fields.Goal || getGoalFallbackForCategory(iconInfo.category, language) || getGenericGoalFallback(language);
  return {
    name: fields.name,
    ...(description !== undefined ? { description } : {}),
    icon,
    goal,
    frequency,
    type,
    createdAt: createdAt.toISOString(),
    completions,
  };
}

function parseUserCategories(section: string): UserDefinedCategory[] {
  if (!section) return [];
  const categories: UserDefinedCategory[] = [];
  const ids = new Set<string>();
  for (const line of section.split('\n').map(value => value.trim()).filter(Boolean)) {
    const prefix = /^- id: ([\w-]+), name: /.exec(line);
    const delimiterIndex = line.lastIndexOf(', iconKey: ');
    if (!prefix || delimiterIndex < prefix[0].length) {
      throw new Error('Malformed user category');
    }
    const name = line.slice(prefix[0].length, delimiterIndex).trim();
    const iconKey = line.slice(delimiterIndex + ', iconKey: '.length);
    if (!name || !/^[\w\d_]+$/.test(iconKey) || !availableIcons[iconKey] || ids.has(prefix[1])) {
      throw new Error('Malformed user category');
    }
    ids.add(prefix[1]);
    categories.push({ id: prefix[1], name, iconKey });
  }
  return categories;
}

export function parseHabitMarkdown(markdown: string, language: Language = defaultLanguage, now: Date = new Date()): ParsedImportData {
  const habitsSection = extractSection(markdown, 'Habits Export');
  if (!habitsSection) throw new Error('Missing Habits Export section');
  if (sectionHeadings(markdown, 'User Categories Export').length > 1) {
    throw new Error('Duplicate User Categories Export section');
  }

  const noHabitsMarker = habitsSection === '## No Habits';
  const habits: Omit<Habit, 'id' | 'streak'>[] = [];
  if (!noHabitsMarker) {
    for (const fragment of habitsSection.split(/^---\s*$/m).map(value => value.trim()).filter(Boolean)) {
      if (/^## (?:Категория|Category): .+$/m.test(fragment) && fragment.split('\n').every(line => !line.trim() || /^## (?:Категория|Category): .+$/.test(line.trim()))) continue;
      habits.push(parseHabitBlock(fragment.replace(/^## (?:Категория|Category): .+$/gm, '').trim(), language, now));
    }
    if (habits.length === 0) throw new Error('No habits found');
  }

  const categorySection = extractSection(markdown, 'User Categories Export');
  return { habits, userCategories: categorySection === null ? [] : parseUserCategories(categorySection) };
}

export function formatHabitToMarkdown(
  habits: Habit[],
  userCategories: UserDefinedCategory[],
  language: Language = defaultLanguage,
): string {
  let markdown = '# Habits Export\n\n';
  if (habits.length === 0) markdown += '## No Habits\n\n';
  const habitsByCategory: Record<string, Habit[]> = {};
  const unknownCategoryKey = language === 'ru' ? 'Без категории' : 'No category';

  for (const habit of habits) {
    const iconKey = habit.icon || defaultIconKey;
    const categoryName = availableIcons[iconKey]?.category || unknownCategoryKey;
    (habitsByCategory[categoryName] ??= []).push(habit);
  }
  for (const categoryName of Object.keys(habitsByCategory).sort()) {
    const headingLabel = language === 'ru' ? 'Категория' : 'Category';
    const displayName = categoryName === unknownCategoryKey ? unknownCategoryKey : getLocalizedCategoryName(categoryName, language);
    markdown += `## ${headingLabel}: ${displayName}\n\n`;
    for (const habit of habitsByCategory[categoryName]) {
      markdown += '---\n';
      markdown += `### ${habit.name}\n`;
      markdown += `- DescriptionJSON: ${JSON.stringify(habit.description ?? '').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')}\n`;
      markdown += `- IconKey: ${habit.icon || defaultIconKey}\n`;
      markdown += `- Goal: ${habit.goal}\n`;
      markdown += `- Frequency: ${habit.frequency}\n`;
      markdown += `- Type: ${habit.type || 'positive'}\n`;
      markdown += `- CreatedAt: ${habit.createdAt}\n`;
      if (habit.completions.length > 0) {
        markdown += '- Completions:\n';
        for (const completion of [...habit.completions].sort((left, right) => left.date.localeCompare(right.date))) {
          markdown += `  - date: ${completion.date} | status: ${completion.status}`;
          if (completion.notes) markdown += ` (Notes: ${completion.notes})`;
          markdown += '\n';
        }
      }
      markdown += '---\n\n';
    }
  }
  if (userCategories.length > 0) {
    markdown += '# User Categories Export\n\n';
    for (const category of userCategories) markdown += `- id: ${category.id}, name: ${category.name}, iconKey: ${category.iconKey}\n`;
    markdown += '\n';
  }
  markdown += '# Standard Categories Export (for AI reference)\n';
  markdown += '## This section lists the main categories available in the application.\n';
  markdown += '## It is intended for AI assistants to correctly assign IconKey to habits.\n';
  markdown += '## The application itself does not import data from this section.\n\n';
  const iconsByCategory: Record<string, { key: string; name: string }[]> = {};
  for (const [key, iconOption] of Object.entries(availableIcons)) {
    (iconsByCategory[iconOption.category] ??= []).push({ key, name: iconOption.name });
  }
  for (const category of Object.keys(iconsByCategory).sort()) {
    markdown += `### ${category}\n`;
    for (const icon of iconsByCategory[category]) markdown += `- key: ${icon.key}, name: ${icon.name}\n`;
    markdown += '\n';
  }
  return markdown;
}
