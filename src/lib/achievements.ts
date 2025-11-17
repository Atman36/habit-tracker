import type { Habit, HabitCompletion, Achievement, AchievementType, UserAchievements } from './types';
import { format, parseISO, isValid, differenceInDays, startOfDay, isToday, isWeekend, isSameDay, subDays } from 'date-fns';

// Определение всех доступных достижений
export const AVAILABLE_ACHIEVEMENTS: Omit<Achievement, 'id' | 'unlockedAt' | 'progress'>[] = [
  {
    type: 'first_week',
    name: 'Первая неделя',
    description: 'Выполните любую привычку 7 дней подряд',
    badgeIcon: 'first_week.svg',
    rarity: 'common',
    maxProgress: 7,
    category: 'Начинающий'
  },
  {
    type: 'month_streak',
    name: 'Месячный марафон',
    description: 'Выполните любую привычку 30 дней подряд',
    badgeIcon: 'month_streak.svg',
    rarity: 'rare',
    maxProgress: 30,
    category: 'Постоянство'
  },
  {
    type: 'all_habits_day',
    name: 'Идеальный день',
    description: 'Выполните все активные привычки в один день',
    badgeIcon: 'perfect_day.svg',
    rarity: 'epic',
    maxProgress: 1,
    category: 'Совершенство'
  },
  {
    type: 'habit_creator',
    name: 'Архитектор привычек',
    description: 'Создайте 10 различных привычек',
    badgeIcon: 'habit_creator.svg',
    rarity: 'common',
    maxProgress: 10,
    category: 'Творчество'
  },
  {
    type: 'consistency_master',
    name: 'Мастер постоянства',
    description: 'Поддерживайте серию в 100 дней для любой привычки',
    badgeIcon: 'consistency_master.svg',
    rarity: 'legendary',
    maxProgress: 100,
    category: 'Постоянство'
  },
  {
    type: 'early_bird',
    name: 'Ранняя пташка',
    description: 'Выполните 50 привычек до 8:00 утра',
    badgeIcon: 'early_bird.svg',
    rarity: 'rare',
    maxProgress: 50,
    category: 'Режим дня'
  },
  {
    type: 'weekend_warrior',
    name: 'Воин выходных',
    description: 'Выполните все привычки в течение 4 выходных подряд',
    badgeIcon: 'weekend_warrior.svg',
    rarity: 'rare',
    maxProgress: 4,
    category: 'Режим дня'
  },
  {
    type: 'perfectionist',
    name: 'Перфекционист',
    description: 'Выполните 100 привычек без единого пропуска',
    badgeIcon: 'perfectionist.svg',
    rarity: 'epic',
    maxProgress: 100,
    category: 'Совершенство'
  },
  {
    type: 'comeback_kid',
    name: 'Феникс',
    description: 'Восстановите серию после неудачи 5 раз',
    badgeIcon: 'comeback_kid.svg',
    rarity: 'rare',
    maxProgress: 5,
    category: 'Стойкость'
  },
  {
    type: 'milestone',
    name: 'Годовой марафон',
    description: 'Выполните любую привычку 365 дней подряд',
    badgeIcon: 'milestone_365.svg',
    rarity: 'legendary',
    maxProgress: 365,
    category: 'Вехи'
  },
  {
    type: 'category_master',
    name: 'Мастер категории',
    description: 'Выполните все привычки в одной категории 30 дней подряд',
    badgeIcon: 'category_master.svg',
    rarity: 'epic',
    maxProgress: 30,
    category: 'Мастерство'
  },
  {
    type: 'habit_diversity',
    name: 'Разносторонний',
    description: 'Создайте привычки в 5 различных категориях',
    badgeIcon: 'habit_diversity.svg',
    rarity: 'rare',
    maxProgress: 5,
    category: 'Разнообразие'
  },
  {
    type: 'long_term_commitment',
    name: 'Долгосрочная приверженность',
    description: 'Поддерживайте активность в приложении 6 месяцев',
    badgeIcon: 'long_term.svg',
    rarity: 'epic',
    maxProgress: 180,
    category: 'Приверженность'
  }
];

// Очки за редкость достижений
const RARITY_POINTS = {
  common: 10,
  rare: 25,
  epic: 50,
  legendary: 100
};

// Функция для вычисления уровня пользователя
export function calculateUserLevel(totalPoints: number): number {
  // Каждый уровень требует больше очков (прогрессивная система)
  if (totalPoints < 50) return 1;
  if (totalPoints < 150) return 2;
  if (totalPoints < 300) return 3;
  if (totalPoints < 500) return 4;
  if (totalPoints < 750) return 5;
  if (totalPoints < 1100) return 6;
  if (totalPoints < 1500) return 7;
  if (totalPoints < 2000) return 8;
  if (totalPoints < 2600) return 9;
  return Math.floor(totalPoints / 300) + 1; // Для очень высоких уровней
}

