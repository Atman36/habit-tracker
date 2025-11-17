import type { Habit, HabitCompletion, Achievement, AchievementType, UserAchievements } from './types';
import { format, parseISO, isValid, differenceInDays, startOfDay, isToday, isWeekend, isSameDay, subDays } from 'date-fns';

// Definition of every available achievement
export const AVAILABLE_ACHIEVEMENTS: Omit<Achievement, 'id' | 'unlockedAt' | 'progress'>[] = [
  {
    type: 'first_week',
    name: 'First Week',
    description: 'Complete any habit for 7 days in a row',
    badgeIcon: 'first_week.svg',
    rarity: 'common',
    maxProgress: 7,
    category: 'Getting Started'
  },
  {
    type: 'month_streak',
    name: 'Monthly Marathon',
    description: 'Complete any habit for 30 days in a row',
    badgeIcon: 'month_streak.svg',
    rarity: 'rare',
    maxProgress: 30,
    category: 'Consistency'
  },
  {
    type: 'all_habits_day',
    name: 'Perfect Day',
    description: 'Complete every active habit in a single day',
    badgeIcon: 'perfect_day.svg',
    rarity: 'epic',
    maxProgress: 1,
    category: 'Perfection'
  },
  {
    type: 'habit_creator',
    name: 'Habit Architect',
    description: 'Create 10 distinct habits',
    badgeIcon: 'habit_creator.svg',
    rarity: 'common',
    maxProgress: 10,
    category: 'Creativity'
  },
  {
    type: 'consistency_master',
    name: 'Consistency Master',
    description: 'Maintain a 100-day streak on any habit',
    badgeIcon: 'consistency_master.svg',
    rarity: 'legendary',
    maxProgress: 100,
    category: 'Consistency'
  },
  {
    type: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 50 habits before 8:00 AM',
    badgeIcon: 'early_bird.svg',
    rarity: 'rare',
    maxProgress: 50,
    category: 'Daily Rhythm'
  },
  {
    type: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete every habit across four consecutive weekends',
    badgeIcon: 'weekend_warrior.svg',
    rarity: 'rare',
    maxProgress: 4,
    category: 'Daily Rhythm'
  },
  {
    type: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 100 habits without a single miss',
    badgeIcon: 'perfectionist.svg',
    rarity: 'epic',
    maxProgress: 100,
    category: 'Perfection'
  },
  {
    type: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Recover your streak after a setback five times',
    badgeIcon: 'comeback_kid.svg',
    rarity: 'rare',
    maxProgress: 5,
    category: 'Resilience'
  },
  {
    type: 'milestone',
    name: 'Year-Long Marathon',
    description: 'Complete any habit for 365 days in a row',
    badgeIcon: 'milestone_365.svg',
    rarity: 'legendary',
    maxProgress: 365,
    category: 'Milestones'
  },
  {
    type: 'category_master',
    name: 'Category Master',
    description: 'Complete every habit in one category for 30 days straight',
    badgeIcon: 'category_master.svg',
    rarity: 'epic',
    maxProgress: 30,
    category: 'Mastery'
  },
  {
    type: 'habit_diversity',
    name: 'Versatile',
    description: 'Create habits across five different categories',
    badgeIcon: 'habit_diversity.svg',
    rarity: 'rare',
    maxProgress: 5,
    category: 'Variety'
  },
  {
    type: 'long_term_commitment',
    name: 'Long-Term Commitment',
    description: 'Stay active inside the app for six months',
    badgeIcon: 'long_term.svg',
    rarity: 'epic',
    maxProgress: 180,
    category: 'Commitment'
  }
];

const ACHIEVEMENT_TEMPLATE_MAP = AVAILABLE_ACHIEVEMENTS.reduce(
  (acc, template) => {
    acc[template.type] = template;
    return acc;
  },
  {} as Partial<Record<AchievementType, Omit<Achievement, 'id' | 'unlockedAt' | 'progress'>>>
);

function createUnlockedAchievement(
  type: AchievementType,
  overrides: Partial<Achievement> = {}
): Achievement {
  const template = ACHIEVEMENT_TEMPLATE_MAP[type];
  if (!template) {
    throw new Error(`Unknown achievement template: ${type}`);
  }

  return {
    id: crypto.randomUUID(),
    ...template,
    unlockedAt: new Date().toISOString(),
    progress: template.maxProgress,
    ...overrides,
  };
}

// Points awarded based on achievement rarity
const RARITY_POINTS = {
  common: 10,
  rare: 25,
  epic: 50,
  legendary: 100
};

