# Инструкция по добавлению функции Daily Journal в Habit Tracker

## Проблема

При попытке добавить функцию журнала в проект возникла критическая ошибка в production build:
```
Cannot read properties of undefined (reading 'title')
```

Проблема связана с тем, что Next.js production build с tree-shaking удаляет новые поля переводов (`journal`), если webpack считает их неиспользуемыми.

---

## Задача

Добавить функцию **Daily Journal** со следующими возможностями:
- Три типа блоков: morning reflection, evening reflection, free text
- Отслеживание настроения (5 уровней с эмодзи)
- Автосохранение с debounce 500ms
- Сворачиваемый UI
- Экспорт/импорт в Markdown

---

## Что уже сделано (НО НЕ РАБОТАЕТ в production)

### 1. Типы добавлены в `src/lib/types.ts`

```typescript
// Journal system types
export type JournalBlockType = 'morning' | 'evening' | 'free_text';
export type MoodLevel = 1 | 2 | 3 | 4 | 5; // 1 = very bad, 5 = excellent

export interface JournalBlock {
  id: string;
  type: JournalBlockType;
  content: string;
}

export interface DayJournalEntry {
  date: string; // YYYY-MM-DD format
  blocks: JournalBlock[];
  mood?: MoodLevel;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

### 2. Переводы добавлены в `src/lib/translations.ts`

```typescript
interface JournalTranslations {
  title: string;
  description: string;
  noEntryTitle: string;
  noEntryDescription: string;
  addBlock: string;
  blocks: {
    morning: string;
    evening: string;
    freeText: string;
  };
  blockPlaceholders: {
    morning: string;
    evening: string;
    freeText: string;
  };
  mood: {
    label: string;
    levels: {
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
    };
  };
  autoSaved: string;
  deleteBlock: string;
  deleteBlockConfirm: string;
}

// В TranslationContent добавлено:
export interface TranslationContent {
  // ... другие поля
  journal: JournalTranslations;
}

// И сами переводы для en и ru:
export const translations: Record<Language, TranslationContent> = {
  en: {
    // ...
    journal: {
      title: 'Daily Journal',
      description: 'Reflect on your day and track your mood.',
      // ... полный набор переводов
    },
  },
  ru: {
    // ...
    journal: {
      title: 'Дневник',
      description: 'Рефлексия дня и отслеживание настроения.',
      // ... полный набор переводов
    },
  },
};
```

### 3. Компонент создан в `src/components/JournalEntry.tsx`

Компонент полностью реализован с:
- useDebounce hook для автосохранения
- Mood tracking с эмодзи
- Блочный редактор
- Collapsible UI

### 4. UI компонент Collapsible добавлен

Файл: `src/components/ui/collapsible.tsx`

```typescript
"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
```

### 5. Интеграция в HabitTrackerClient

- Добавлен localStorage key `journal_entries`
- Добавлен handleSaveJournalEntry
- Добавлена интеграция в Markdown export/import

---

## Почему это НЕ РАБОТАЕТ

**Основная проблема:** Next.js production build с webpack tree-shaking удаляет поле `journal` из объекта переводов.

**Попытки исправления:**

1. ❌ Прямой импорт `translations` - не помогло
2. ❌ Использование `translations[language]` вместо `useTranslations()` - не помогло
3. ❌ Fallback на English переводы - не помогло
4. ❌ Force rebuild без кэша - не помогло

**Вывод:** Проблема глубже - она связана с особенностями этого проекта и Next.js 15.

---

## Правильное решение (для будущей реализации)

### Вариант 1: Отдельный модуль переводов для журнала

**Создать файл:** `src/lib/journalTranslations.ts`

```typescript
export const journalTranslations = {
  en: {
    title: 'Daily Journal',
    description: 'Reflect on your day and track your mood.',
    noEntryTitle: 'No journal entry yet',
    noEntryDescription: 'Start writing to capture your thoughts for today.',
    addBlock: 'Add block',
    blocks: {
      morning: 'Morning reflection',
      evening: 'Evening reflection',
      freeText: 'Free notes',
    },
    blockPlaceholders: {
      morning: 'How do you feel this morning? What are your intentions for today?',
      evening: 'How was your day? What went well? What could be better?',
      freeText: 'Write your thoughts here...',
    },
    mood: {
      label: "Today's mood",
      levels: {
        1: 'Very bad',
        2: 'Bad',
        3: 'Okay',
        4: 'Good',
        5: 'Excellent',
      },
    },
    autoSaved: 'Auto-saved',
    deleteBlock: 'Delete block',
    deleteBlockConfirm: 'Are you sure you want to delete this block?',
  },
  ru: {
    title: 'Дневник',
    description: 'Рефлексия дня и отслеживание настроения.',
    noEntryTitle: 'Записей пока нет',
    noEntryDescription: 'Начните писать, чтобы сохранить мысли о сегодняшнем дне.',
    addBlock: 'Добавить блок',
    blocks: {
      morning: 'Утренняя рефлексия',
      evening: 'Вечерняя рефлексия',
      freeText: 'Свободные заметки',
    },
    blockPlaceholders: {
      morning: 'Как вы себя чувствуете утром? Какие планы на день?',
      evening: 'Как прошёл день? Что получилось хорошо? Что можно улучшить?',
      freeText: 'Напишите свои мысли здесь...',
    },
    mood: {
      label: 'Настроение сегодня',
      levels: {
        1: 'Очень плохо',
        2: 'Плохо',
        3: 'Нормально',
        4: 'Хорошо',
        5: 'Отлично',
      },
    },
    autoSaved: 'Сохранено',
    deleteBlock: 'Удалить блок',
    deleteBlockConfirm: 'Вы уверены, что хотите удалить этот блок?',
  },
} as const;

