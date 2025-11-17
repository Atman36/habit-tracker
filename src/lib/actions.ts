
'use server';

import { getPersonalizedHabitTips, type PersonalizedHabitTipsOutput, type PersonalizedHabitTipsInput } from '@/ai/flows/personalized-habit-tips';
import type { Habit, ApiError } from '@/lib/types';

export interface OpenRouterActionSettings {
  apiKey?: string;
  modelName?: string;
  systemPrompt?: string;
}

export async function fetchPersonalizedHabitTipsAction(
  habits: Habit[],
  settings?: OpenRouterActionSettings,
): Promise<PersonalizedHabitTipsOutput | ApiError> {
  if (!habits || habits.length === 0) {
    return { tips: ['Добавьте привычки, чтобы получить персональные советы.'] };
  }

  if (!settings?.apiKey) {
    return { error: "API ключ OpenRouter не настроен.", code: 'API_KEY_MISSING' };
  }
  if (!settings?.modelName) {
    // Although modelName is optional in the flow with a default,
    // we might want to enforce it from the UI settings perspective
    // or ensure the dialog sets a default if user leaves it blank.
    // For now, let the flow handle the default if it's truly optional there.
    // If a model MUST be selected in UI, this check would be stricter.
  }

  try {
    const habitDataForAI = habits.map(habit => ({
      name: habit.name,
      goal: habit.goal,
      frequency: habit.frequency,
      streak: habit.streak,
      completionsCount: habit.completions.length,
      recentCompletions: habit.completions.slice(-7).map(c => ({ date: c.date, notes: c.notes || '' })),
      createdAt: habit.createdAt,
    }));

    const habitDataString = JSON.stringify(habitDataForAI);
    
    const input: PersonalizedHabitTipsInput = {
      habitData: habitDataString,
      apiKey: settings.apiKey, // API key is now checked and asserted to be present
      modelName: settings.modelName, // Pass modelName, flow might have a default
      systemPrompt: settings.systemPrompt, // Pass systemPrompt if provided
    };
    
    const result = await getPersonalizedHabitTips(input);
    return result;

  } catch (error: any) {
    console.error('Error fetching personalized habit tips in action:', error);
    if (error.message) {
      if (error.message.includes('API key') || error.message.includes('Unauthorized')) {
        return { error: error.message, code: 'API_KEY_INVALID' };
      }
      if (error.message.includes('AI service is not configured')) {
         return { error: error.message, code: 'API_KEY_MISSING' };
      }
    }
    return { error: 'Не удалось получить персональные советы. Попробуйте позже.' };
  }
}
