'use client';

import { useState, useMemo } from 'react';
import type { UserDefinedCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { availableIcons, getIconComponent, defaultIconKey } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, Trash2, ChevronDown, Sun, Moon, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Separator } from '@/components/ui/separator';
import { useTranslations, useLanguage } from '@/components/LanguageProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getLocalizedIconName } from '@/lib/iconLocalization';

interface CategorySettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userCategories: UserDefinedCategory[];
  onAddCategory: (name: string, iconKey: string) => void;
  onDeleteCategory: (id: string) => void;
  // New props for compact view and analytics sections
  isCompactHabitView: boolean;
  onCompactHabitViewToggle: (compact: boolean) => void;
  isMinimalHabitView: boolean;
  onMinimalHabitViewToggle: (minimal: boolean) => void;
  showStatsOverviewSection: boolean;
  onShowStatsOverviewSectionToggle: (show: boolean) => void;
  showWeeklyProgressSection: boolean;
  onShowWeeklyProgressSectionToggle: (show: boolean) => void;
}

const PANEL_HEADING_CLASS = 'font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground';
const SUB_HEADING_CLASS = 'font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground';

const THEME_OPTIONS = [
  { value: 'light', Icon: Sun },
  { value: 'dark', Icon: Moon },
  { value: 'system', Icon: Laptop },
] as const;

