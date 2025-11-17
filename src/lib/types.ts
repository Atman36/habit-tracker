
import type { LucideIcon } from 'lucide-react';

export type HabitStatus = 'completed' | 'failed' | 'skipped';

export interface HabitCompletion {
  date: string; // YYYY-MM-DD
  status: HabitStatus;
  notes?: string;
}

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type HabitType = 'positive' | 'negative';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string; // Key of availableIcons, this will be the iconKey
  goal: string; 
  frequency: HabitFrequency;
  type: HabitType;
  completions: HabitCompletion[];
  createdAt: string; // ISO date string
  streak: number;
}

export interface IconOption {
  name: string; // Original name of the icon/category
  icon: LucideIcon;
  category: string; // Original grouping category for display
}

// For user-defined categories
export interface UserDefinedCategory {
  id: string; // Unique ID for the user category
  name: string; // Custom name given by the user
  iconKey: string; // Key from availableIcons, identifies the chosen Lucide icon
}

export interface OpenRouterSettings {
  apiKey: string;
  modelName?: string;
  systemPrompt?: string;
}

export interface ApiError {
  error: string;
  code?: string;
}

// Система достижений
export type AchievementType =
  | 'first_week' // Первая неделя без пропусков
  | 'month_streak' // Месяц подряд
  | 'all_habits_day' // Все привычки в один день
  | 'habit_creator' // Создание привычек
  | 'consistency_master' // Постоянство
  | 'early_bird' // Ранняя пташка
  | 'night_owl' // Сова
  | 'weekend_warrior' // Воин выходных
  | 'perfectionist' // Перфекционист
  | 'comeback_kid' // Возвращение после неудачи
  | 'milestone' // Вехи (100, 365 дней и т.д.)
  | 'category_master' // Мастер категории
  | 'habit_diversity' // Разнообразие привычек
  | 'long_term_commitment'; // Долгосрочная приверженность

export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  badgeIcon: string; // Имя файла значка (например, 'first_week.svg')
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string; // ISO date string когда получено
  progress?: number; // Текущий прогресс (0-100)
  maxProgress?: number; // Максимальное значение для прогресса
  category?: string; // Категория достижения для группировки
}

export interface UserAchievements {
  unlockedAchievements: Achievement[];
  totalPoints: number; // Общие очки за достижения
  level: number; // Уровень пользователя
}
