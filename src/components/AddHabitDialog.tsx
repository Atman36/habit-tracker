
'use client';

import type { Habit, HabitFrequency, HabitType, IconOption, UserDefinedCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { defaultIconKey, getIconComponent, availableIcons, ADDITIONAL_CATEGORY_KEY } from '@/components/icons';
import React, { useState, useMemo } from 'react';
import { PlusCircle, Edit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations, useLanguage } from '@/components/LanguageProvider';
import type { TranslationContent } from '@/lib/translations';
import { getLocalizedCategoryName, getLocalizedIconName } from '@/lib/iconLocalization';

const buildFormSchema = (t: TranslationContent['addHabit']) => z.object({
  name: z.string().min(1, t.errors.nameRequired),
  description: z.string().optional(),
  icon: z.string().min(1, t.errors.iconRequired),
  goal: z.string().min(1, t.errors.goalRequired),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    required_error: t.errors.frequencyRequired,
  }),
  type: z.enum(['positive', 'negative'], {
    required_error: t.errors.typeRequired,
  }),
});

type AddHabitFormValues = z.infer<ReturnType<typeof buildFormSchema>>;

interface AddHabitDialogProps {
  onSave: (habit: Omit<Habit, 'id' | 'completions' | 'createdAt' | 'streak'>, id?: string) => void;
  existingHabit?: Habit;
  triggerButton?: React.ReactNode;
  availableIcons: Record<string, IconOption>;
  userCategories: UserDefinedCategory[];
}

// This function now determines the unique value for the Select component
const determineInitialIconValue = (
  habit: Habit | undefined, 
  userCategories: UserDefinedCategory[]
): string => {
  if (habit?.icon) {
    // Check if it's a user category first by seeing if any user category uses this iconKey
    // This part is tricky if multiple user categories use the same iconKey.
    // For simplicity, we'll prioritize finding a direct user category match IF the habit was saved via a user category.
    // However, habit.icon only stores the base iconKey, not the user category ID.
    // So, we rely on the standard icon representation if it exists, which is safer.
    const iconKey = habit.icon;
    if (availableIcons[iconKey]) { // Ensure the iconKey is valid
      // If a user category exactly matches the habit's name AND uses this iconKey, prefer it.
      // This is a heuristic and might not always be perfect.
      const matchingUserCat = userCategories.find(uc => uc.name === habit.name && uc.iconKey === iconKey);
      if (matchingUserCat) {
        return `user:${matchingUserCat.id}`;
      }
      return `std:${iconKey}`;
    }
  }
  return `std:${defaultIconKey}`;
};


