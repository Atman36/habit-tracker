'use client';

// Daily Journal with mood tracking and auto-save
import { useState, useEffect, useCallback, useRef } from 'react';
import type { DayJournalEntry, JournalBlock, JournalBlockType, MoodLevel } from '@/lib/types';
import { useTranslations, useLanguage } from '@/components/LanguageProvider';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  selectedDate: string; // YYYY-MM-DD format
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
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback to English if journal translations missing
  const journalT = t.journal || translations.en.journal;

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
    // Only save if there's actual content (blocks with content or mood set)
    const hasContent = debouncedEntry.blocks.some(b => b.content.trim()) || debouncedEntry.mood !== undefined;

    if (hasContent) {
      const entryToSave = {
        ...debouncedEntry,
        updatedAt: new Date().toISOString(),
      };
      onSaveEntry(entryToSave);

      // Show saved indicator
      setShowSaved(true);
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
      savedTimeoutRef.current = setTimeout(() => {
        setShowSaved(false);
      }, 2000);
    }
  }, [debouncedEntry, onSaveEntry]);

  // Cleanup timeout on unmount
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
        return journalT.blocks.morning;
      case 'evening':
        return journalT.blocks.evening;
      case 'free_text':
        return journalT.blocks.freeText;
      default:
        return '';
    }
  };

  const getBlockPlaceholder = (type: JournalBlockType): string => {
    switch (type) {
      case 'morning':
        return journalT.blockPlaceholders.morning;
      case 'evening':
        return journalT.blockPlaceholders.evening;
      case 'free_text':
        return journalT.blockPlaceholders.freeText;
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
                <CardTitle className="text-lg">{journalT.title}</CardTitle>
                {hasMood && (
                  <span className="text-lg ml-2">{MOOD_EMOJIS[localEntry.mood!]}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showSaved && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {journalT.autoSaved}
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
            <CardDescription>{journalT.description}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Mood selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{journalT.mood.label}:</span>
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
                    title={journalT.mood.levels[level]}
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
                  {journalT.noEntryTitle}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {journalT.noEntryDescription}
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
                  {journalT.addBlock}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem onClick={() => addBlock('morning')}>
                  <Sun className="h-4 w-4 mr-2" />
                  {journalT.blocks.morning}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBlock('evening')}>
                  <Moon className="h-4 w-4 mr-2" />
                  {journalT.blocks.evening}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addBlock('free_text')}>
                  <FileText className="h-4 w-4 mr-2" />
                  {journalT.blocks.freeText}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
