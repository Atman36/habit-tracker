'use client';

import React, { useState, useMemo } from 'react';
import type { IconOption, UserDefinedCategory } from '@/lib/types';
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
import { SelectGroup, SelectLabel } from '@/components/ui/select'; // Keep for Popover grouping if needed
import { availableIcons, getIconComponent, defaultIconKey } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Save, Trash2, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/components/LanguageProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIconKey, setSelectedIconKey] = useState<string>(defaultIconKey);
  const [isIconPopoverOpen, setIsIconPopoverOpen] = useState(false);

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
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t.categorySettings.title}</DialogTitle>
          <DialogDescription>
            {t.categorySettings.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme and View Settings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">{t.categorySettings.appearanceTitle}</h3>
            
            {/* Theme Switcher */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t.categorySettings.themeLabel}</Label>
              <ThemeSwitcher />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t.categorySettings.languageLabel}</Label>
              <LanguageSwitcher className="w-[150px]" />
            </div>
            
            <Separator />

            {/* Compact Habit View Toggle */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t.categorySettings.detailLabel}</Label>
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
              <Label className="text-sm font-medium">{t.categorySettings.analyticsTitle}</Label>
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

          <Separator />
          {/* Category Management */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">{t.categorySettings.manageTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.categorySettings.manageDescription}</p>
            <div className="space-y-2">
              <Label htmlFor="newCategoryName">{t.categorySettings.newCategoryLabel}</Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={t.categorySettings.newCategoryPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.categorySettings.chooseIconLabel}</Label>
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
                    <div className="p-2 space-y-1">
                    {Object.entries(groupedAvailableIcons).map(([categoryName, iconsInCategory]) => (
                      <div key={categoryName}>
                        <p className="text-xs font-semibold text-muted-foreground px-2 py-1">{categoryName}</p>
                        <div className="grid grid-cols-6 gap-1 px-1">
                          {iconsInCategory.map((iconOption) => {
                            const IconComp = iconOption.icon;
                            return (
                              <Button
                                key={iconOption.key}
                                variant="ghost"
                                size="icon"
                                title={iconOption.name}
                                className={cn(
                                  "h-9 w-9 p-1.5 rounded-md",
                                  selectedIconKey === iconOption.key && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => {
                                  setSelectedIconKey(iconOption.key);
                                  setIsIconPopoverOpen(false);
                                }}
                              >
                                <IconComp className="h-full w-full" />
                              </Button>
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
            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim() || !selectedIconKey}>
              <Save className="mr-2 h-4 w-4" /> {t.categorySettings.saveCategory}
            </Button>
          </div>

          {userCategories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">{t.categorySettings.yourCategoriesTitle}</h3>
              <ScrollArea className="h-[150px] border rounded-md p-1">
                <ul className="space-y-1">
                  {userCategories.map((category) => {
                    const IconComp = getIconComponent(category.iconKey);
                    return (
                      <li key={category.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <IconComp className="h-5 w-5" />
                          <span className="truncate" title={category.name}>{category.name}</span>
                          <span className="text-xs text-muted-foreground ml-1 truncate" title={getLocalizedIconName(category.iconKey, language)}>({getLocalizedIconName(category.iconKey, language)})</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => onDeleteCategory(category.id)} className="text-destructive hover:text-destructive h-7 w-7">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </div>
          )}
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