export type JournalTranslations = typeof journalTranslations.en;
```

**В компоненте JournalEntry.tsx:**

```typescript
import { journalTranslations } from '@/lib/journalTranslations';
import { useLanguage } from '@/components/LanguageProvider';

export function JournalEntry({ selectedDate, journalEntries, onSaveEntry }: JournalEntryProps) {
  const { language } = useLanguage();
  const t = journalTranslations[language];

  // Теперь используем t.title, t.description и т.д. напрямую
  // НЕ НУЖНО: t.journal.title
}
```

### Вариант 2: Использовать динамический импорт

```typescript
const [translations, setTranslations] = useState(null);

useEffect(() => {
  import('@/lib/translations').then((module) => {
    setTranslations(module.translations[language]);
  });
}, [language]);

if (!translations?.journal) {
  return null; // или загрузка
}
```

### Вариант 3: Server Component для переводов

Создать отдельный server component, который передает переводы как props.

---

## Пошаговая инструкция для агента

### Шаг 1: Создать отдельный модуль переводов

Создайте файл `src/lib/journalTranslations.ts` с содержимым из **Варианта 1** выше.

### Шаг 2: Обновить типы (уже сделано)

Типы в `src/lib/types.ts` уже добавлены и рабочие.

### Шаг 3: Создать UI компонент Collapsible (уже сделано)

Файл `src/components/ui/collapsible.tsx` уже создан.

### Шаг 4: Создать компонент JournalEntry

**ВАЖНО:** Использовать прямой импорт из `journalTranslations.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DayJournalEntry, JournalBlock, JournalBlockType, MoodLevel } from '@/lib/types';
import { useLanguage } from '@/components/LanguageProvider';
import { journalTranslations } from '@/lib/journalTranslations'; // ВАЖНО!
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Sun,
  Moon,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  BookOpen,
  Check
} from 'lucide-react';

interface JournalEntryProps {
  selectedDate: string;
  journalEntries: DayJournalEntry[];
  onSaveEntry: (entry: DayJournalEntry) => void;
}

const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
};

