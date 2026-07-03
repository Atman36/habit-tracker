import type { Achievement, AchievementType } from '@/lib/types';
import type { Language } from '@/lib/translations';

const categoryTranslations: Record<string, Record<Language, string>> = {
  'Getting Started': { en: 'Getting Started', ru: 'Начинающий' },
  'Consistency': { en: 'Consistency', ru: 'Постоянство' },
  'Perfection': { en: 'Perfection', ru: 'Совершенство' },
  'Creativity': { en: 'Creativity', ru: 'Творчество' },
  'Daily Rhythm': { en: 'Daily Rhythm', ru: 'Режим дня' },
  'Resilience': { en: 'Resilience', ru: 'Стойкость' },
  'Milestones': { en: 'Milestones', ru: 'Вехи' },
  'Mastery': { en: 'Mastery', ru: 'Мастерство' },
  'Variety': { en: 'Variety', ru: 'Разнообразие' },
  'Commitment': { en: 'Commitment', ru: 'Приверженность' },
  Other: { en: 'Other', ru: 'Прочее' },
};

const achievementTranslations: Partial<
  Record<AchievementType, Record<Language, { name: string; description: string; category?: string }>>
> = {
  first_week: {
    en: {
      name: 'First Week',
      description: 'Complete any habit for 7 days in a row',
      category: 'Getting Started',
    },
    ru: {
      name: 'Первая неделя',
      description: 'Выполните любую привычку 7 дней подряд',
      category: 'Начинающий',
    },
  },
  month_streak: {
    en: {
      name: 'Monthly Marathon',
      description: 'Complete any habit for 30 days in a row',
      category: 'Consistency',
    },
    ru: {
      name: 'Месячный марафон',
      description: 'Выполните любую привычку 30 дней подряд',
      category: 'Постоянство',
    },
  },
  all_habits_day: {
    en: {
      name: 'Perfect Day',
      description: 'Complete every active habit in a single day',
      category: 'Perfection',
    },
    ru: {
      name: 'Идеальный день',
      description: 'Выполните все активные привычки в один день',
      category: 'Совершенство',
    },
  },
  habit_creator: {
    en: {
      name: 'Habit Architect',
      description: 'Create 10 distinct habits',
      category: 'Creativity',
    },
    ru: {
      name: 'Архитектор привычек',
      description: 'Создайте 10 различных привычек',
      category: 'Творчество',
    },
  },
  consistency_master: {
    en: {
      name: 'Consistency Master',
      description: 'Maintain a 100-day streak on any habit',
      category: 'Consistency',
    },
    ru: {
      name: 'Мастер постоянства',
      description: 'Поддерживайте серию в 100 дней для любой привычки',
      category: 'Постоянство',
    },
  },
  early_bird: {
    en: {
      name: 'Early Bird',
      description: 'Complete 50 habits before 8:00 AM',
      category: 'Daily Rhythm',
    },
    ru: {
      name: 'Ранняя пташка',
      description: 'Выполните 50 привычек до 8:00 утра',
      category: 'Режим дня',
    },
  },
  weekend_warrior: {
    en: {
      name: 'Weekend Warrior',
      description: 'Complete every habit across four consecutive weekends',
      category: 'Daily Rhythm',
    },
    ru: {
      name: 'Воин выходных',
      description: 'Выполните все привычки в течение 4 выходных подряд',
      category: 'Режим дня',
    },
  },
  perfectionist: {
    en: {
      name: 'Perfectionist',
      description: 'Complete 100 habits without a single miss',
      category: 'Perfection',
    },
    ru: {
      name: 'Перфекционист',
      description: 'Выполните 100 привычек без единого пропуска',
      category: 'Совершенство',
    },
  },
  comeback_kid: {
    en: {
      name: 'Comeback Kid',
      description: 'Recover your streak after a setback five times',
      category: 'Resilience',
    },
    ru: {
      name: 'Феникс',
      description: 'Восстановите серию после неудачи 5 раз',
      category: 'Стойкость',
    },
  },
  milestone: {
    en: {
      name: 'Year-Long Marathon',
      description: 'Complete any habit for 365 days in a row',
      category: 'Milestones',
    },
    ru: {
      name: 'Годовой марафон',
      description: 'Выполните любую привычку 365 дней подряд',
      category: 'Вехи',
    },
  },
  category_master: {
    en: {
      name: 'Category Master',
      description: 'Complete every habit in one category for 30 days straight',
      category: 'Mastery',
    },
    ru: {
      name: 'Мастер категории',
      description: 'Выполните все привычки в одной категории 30 дней подряд',
      category: 'Мастерство',
    },
  },
  habit_diversity: {
    en: {
      name: 'Versatile',
      description: 'Create habits across five different categories',
      category: 'Variety',
    },
    ru: {
      name: 'Разносторонний',
      description: 'Создайте привычки в 5 различных категориях',
      category: 'Разнообразие',
    },
  },
  long_term_commitment: {
    en: {
      name: 'Long-Term Commitment',
      description: 'Stay active inside the app for six months',
      category: 'Commitment',
    },
    ru: {
      name: 'Долгосрочная приверженность',
      description: 'Поддерживайте активность в приложении 6 месяцев',
      category: 'Приверженность',
    },
  },
};

const categoryFallback: Record<Language, string> = {
  en: 'Other',
  ru: 'Прочее',
};

export function getLocalizedAchievementName(achievement: Achievement, language: Language) {
  return achievementTranslations[achievement.type]?.[language]?.name ?? achievement.name;
}

export function getLocalizedAchievementDescription(achievement: Achievement, language: Language) {
  return achievementTranslations[achievement.type]?.[language]?.description ?? achievement.description;
}

export function getLocalizedAchievementCategoryName(achievement: Achievement, language: Language) {
  const translation = achievementTranslations[achievement.type]?.[language]?.category;
  if (translation) {
    return translation;
  }
  return getLocalizedAchievementCategoryLabel(achievement.category, language);
}

export function getLocalizedAchievementCategoryLabel(category: string | undefined, language: Language) {
  if (!category) {
    return categoryFallback[language];
  }
  return categoryTranslations[category]?.[language] ?? category;
}