// Функция для проверки достижения "Первая неделя"
function checkFirstWeekAchievement(habits: Habit[]): Achievement | null {
  for (const habit of habits) {
    if (habit.streak >= 7) {
      return {
        id: crypto.randomUUID(),
        type: 'first_week',
        name: 'Первая неделя',
        description: 'Выполните любую привычку 7 дней подряд',
        badgeIcon: 'first_week.svg',
        rarity: 'common',
        unlockedAt: new Date().toISOString(),
        progress: 7,
        maxProgress: 7,
        category: 'Начинающий'
      };
    }
  }
  return null;
}

// Функция для проверки достижения "Месячный марафон"
function checkMonthStreakAchievement(habits: Habit[]): Achievement | null {
  for (const habit of habits) {
    if (habit.streak >= 30) {
      return {
        id: crypto.randomUUID(),
        type: 'month_streak',
        name: 'Месячный марафон',
        description: 'Выполните любую привычку 30 дней подряд',
        badgeIcon: 'month_streak.svg',
        rarity: 'rare',
        unlockedAt: new Date().toISOString(),
        progress: 30,
        maxProgress: 30,
        category: 'Постоянство'
      };
    }
  }
  return null;
}

// Функция для проверки достижения "Идеальный день"
function checkPerfectDayAchievement(habits: Habit[]): Achievement | null {
  if (habits.length === 0) return null;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const dailyHabits = habits.filter(h => h.frequency === 'daily');
  
  if (dailyHabits.length === 0) return null;
  
  const allCompleted = dailyHabits.every(habit => {
    const todayCompletion = habit.completions.find(c => c.date === today);
    return todayCompletion && todayCompletion.status === 'completed';
  });
  
  if (allCompleted) {
    return {
      id: crypto.randomUUID(),
      type: 'all_habits_day',
      name: 'Идеальный день',
      description: 'Выполните все активные привычки в один день',
      badgeIcon: 'perfect_day.svg',
      rarity: 'epic',
      unlockedAt: new Date().toISOString(),
      progress: 1,
      maxProgress: 1,
      category: 'Совершенство'
    };
  }
  
  return null;
}

// Функция для проверки достижения "Архитектор привычек"
function checkHabitCreatorAchievement(habits: Habit[]): Achievement | null {
  if (habits.length >= 10) {
    return {
      id: crypto.randomUUID(),
      type: 'habit_creator',
      name: 'Архитектор привычек',
      description: 'Создайте 10 различных привычек',
      badgeIcon: 'habit_creator.svg',
      rarity: 'common',
      unlockedAt: new Date().toISOString(),
      progress: habits.length,
      maxProgress: 10,
      category: 'Творчество'
    };
  }
  return null;
}

// Функция для проверки достижения "Мастер постоянства"
function checkConsistencyMasterAchievement(habits: Habit[]): Achievement | null {
  for (const habit of habits) {
    if (habit.streak >= 100) {
      return {
        id: crypto.randomUUID(),
        type: 'consistency_master',
        name: 'Мастер постоянства',
        description: 'Поддерживайте серию в 100 дней для любой привычки',
        badgeIcon: 'consistency_master.svg',
        rarity: 'legendary',
        unlockedAt: new Date().toISOString(),
        progress: 100,
        maxProgress: 100,
        category: 'Постоянство'
      };
    }
  }
  return null;
}

// Функция для проверки достижения "Воин выходных"
function checkWeekendWarriorAchievement(habits: Habit[]): Achievement | null {
  const dailyHabits = habits.filter(h => h.frequency === 'daily');
  if (dailyHabits.length === 0) return null;
  
  let consecutiveWeekends = 0;
  let currentDate = startOfDay(new Date());
  
  // Проверяем последние 8 недель
  for (let week = 0; week < 8; week++) {
    const saturday = subDays(currentDate, currentDate.getDay() - 6);
    const sunday = subDays(currentDate, currentDate.getDay());
    
    const saturdayStr = format(saturday, 'yyyy-MM-dd');
    const sundayStr = format(sunday, 'yyyy-MM-dd');
    
    const allCompletedSaturday = dailyHabits.every(habit => {
      const completion = habit.completions.find(c => c.date === saturdayStr);
      return completion && completion.status === 'completed';
    });
    
    const allCompletedSunday = dailyHabits.every(habit => {
      const completion = habit.completions.find(c => c.date === sundayStr);
      return completion && completion.status === 'completed';
    });
    
    if (allCompletedSaturday && allCompletedSunday) {
      consecutiveWeekends++;
      if (consecutiveWeekends >= 4) {
        return {
          id: crypto.randomUUID(),
          type: 'weekend_warrior',
          name: 'Воин выходных',
          description: 'Выполните все привычки в течение 4 выходных подряд',
          badgeIcon: 'weekend_warrior.svg',
          rarity: 'rare',
          unlockedAt: new Date().toISOString(),
          progress: 4,
          maxProgress: 4,
          category: 'Режим дня'
        };
      }
    } else {
      consecutiveWeekends = 0;
    }
    
    currentDate = subDays(currentDate, 7);
  }
  
  return null;
}

