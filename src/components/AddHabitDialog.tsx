
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
import { defaultIconKey, getIconComponent, availableIcons } from '@/components/icons';
import React, { useState, useMemo } from 'react';
import { PlusCircle, Edit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  // This will store the prefixed unique value e.g., "std:CheckCircle" or "user:uuid"
  icon: z.string().min(1, 'Категория обязательна'), 
  goal: z.string().min(1, 'Цель обязательна'),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    required_error: "Частота обязательна",
  }),
  type: z.enum(['positive', 'negative'], {
    required_error: "Тип привычки обязателен",
  }),
});

type AddHabitFormValues = z.infer<typeof formSchema>;

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
  const [isOpen, setIsOpen] = useState(false);
  
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
            <PlusCircle className="mr-2 h-4 w-4" /> Добавить привычку
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingHabit ? 'Редактировать привычку' : 'Добавить новую привычку'}</DialogTitle>
          <DialogDescription>
            {existingHabit ? 'Обновите детали вашей привычки.' : 'Заполните информацию о новой привычке, которую хотите отслеживать.'}
            <br />
            <strong>Цель:</strong> Конкретизируйте, что считается успешным выполнением привычки (например, 'Прочитать 1 главу', 'Сделать 20 отжиманий', 'Не есть сладкое после 18:00').
            Это поможет вам четко понимать, когда привычка выполнена. Не дублируйте здесь название или частоту.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input placeholder="Например, Читать 30 минут" {...field} />
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
                  <FormLabel>Описание (необязательно)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Любые детали или заметки" {...field} />
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
                let displayNameInTrigger = "Выберите категорию"; // Default placeholder
                const currentFieldValue = field.value || `std:${defaultIconKey}`; // Ensure there's always a value

                if (currentFieldValue) {
                  if (currentFieldValue.startsWith('user:')) {
                    const userId = currentFieldValue.substring('user:'.length);
                    const userCat = userCategories.find(uc => uc.id === userId);
                    if (userCat) {
                      displayIconKey = userCat.iconKey;
                      displayNameInTrigger = userCat.name;
                    } else if (availableIcons[defaultIconKey]) { // Fallback if userCat not found
                        displayNameInTrigger = availableIcons[defaultIconKey].name;
                    }
                  } else if (currentFieldValue.startsWith('std:')) {
                    const iconKey = currentFieldValue.substring('std:'.length);
                    if (availableIcons[iconKey]) {
                      displayIconKey = iconKey;
                      displayNameInTrigger = availableIcons[iconKey].name;
                    } else if (availableIcons[defaultIconKey]) { // Fallback if iconKey not found
                        displayNameInTrigger = availableIcons[defaultIconKey].name;
                    }
                  }
                }
                const SelectedIconComponent = getIconComponent(displayIconKey);
                
                return (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <Select onValueChange={field.onChange} value={currentFieldValue}>
                      <FormControl>
                        <SelectTrigger>
                           <SelectValue placeholder="Выберите категорию">
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
                              <SelectLabel>Ваши категории</SelectLabel>
                              {userCategories.map((uc) => {
                                const IconComp = getIconComponent(uc.iconKey);
                                const uniqueValue = `user:${uc.id}`;
                                return (
                                  <SelectItem key={uniqueValue} value={uniqueValue} title={uc.name}>
                                    <div className="flex items-center gap-2">
                                      <IconComp className="h-4 w-4" />
                                      <span>{uc.name} <span className="text-xs text-muted-foreground">({availableIcons[uc.iconKey]?.name})</span></span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          )}
                          
                          {Object.entries(groupedStandardIcons).map(([categoryName, iconsInCategory]) => {
                            if (categoryName === 'Дополнительные') { // Filter out "Дополнительные"
                                return null;
                            }
                            return (
                                <SelectGroup key={categoryName}>
                                <SelectLabel className="text-xs font-semibold pl-2 pt-2">{categoryName}</SelectLabel>
                                {iconsInCategory.map((iconOption) => {
                                    // Avoid duplicating standard icons if a user category uses the same name AND iconKey
                                    if (userCategories.some(uc => uc.iconKey === iconOption.key && uc.name === iconOption.name)) {
                                    return null;
                                    }
                                    const IconComp = iconOption.icon;
                                    const uniqueValue = `std:${iconOption.key}`;
                                    return (
                                    <SelectItem key={uniqueValue} value={uniqueValue} title={iconOption.name}>
                                        <div className="flex items-center gap-2">
                                        <IconComp className="h-4 w-4" />
                                        <span>{iconOption.name}</span>
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
                  <FormLabel>Цель</FormLabel>
                  <FormControl>
                    <Input placeholder="Например, Прочитать 1 главу книги" {...field} />
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
                  <FormLabel>Частота</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите частоту" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Ежедневно</SelectItem>
                      <SelectItem value="weekly">Еженедельно</SelectItem>
                      <SelectItem value="monthly">Ежемесячно</SelectItem>
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
                  <FormLabel>Тип привычки</FormLabel>
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
                          Позитивная (сделать)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="negative" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Негативная (избежать)
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
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); }}>Отмена</Button>
              </DialogClose>
              <Button type="submit">{existingHabit ? 'Сохранить изменения' : 'Добавить привычку'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
