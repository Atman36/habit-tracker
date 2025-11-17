
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

// Achievement system
export type AchievementType =
  | 'first_week' // First seven days without skipping
  | 'month_streak' // Thirty consecutive days
  | 'all_habits_day' // Every habit completed in a single day
  | 'habit_creator' // Created multiple habits
  | 'consistency_master' // Long streak keeper
  | 'early_bird' // Early morning focus
  | 'night_owl' // Late-night effort
  | 'weekend_warrior' // Weekend consistency
  | 'perfectionist' // Long streak without a miss
  | 'comeback_kid' // Recovered after a setback
  | 'milestone' // Major milestones (100, 365 days, etc.)
  | 'category_master' // Mastered a category
  | 'habit_diversity' // Keeps diverse habits
  | 'long_term_commitment'; // Stayed active for months

export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  badgeIcon: string; // Badge file name (for example, 'first_week.svg')
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string; // ISO date string for when it was earned
  progress?: number; // Current progress (0-100)
  maxProgress?: number; // Target value for progress
  category?: string; // Category grouping for the badge
}

export interface UserAchievements {
  unlockedAchievements: Achievement[];
  totalPoints: number; // Sum of points earned from unlocked achievements
  level: number; // Calculated level based on total points
}