// Функция для проверки достижения "Годовой марафон"
function checkMilestoneAchievement(habits: Habit[]): Achievement | null {
  for (const habit of habits) {
    if (habit.streak >= 365) {
      return {
        id: crypto.randomUUID(),
        type: 'milestone',
        name: 'Годовой марафон',
        description: 'Выполните любую привычку 365 дней подряд',
        badgeIcon: 'milestone_365.svg',
        rarity: 'legendary',
        unlockedAt: new Date().toISOString(),
        progress: 365,
        maxProgress: 365,
        category: 'Вехи'
      };
    }
  }
  return null;
}

// Основная функция для проверки всех достижений
export function checkAchievements(habits: Habit[], currentAchievements: Achievement[]): Achievement[] {
  const newAchievements: Achievement[] = [];
  const unlockedTypes = new Set(currentAchievements.map(a => a.type));
  
  // Проверяем каждое достижение только если оно еще не получено
  const achievementCheckers = [
    { type: 'first_week', checker: checkFirstWeekAchievement },
    { type: 'month_streak', checker: checkMonthStreakAchievement },
    { type: 'all_habits_day', checker: checkPerfectDayAchievement },
    { type: 'habit_creator', checker: checkHabitCreatorAchievement },
    { type: 'consistency_master', checker: checkConsistencyMasterAchievement },
    { type: 'weekend_warrior', checker: checkWeekendWarriorAchievement },
    { type: 'milestone', checker: checkMilestoneAchievement }
  ];
  
  for (const { type, checker } of achievementCheckers) {
    if (!unlockedTypes.has(type as AchievementType)) {
      const achievement = checker(habits);
      if (achievement) {
        newAchievements.push(achievement);
      }
    }
  }
  
  return newAchievements;
}

// Функция для вычисления прогресса достижений
export function calculateAchievementProgress(habits: Habit[], achievementType: AchievementType): number {
  switch (achievementType) {
    case 'first_week':
      return Math.max(...habits.map(h => Math.min(h.streak, 7)), 0);
    
    case 'month_streak':
      return Math.max(...habits.map(h => Math.min(h.streak, 30)), 0);
    
    case 'habit_creator':
      return Math.min(habits.length, 10);
    
    case 'consistency_master':
      return Math.max(...habits.map(h => Math.min(h.streak, 100)), 0);
    
    case 'milestone':
      return Math.max(...habits.map(h => Math.min(h.streak, 365)), 0);
    
    case 'all_habits_day':
      const today = format(new Date(), 'yyyy-MM-dd');
      const dailyHabits = habits.filter(h => h.frequency === 'daily');
      if (dailyHabits.length === 0) return 0;
      
      const completedToday = dailyHabits.filter(habit => {
        const todayCompletion = habit.completions.find(c => c.date === today);
        return todayCompletion && todayCompletion.status === 'completed';
      }).length;
      
      return dailyHabits.length > 0 ? Math.round((completedToday / dailyHabits.length) * 100) / 100 : 0;
    
    default:
      return 0;
  }
}

// Функция для обновления пользовательских достижений
export function updateUserAchievements(
  habits: Habit[], 
  currentUserAchievements: UserAchievements
): UserAchievements {
  const newAchievements = checkAchievements(habits, currentUserAchievements.unlockedAchievements);
  const allAchievements = [...currentUserAchievements.unlockedAchievements, ...newAchievements];
  
  const totalPoints = allAchievements.reduce((sum, achievement) => {
    return sum + RARITY_POINTS[achievement.rarity];
  }, 0);
  
  const level = calculateUserLevel(totalPoints);
  
  return {
    unlockedAchievements: allAchievements,
    totalPoints,
    level
  };
}

// Функция для получения всех достижений с прогрессом
export function getAllAchievementsWithProgress(habits: Habit[], userAchievements: UserAchievements): Achievement[] {
  const unlockedTypes = new Set(userAchievements.unlockedAchievements.map(a => a.type));
  
  return AVAILABLE_ACHIEVEMENTS.map(template => {
    const isUnlocked = unlockedTypes.has(template.type);
    const unlockedAchievement = userAchievements.unlockedAchievements.find(a => a.type === template.type);
    
    if (isUnlocked && unlockedAchievement) {
      return unlockedAchievement;
    }
    
    // Для незаблокированных достижений показываем прогресс
    const progress = calculateAchievementProgress(habits, template.type);
    
    return {
      id: `progress-${template.type}`,
      ...template,
      progress,
      unlockedAt: undefined
    };
  });
}