export function AddHabitDialog({
  onSave,
  existingHabit,
  triggerButton,
  availableIcons, // This prop can be removed if not directly used here anymore for `allAvailableIcons`
  userCategories,
}: AddHabitDialogProps) {
  const t = useTranslations();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const formSchema = useMemo(() => buildFormSchema(t.addHabit), [t]);

  const form = useForm<AddHabitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingHabit
      ? {
          name: existingHabit.name,
          description: existingHabit.description || '',
          icon: determineInitialIconValue(existingHabit, userCategories),
          goal: existingHabit.goal,
          frequency: existingHabit.frequency,
          type: existingHabit.type || 'positive',
        }
      : {
          name: '',
          description: '',
          icon: `std:${defaultIconKey}`,
          goal: '',
          frequency: 'daily',
          type: 'positive',
        },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (existingHabit) {
        form.reset({
          name: existingHabit.name,
          description: existingHabit.description || '',
          icon: determineInitialIconValue(existingHabit, userCategories),
          goal: existingHabit.goal,
          frequency: existingHabit.frequency,
          type: existingHabit.type || 'positive',
        });
      } else {
        form.reset({
          name: '',
          description: '',
          icon: `std:${defaultIconKey}`,
          goal: '',
          frequency: 'daily',
          type: 'positive',
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingHabit, isOpen, userCategories]); // form is not needed in deps

  const onSubmit = (values: AddHabitFormValues) => {
    let actualIconKey = defaultIconKey;
    if (values.icon) {
      if (values.icon.startsWith('user:')) {
        const userId = values.icon.substring('user:'.length);
        const userCat = userCategories.find(uc => uc.id === userId);
        if (userCat) {
          actualIconKey = userCat.iconKey;
        }
      } else if (values.icon.startsWith('std:')) {
        actualIconKey = values.icon.substring('std:'.length);
      }
    }

    onSave(
      {
        name: values.name,
        description: values.description,
        icon: actualIconKey, 
        goal: values.goal,
        frequency: values.frequency as HabitFrequency,
        type: values.type as HabitType,
      },
      existingHabit?.id
    );
    form.reset();
    setIsOpen(false);
  };
  
  const groupedStandardIcons = useMemo(() => Object.entries(availableIcons)
    .reduce((acc, [key, iconOption]) => {
    if (!acc[iconOption.category]) {
      acc[iconOption.category] = [];
    }
    acc[iconOption.category].push({ key, ...iconOption });
    return acc;
  }, {} as Record<string, (IconOption & {key: string})[]>), []);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton ? (
          React.cloneElement(triggerButton as React.ReactElement, { onClick: () => setIsOpen(true) })
        ) : existingHabit ? (
          <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => setIsOpen(true)}><Edit className="h-4 w-4" /></Button>
        ) : (
          <Button onClick={() => setIsOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> {t.addHabit.triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingHabit ? t.addHabit.dialog.editTitle : t.addHabit.dialog.addTitle}</DialogTitle>
          <DialogDescription>
            {existingHabit ? t.addHabit.dialog.editDescription : t.addHabit.dialog.addDescription}
            <br />
            <strong>{t.addHabit.dialog.goalHeading}</strong> {t.addHabit.dialog.goalHint}
            <br />
            <span className="text-xs text-muted-foreground">{t.addHabit.instructionsHint}</span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addHabit.form.nameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.addHabit.form.namePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addHabit.form.descriptionLabel}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t.addHabit.form.descriptionPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="icon" 
              render={({ field }) => {
                let displayIconKey = defaultIconKey;
                let displayNameInTrigger = t.addHabit.form.categoryPlaceholder;
                const currentFieldValue = field.value || `std:${defaultIconKey}`; // Ensure there's always a value

                if (currentFieldValue) {
                  if (currentFieldValue.startsWith('user:')) {
                    const userId = currentFieldValue.substring('user:'.length);
                    const userCat = userCategories.find(uc => uc.id === userId);
                    if (userCat) {
                      displayIconKey = userCat.iconKey;
                      displayNameInTrigger = userCat.name;
                    } else if (availableIcons[defaultIconKey]) { // Fallback if userCat not found
                        displayNameInTrigger = getLocalizedIconName(defaultIconKey, language);
                    }
                  } else if (currentFieldValue.startsWith('std:')) {
                    const iconKey = currentFieldValue.substring('std:'.length);
                    if (availableIcons[iconKey]) {
                      displayIconKey = iconKey;
                      displayNameInTrigger = getLocalizedIconName(iconKey, language);
                    } else if (availableIcons[defaultIconKey]) { // Fallback if iconKey not found
                        displayNameInTrigger = getLocalizedIconName(defaultIconKey, language);
                    }
                  }
                }
                const SelectedIconComponent = getIconComponent(displayIconKey);
                
                return (
                  <FormItem>
                    <FormLabel>{t.addHabit.form.categoryLabel}</FormLabel>
                    <Select onValueChange={field.onChange} value={currentFieldValue}>
                      <FormControl>
                        <SelectTrigger>
                           <SelectValue placeholder={t.addHabit.form.categoryPlaceholder}>
                            <div className="flex items-center gap-2">
                                <SelectedIconComponent className="h-4 w-4" />
                                <span>{displayNameInTrigger}</span>
                              </div>
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <ScrollArea className="h-[300px]">
                          {userCategories.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>{t.addHabit.form.userCategoryLabel}</SelectLabel>
                              {userCategories.map((uc) => {
                                const IconComp = getIconComponent(uc.iconKey);
                                const uniqueValue = `user:${uc.id}`;
                                return (
                                  <SelectItem key={uniqueValue} value={uniqueValue} title={uc.name}>
                                    <div className="flex items-center gap-2">
                                      <IconComp className="h-4 w-4" />
                                      <span>{uc.name} <span className="text-xs text-muted-foreground">({getLocalizedIconName(uc.iconKey, language)})</span></span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          )}

                          {Object.entries(groupedStandardIcons).map(([categoryName, iconsInCategory]) => {
                            if (categoryName === ADDITIONAL_CATEGORY_KEY) { // Filter out "Дополнительные"
                                return null;
                            }
                            return (
                                <SelectGroup key={categoryName}>
                                <SelectLabel className="text-xs font-semibold pl-2 pt-2">{getLocalizedCategoryName(categoryName, language)}</SelectLabel>
                                {iconsInCategory.map((iconOption) => {
                                    // Avoid duplicating standard icons if a user category uses the same name AND iconKey
                                    if (userCategories.some(uc => uc.iconKey === iconOption.key && uc.name === iconOption.name)) {
                                    return null;
                                    }
                                    const IconComp = iconOption.icon;
                                    const uniqueValue = `std:${iconOption.key}`;
                                    return (
                                    <SelectItem key={uniqueValue} value={uniqueValue} title={getLocalizedIconName(iconOption.key, language)}>
                                        <div className="flex items-center gap-2">
                                        <IconComp className="h-4 w-4" />
                                        <span>{getLocalizedIconName(iconOption.key, language)}</span>
                                        </div>
                                    </SelectItem>
                                    );
                                })}
                                </SelectGroup>
                            );
                           })}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addHabit.form.goalLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.addHabit.form.goalPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addHabit.form.frequencyLabel}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.addHabit.form.frequencyPlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">{t.addHabit.form.frequencyDaily}</SelectItem>
                      <SelectItem value="weekly">{t.addHabit.form.frequencyWeekly}</SelectItem>
                      <SelectItem value="monthly">{t.addHabit.form.frequencyMonthly}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t.addHabit.form.typeLabel}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="positive" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t.addHabit.form.typePositive}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="negative" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t.addHabit.form.typeNegative}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); }}>{t.addHabit.form.cancel}</Button>
              </DialogClose>
              <Button type="submit">{existingHabit ? t.addHabit.form.submitSave : t.addHabit.form.submitAdd}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
