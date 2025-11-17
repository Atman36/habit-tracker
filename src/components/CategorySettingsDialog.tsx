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
          <DialogTitle>Настройки</DialogTitle>
          <DialogDescription>
            Управляйте категориями, внешним видом и отображением привычек.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme and View Settings */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Внешний вид</h3>
            
            {/* Theme Switcher */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Тема оформления</Label>
              <ThemeSwitcher />
            </div>
            
            <Separator />

            {/* Compact Habit View Toggle */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Детализация списка привычек</Label>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Компактный вид (только заголовки)</span>
                </div>
                <Switch
                  checked={isCompactHabitView}
                  onCheckedChange={(checked) => {
                    onCompactHabitViewToggle(checked);
                    if (checked) {
                      onMinimalHabitViewToggle(false); // Disable minimal when compact is enabled
                    }
                  }}
                  aria-label="Компактный вид привычек"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Узкий вид (строчки с чек-боксами)</span>
                </div>
                <Switch
                  checked={isMinimalHabitView}
                  onCheckedChange={(checked) => {
                    onMinimalHabitViewToggle(checked);
                    if (checked) {
                      onCompactHabitViewToggle(false); // Disable compact when minimal is enabled
                    }
                  }}
                  aria-label="Узкий вид привычек"
                />
              </div>
            </div>

            <Separator />
            
            {/* Analytics Sections Toggles */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Отображение аналитики</Label>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Показывать "Обзор статистики"</span>
                </div>
                <Switch
                  checked={showStatsOverviewSection}
                  onCheckedChange={onShowStatsOverviewSectionToggle}
                  aria-label='Показывать "Обзор статистики"'
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Показывать "Прогресс за неделю"</span>
                </div>
                <Switch
                  checked={showWeeklyProgressSection}
                  onCheckedChange={onShowWeeklyProgressSectionToggle}
                  aria-label='Показывать "Прогресс за неделю"'
                />
              </div>
            </div>
          </div>

          <Separator />
          {/* Category Management */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Управление категориями</h3>
            <p className="text-sm text-muted-foreground">Создавайте свои категории для привычек</p>
            <div className="space-y-2">
              <Label htmlFor="newCategoryName">Название вашей категории</Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Например, Утренняя рутина"
              />
            </div>
            <div className="space-y-2">
              <Label>Выберите иконку для категории</Label>
              <Popover open={isIconPopoverOpen} onOpenChange={setIsIconPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <div className="flex items-center gap-2 flex-1">
                      <SelectedIconVisual className="h-4 w-4" />
                      <span className="truncate">{availableIcons[selectedIconKey]?.name || "Выберите иконку"}</span>
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
              <Save className="mr-2 h-4 w-4" /> Сохранить категорию
            </Button>
          </div>

          {userCategories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Ваши категории</h3>
              <ScrollArea className="h-[150px] border rounded-md p-1">
                <ul className="space-y-1">
                  {userCategories.map((category) => {
                    const IconComp = getIconComponent(category.iconKey);
                    return (
                      <li key={category.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <IconComp className="h-5 w-5" />
                          <span className="truncate" title={category.name}>{category.name}</span>
                           <span className="text-xs text-muted-foreground ml-1 truncate" title={availableIcons[category.iconKey]?.name}>({availableIcons[category.iconKey]?.name})</span>
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
              Закрыть
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