const BLOCK_ICONS: Record<JournalBlockType, React.ComponentType<{ className?: string }>> = {
  morning: Sun,
  evening: Moon,
  free_text: FileText,
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function JournalEntry({ selectedDate, journalEntries, onSaveEntry }: JournalEntryProps) {
  const { language } = useLanguage();
  const t = journalTranslations[language]; // ВАЖНО: прямой доступ

  const [isOpen, setIsOpen] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Find or create entry for selected date
  const existingEntry = journalEntries.find(entry => entry.date === selectedDate);

  const [localEntry, setLocalEntry] = useState<DayJournalEntry>(() => {
    if (existingEntry) {
      return existingEntry;
    }
    return {
      date: selectedDate,
      blocks: [],
      mood: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Update local entry when date changes
  useEffect(() => {
    const entry = journalEntries.find(e => e.date === selectedDate);
    if (entry) {
      setLocalEntry(entry);
    } else {
      setLocalEntry({
        date: selectedDate,
        blocks: [],
        mood: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [selectedDate, journalEntries]);

  // Debounced value for auto-save
  const debouncedEntry = useDebounce(localEntry, 500);

  // Auto-save when debounced value changes
  useEffect(() => {
    const hasContent = debouncedEntry.blocks.some(b => b.content.trim()) || debouncedEntry.mood !== undefined;

    if (hasContent) {
      const entryToSave = {
        ...debouncedEntry,
        updatedAt: new Date().toISOString(),
      };
      onSaveEntry(entryToSave);

      setShowSaved(true);
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
      savedTimeoutRef.current = setTimeout(() => {
        setShowSaved(false);
      }, 2000);
    }
  }, [debouncedEntry, onSaveEntry]);

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  const addBlock = useCallback((type: JournalBlockType) => {
    const newBlock: JournalBlock = {
      id: crypto.randomUUID(),
      type,
      content: '',
    };
    setLocalEntry(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateBlockContent = useCallback((blockId: string, content: string) => {
    setLocalEntry(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId ? { ...block, content } : block
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setLocalEntry(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const setMood = useCallback((mood: MoodLevel | undefined) => {
    setLocalEntry(prev => ({
      ...prev,
      mood,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const getBlockTitle = (type: JournalBlockType): string => {
    switch (type) {
      case 'morning':
        return t.blocks.morning;
      case 'evening':
        return t.blocks.evening;
      case 'free_text':
        return t.blocks.freeText;
      default:
        return '';
    }
  };

  const getBlockPlaceholder = (type: JournalBlockType): string => {
    switch (type) {
      case 'morning':
        return t.blockPlaceholders.morning;
      case 'evening':
        return t.blockPlaceholders.evening;
      case 'free_text':
        return t.blockPlaceholders.freeText;
      default:
        return '';
    }
  };

  const hasBlocks = localEntry.blocks.length > 0;
  const hasMood = localEntry.mood !== undefined;

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{t.title}</CardTitle>
                {hasMood && (
                  <span className="text-lg ml-2">{MOOD_EMOJIS[localEntry.mood!]}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showSaved && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {t.autoSaved}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </div>
            </div>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Mood selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{t.mood.label}:</span>
              <div className="flex gap-1">
                {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setMood(localEntry.mood === level ? undefined : level)}
                    className={cn(
                      "text-2xl p-1 rounded-md transition-all hover:scale-110",
                      localEntry.mood === level
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "opacity-50 hover:opacity-100"
                    )}
                    title={t.mood.levels[level]}
                  >
                    {MOOD_EMOJIS[level]}
                  </button>
                ))}
              </div>
            </div>

            {/* Journal blocks */}
            {localEntry.blocks.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t.noEntryTitle}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {t.noEntryDescription}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {localEntry.blocks.map((block) => {
                  const IconComponent = BLOCK_ICONS[block.type];
                  return (
                    <div key={block.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <IconComponent className="h-4 w-4" />
                          {getBlockTitle(block.type)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBlock(block.id)}
                          className="h-7 px-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Textarea
                        value={block.content}
                        onChange={(e) => updateBlockContent(block.id, e.target.value)}
                        placeholder={getBlockPlaceholder(block.type)}
                        className="min-h-[100px] resize-y"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add block button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t.addBlock}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem onClick={() => addBlock('morning')}>
                  <Sun className="h-4 w-4 mr-2" />
                  {t.blocks.morning}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBlock('evening')}>
                  <Moon className="h-4 w-4 mr-2" />
                  {t.blocks.evening}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBlock('free_text')}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t.blocks.freeText}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
```

### Шаг 5: Интегрировать в HabitTrackerClient

В `src/components/HabitTrackerClient.tsx`:

```typescript
// Импорты
import { JournalEntry } from './JournalEntry';

// В компоненте добавить state
const [journalEntries, setJournalEntries] = useLocalStorage<DayJournalEntry[]>('journal_entries', []);

// Добавить handler
const handleSaveJournalEntry = useCallback((entry: DayJournalEntry) => {
  setJournalEntries(prev => {
    const existingIndex = prev.findIndex(e => e.date === entry.date);
    if (existingIndex > -1) {
      const updated = [...prev];
      updated[existingIndex] = entry;
      return updated;
    }
    return [...prev, entry];
  });
}, [setJournalEntries]);

// В JSX добавить компонент
<JournalEntry
  selectedDate={selectedDateString}
  journalEntries={journalEntries}
  onSaveEntry={handleSaveJournalEntry}
/>
```

### Шаг 6: Markdown Export/Import

В `HabitTrackerClient.tsx` уже добавлена логика для export/import журнала. Проверьте что она работает корректно.

### Шаг 7: Тестирование

1. **Проверьте в dev режиме:** `npm run dev`
2. **Проверьте production build:** `npm run build`
3. **Проверьте оба языка:** переключите EN/RU
4. **Проверьте автосохранение:** введите текст и подождите 500ms
5. **Проверьте mood tracking:** выберите настроение
6. **Проверьте export/import:** экспортируйте и импортируйте данные

---

## Критически важные моменты

### ❌ НЕ ДЕЛАТЬ:

1. **НЕ добавляйте** переводы журнала в основной файл `translations.ts` - это вызывает проблемы с tree-shaking
2. **НЕ используйте** `useTranslations().journal` - это не работает в production
3. **НЕ используйте** `t.journal.*` - используйте прямой доступ `t.*`

### ✅ ДЕЛАТЬ:

1. **Используйте** отдельный модуль `journalTranslations.ts`
2. **Используйте** прямой импорт: `import { journalTranslations } from '@/lib/journalTranslations'`
3. **Используйте** прямой доступ: `const t = journalTranslations[language]`
4. **Тестируйте** в production build перед коммитом

---

## Откат к рабочей версии

Если нужно откатиться:

```bash
git checkout e9acd4b  # последний рабочий коммит перед изменениями
```

Или:

```bash
git revert d7db091..HEAD  # откат всех изменений журнала
```

---

## Контрольный чеклист

- [ ] Создан файл `src/lib/journalTranslations.ts`
- [ ] Типы добавлены в `src/lib/types.ts`
- [ ] UI компонент `collapsible.tsx` создан
- [ ] Компонент `JournalEntry.tsx` создан и использует `journalTranslations`
- [ ] Интеграция в `HabitTrackerClient.tsx` завершена
- [ ] localStorage key `journal_entries` используется
- [ ] Markdown export/import работает
- [ ] Тестирование в dev режиме успешно
- [ ] Тестирование production build успешно
- [ ] Оба языка (EN/RU) работают
- [ ] Автосохранение работает
- [ ] CLAUDE.md обновлен

---

## Дополнительные ресурсы

- CLAUDE.md - документация проекта
- Примеры других компонентов в `src/components/`
- Существующие переводы в `src/lib/translations.ts`

---

**Последнее обновление:** 2025-11-21

**Статус:** Функция журнала временно отключена из-за проблем с переводами в production build