export function CategorySettingsDialog({
  isOpen,
  onClose,
  userCategories,
  onAddCategory,
  onDeleteCategory,
  // New destructured props
  isCompactHabitView,
  onCompactHabitViewToggle,
  isMinimalHabitView,
  onMinimalHabitViewToggle,
  showStatsOverviewSection,
  onShowStatsOverviewSectionToggle,
  showWeeklyProgressSection,
  onShowWeeklyProgressSectionToggle,
}: CategorySettingsDialogProps) {
  const t = useTranslations();
  const { language } = useLanguage();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIconKey, setSelectedIconKey] = useState<string>(defaultIconKey);
  const [isIconPopoverOpen, setIsIconPopoverOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleAddCategory = () => {
    if (newCategoryName.trim() && selectedIconKey) {
      onAddCategory(newCategoryName.trim(), selectedIconKey);
      setNewCategoryName('');
      setSelectedIconKey(defaultIconKey);
    }
  };

  const groupedAvailableIcons = useMemo(() => Object.entries(availableIcons)
    .reduce((acc, [key, iconOption]) => {
    if (!acc[iconOption.category]) {
      acc[iconOption.category] = [];
    }
    acc[iconOption.category].push({ key, ...iconOption });
    return acc;
  }, {} as Record<string, (typeof availableIcons[string] & {key: string})[]>), []);


  const SelectedIconVisual = getIconComponent(selectedIconKey);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="font-display uppercase">{t.categorySettings.title}</DialogTitle>
          <DialogDescription>
            {t.categorySettings.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Theme and View Settings */}
          <div className="space-y-4 rounded-panel border-2 border-border p-3">
            <h3 className={PANEL_HEADING_CLASS}>{t.categorySettings.appearanceTitle}</h3>

            {/* Theme Switcher */}
            <div className="flex items-center justify-between">
              <Label className={SUB_HEADING_CLASS}>{t.categorySettings.themeLabel}</Label>
              <div className="flex gap-1">
                {THEME_OPTIONS.map(({ value, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    title={t.themeSwitcher[value]}
                    aria-label={t.themeSwitcher[value]}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 border-border transition-colors",
                      theme === value ? "bg-foreground text-background" : "bg-card text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center justify-between">
              <Label className={SUB_HEADING_CLASS}>{t.categorySettings.languageLabel}</Label>
              <LanguageSwitcher className="w-[150px]" />
            </div>
          </div>

          {/* Habit list detail + analytics visibility */}
          <div className="space-y-4 rounded-panel border-2 border-border p-3">
            <h3 className={PANEL_HEADING_CLASS}>{t.categorySettings.detailLabel}</h3>

            {/* Compact Habit View Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t.categorySettings.compactLabel}</span>
                </div>
                <Switch
                  checked={isCompactHabitView}
                  onCheckedChange={(checked) => {
                    onCompactHabitViewToggle(checked);
                    if (checked) {
                      onMinimalHabitViewToggle(false); // Disable minimal when compact is enabled
                    }
                  }}
                  aria-label={t.categorySettings.compactLabel}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t.categorySettings.minimalLabel}</span>
                </div>
                <Switch
                  checked={isMinimalHabitView}
                  onCheckedChange={(checked) => {
                    onMinimalHabitViewToggle(checked);
                    if (checked) {
                      onCompactHabitViewToggle(false); // Disable compact when minimal is enabled
                    }
                  }}
                  aria-label={t.categorySettings.minimalLabel}
                />
              </div>
            </div>

            <Separator />

            {/* Analytics Sections Toggles */}
            <div className="space-y-3">
              <h4 className={SUB_HEADING_CLASS}>{t.categorySettings.analyticsTitle}</h4>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t.categorySettings.statsLabel}</span>
                </div>
                <Switch
                  checked={showStatsOverviewSection}
                  onCheckedChange={onShowStatsOverviewSectionToggle}
                  aria-label={t.categorySettings.statsLabel}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t.categorySettings.weeklyLabel}</span>
                </div>
                <Switch
                  checked={showWeeklyProgressSection}
                  onCheckedChange={onShowWeeklyProgressSectionToggle}
                  aria-label={t.categorySettings.weeklyLabel}
                />
              </div>
            </div>
          </div>

          {/* Category Management */}
          <div className="space-y-4 rounded-panel border-2 border-border p-3">
            <h3 className={PANEL_HEADING_CLASS}>{t.categorySettings.manageTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.categorySettings.manageDescription}</p>
            <div className="space-y-2">
              <Label htmlFor="newCategoryName" className={SUB_HEADING_CLASS}>{t.categorySettings.newCategoryLabel}</Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={t.categorySettings.newCategoryPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label className={SUB_HEADING_CLASS}>{t.categorySettings.chooseIconLabel}</Label>
              <Popover open={isIconPopoverOpen} onOpenChange={setIsIconPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <div className="flex items-center gap-2 flex-1">
                      <SelectedIconVisual className="h-4 w-4" />
                      <span className="truncate">{getLocalizedIconName(selectedIconKey, language) || t.categorySettings.chooseIconPlaceholder}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <ScrollArea className="h-[280px]">
                    <div className="p-2 space-y-2">
                    {Object.entries(groupedAvailableIcons).map(([categoryName, iconsInCategory]) => (
                      <div key={categoryName}>
                        <p className={cn(SUB_HEADING_CLASS, "px-1 py-1")}>{categoryName}</p>
                        <div className="grid grid-cols-6 gap-1.5 px-1">
                          {iconsInCategory.map((iconOption) => {
                            const IconComp = iconOption.icon;
                            const isSelected = selectedIconKey === iconOption.key;
                            return (
                              <button
                                key={iconOption.key}
                                type="button"
                                title={iconOption.name}
                                onClick={() => {
                                  setSelectedIconKey(iconOption.key);
                                  setIsIconPopoverOpen(false);
                                }}
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-panel border-2 border-border bg-card p-2 transition-colors",
                                  isSelected && "border-secondary bg-[#F0EBFF] !shadow-[0_2px_0_hsl(var(--secondary))] dark:bg-muted"
                                )}
                              >
                                <IconComp className="h-full w-full" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            <Button variant="secondary" onClick={handleAddCategory} disabled={!newCategoryName.trim() || !selectedIconKey}>
              <Save className="mr-2 h-4 w-4" /> {t.categorySettings.saveCategory}
            </Button>

            {userCategories.length > 0 && (
              <div className="space-y-2">
                <h4 className={SUB_HEADING_CLASS}>{t.categorySettings.yourCategoriesTitle}</h4>
                <ScrollArea className="h-[150px]">
                  <ul className="space-y-1.5">
                    {userCategories.map((category) => {
                      const IconComp = getIconComponent(category.iconKey);
                      return (
                        <li key={category.id} className="flex items-center justify-between gap-2 rounded-field border-2 border-border bg-card p-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-border bg-muted">
                              <IconComp className="h-4 w-4" />
                            </span>
                            <span className="truncate text-sm" title={category.name}>{category.name}</span>
                            <span className="truncate text-xs text-muted-foreground" title={getLocalizedIconName(category.iconKey, language)}>({getLocalizedIconName(category.iconKey, language)})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteCategory(category.id)}
                            aria-label={`Удалить категорию ${category.name}`}
                            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md border-2 border-border text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              {t.categorySettings.closeButton}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