// Level calculation based on the user's total points
export function calculateUserLevel(totalPoints: number): number {
  // Each level requires more points than the previous one
  if (totalPoints < 50) return 1;
  if (totalPoints < 150) return 2;
  if (totalPoints < 300) return 3;
  if (totalPoints < 500) return 4;
  if (totalPoints < 750) return 5;
  if (totalPoints < 1100) return 6;
  if (totalPoints < 1500) return 7;
  if (totalPoints < 2000) return 8;
  if (totalPoints < 2600) return 9;
  return Math.floor(totalPoints / 300) + 1; // Safety net for very high levels
}

// Check if the "First Week" achievement should be unlocked
function checkFirstWeekAchievement(habits: Habit[]): Achievement | null {
  const template = ACHIEVEMENT_TEMPLATE_MAP['first_week'];
  if (!template) return null;

  for (const habit of habits) {
    if (habit.streak >= template.maxProgress) {
      return createUnlockedAchievement('first_week');
    }
  }
  return null;
}

// Check if the "Monthly Marathon" achievement should be unlocked
function checkMonthStreakAchievement(habits: Habit[]): Achievement | null {
  const template = ACHIEVEMENT_TEMPLATE_MAP['month_streak'];
  if (!template) return null;

  for (const habit of habits) {
    if (habit.streak >= template.maxProgress) {
      return createUnlockedAchievement('month_streak');
    }
  }
  return null;
}

// Check if the "Perfect Day" achievement should be unlocked
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
    return createUnlockedAchievement('all_habits_day');
  }

  return null;
}

// Check if the "Habit Architect" achievement should be unlocked
function checkHabitCreatorAchievement(habits: Habit[]): Achievement | null {
  const template = ACHIEVEMENT_TEMPLATE_MAP['habit_creator'];
  if (!template) return null;

  if (habits.length >= 10) {
    return createUnlockedAchievement('habit_creator', { progress: habits.length });
  }
  return null;
}

// Check if the "Consistency Master" achievement should be unlocked
function checkConsistencyMasterAchievement(habits: Habit[]): Achievement | null {
  const template = ACHIEVEMENT_TEMPLATE_MAP['consistency_master'];
  if (!template) return null;

  for (const habit of habits) {
    if (habit.streak >= template.maxProgress) {
      return createUnlockedAchievement('consistency_master');
    }
  }
  return null;
}

// Check if the "Weekend Warrior" achievement should be unlocked
function checkWeekendWarriorAchievement(habits: Habit[]): Achievement | null {
  const dailyHabits = habits.filter(h => h.frequency === 'daily');
  if (dailyHabits.length === 0) return null;
  
  let consecutiveWeekends = 0;
  let currentDate = startOfDay(new Date());
  
  // Check the last eight weeks
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
        return createUnlockedAchievement('weekend_warrior');
      }
    } else {
      consecutiveWeekends = 0;
    }
    
    currentDate = subDays(currentDate, 7);
  }
  
  return null;
}

// Check if the "Year-Long Marathon" achievement should be unlocked
function checkMilestoneAchievement(habits: Habit[]): Achievement | null {
  const template = ACHIEVEMENT_TEMPLATE_MAP['milestone'];
  if (!template) return null;

  for (const habit of habits) {
    if (habit.streak >= template.maxProgress) {
      return createUnlockedAchievement('milestone');
    }
  }
  return null;
}

// Aggregate function that validates each achievement
export function checkAchievements(habits: Habit[], currentAchievements: Achievement[]): Achievement[] {
  const newAchievements: Achievement[] = [];
  const unlockedTypes = new Set(currentAchievements.map(a => a.type));
  
  // Only evaluate achievements that are not yet unlocked
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

// Compute progress for achievements that are still locked
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

// Update the user's achievements with any new unlocks
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

// Return every achievement, including progress for locked ones
export function getAllAchievementsWithProgress(habits: Habit[], userAchievements: UserAchievements): Achievement[] {
  const unlockedTypes = new Set(userAchievements.unlockedAchievements.map(a => a.type));
  
  return AVAILABLE_ACHIEVEMENTS.map(template => {
    const isUnlocked = unlockedTypes.has(template.type);
    const unlockedAchievement = userAchievements.unlockedAchievements.find(a => a.type === template.type);
    
    if (isUnlocked && unlockedAchievement) {
      return unlockedAchievement;
    }
    
    // Show live progress for achievements that are still locked
    const progress = calculateAchievementProgress(habits, template.type);
    
    return {
      id: `progress-${template.type}`,
      ...template,
      progress,
      unlockedAt: undefined
    };
  });
}