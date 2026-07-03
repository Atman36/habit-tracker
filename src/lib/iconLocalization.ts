import type { Language } from '@/lib/translations';

const categoryTranslations: Record<string, Record<Language, string>> = {
  'Общее': { en: 'General', ru: 'Общее' },
  'Продуктивность': { en: 'Productivity', ru: 'Продуктивность' },
  'Работа': { en: 'Work', ru: 'Работа' },
  'Развитие': { en: 'Growth', ru: 'Развитие' },
  'Здоровье и Фитнес': { en: 'Health & Fitness', ru: 'Здоровье и Фитнес' },
  'Питание и Напитки': { en: 'Food & Drinks', ru: 'Питание и Напитки' },
  'Режим дня': { en: 'Daily routine', ru: 'Режим дня' },
  'Благополучие и Осознанность': { en: 'Wellbeing & Mindfulness', ru: 'Благополучие и Осознанность' },
  'Хобби и Отдых': { en: 'Hobbies & Leisure', ru: 'Хобби и Отдых' },
  'Финансы': { en: 'Finances', ru: 'Финансы' },
  'Дом и Быт': { en: 'Home & Life', ru: 'Дом и Быт' },
  'Ограничения / Негативные привычки': { en: 'Limits / Negative habits', ru: 'Ограничения / Негативные привычки' },
  'Дополнительные': { en: 'Additional', ru: 'Дополнительные' },
};

const iconTranslations: Record<string, Record<Language, string>> = {
  CheckCircle: { en: 'Completion', ru: 'Выполнение' },
  Activity: { en: 'Activity', ru: 'Активность' },
  Bell: { en: 'Reminder', ru: 'Уведомление / Напоминание' },
  ShieldCheck: { en: 'Safety', ru: 'Защита / Безопасность' },
  Sprout: { en: 'Fresh start', ru: 'Росток / Начало' },
  KeyRound: { en: 'Key / Access', ru: 'Ключ / Доступ' },
  Target: { en: 'Goal / Focus', ru: 'Цель / Фокус' },
  CalendarDays: { en: 'Planning', ru: 'Планирование / Календарь' },
  BarChart: { en: 'Analytics', ru: 'Статистика / Анализ' },
  ListChecks: { en: 'Checklist', ru: 'Чек-лист / Задачи' },
  Hourglass: { en: 'Time management', ru: 'Управление временем' },
  Pencil: { en: 'Write / Edit', ru: 'Запись / Редактирование' },
  Bookmark: { en: 'Bookmark', ru: 'Закладка / Запомнить' },
  FileText: { en: 'Document', ru: 'Документ / Отчет' },
  Newspaper: { en: 'News / Info', ru: 'Чтение новостей / Информация' },
  Gauge: { en: 'Performance', ru: 'Измерение / Производительность' },
  Repeat: { en: 'Routine', ru: 'Повтор / Цикл' },
  Briefcase: { en: 'Projects', ru: 'Работа / Проекты' },
  Terminal: { en: 'Coding', ru: 'Программирование / Кодинг' },
  Code: { en: 'Development', ru: 'Код / Разработка' },
  Building2: { en: 'Office', ru: 'Офис / Компания' },
  Brain: { en: 'Reflection', ru: 'Размышление / Улучшение' },
  GraduationCap: { en: 'Learning', ru: 'Обучение / Знания' },
  BookOpen: { en: 'Reading', ru: 'Чтение / Книги' },
  TrendingUp: { en: 'Personal growth', ru: 'Личностный рост' },
  School: { en: 'Classes', ru: 'Учеба / Курсы' },
  Lightbulb: { en: 'Ideas', ru: 'Идеи / Инсайты' },
  Puzzle: { en: 'Problem solving', ru: 'Решение задач / Логика' },
  PersonStanding: { en: 'Yoga / Stretch', ru: 'Йога / Зарядка / Растяжка' },
  Zap: { en: 'Energy / Intensity', ru: 'Энергия / Интенсивность / Гвозди' },
  Dumbbell: { en: 'Strength', ru: 'Силовые упражнения / Планка / Отжимания' },
  Bike: { en: 'Cardio / Walk', ru: 'Кардио / Активный отдых / Прогулка / Велосипед' },
  BriefcaseMedical: { en: 'Health', ru: 'Здоровье (общее) / Врач' },
  Heart: { en: 'Heart health', ru: 'Сердце / Кардио здоровье' },
  Carrot: { en: 'Healthy food', ru: 'Фрукты / Овощи / Здоровая еда' },
  Droplets: { en: 'Water / Hydration', ru: 'Вода / Гидратация' },
  Coffee: { en: 'Coffee / Tea', ru: 'Кофе / Чай / Напитки' },
  Utensils: { en: 'Meals / Cooking', ru: 'Прием пищи / Готовка' },
  Apple: { en: 'Snack / Fruit', ru: 'Фрукт / Перекус' },
  BanSugarAndFlour: { en: 'No flour & sugar', ru: 'Без мучного и сахара' },
  Clock: { en: 'Wake up / Schedule', ru: 'Подъём / Время / Режим' },
  ShowerHead: { en: 'Shower / Hygiene', ru: 'Душ / Гигиена' },
  Moon: { en: 'Sleep / Rest', ru: 'Сон / Отдых' },
  Bed: { en: 'Bedtime', ru: 'Отход ко сну / Сон до 22.30' },
  Wind: { en: 'Breathing / Air', ru: 'Дыхание / Свежий воздух' },
  HandHeart: { en: 'Kindness', ru: 'Благодарность / Доброта' },
  CircleDot: { en: 'Mindfulness', ru: 'Медитация / Осознанность' },
  NotebookText: { en: 'Journal', ru: 'Дневник / Записи' },
  ClipboardList: { en: 'Wins log', ru: 'Дневник успеха / Достижения' },
  Leaf: { en: 'Nature / Relax', ru: 'Природа / Релаксация' },
  Users: { en: 'Relationships', ru: 'Общение / Семья / Друзья' },
  Smile: { en: 'Mood / Positivity', ru: 'Настроение / Позитив' },
  Palette: { en: 'Creativity', ru: 'Творчество / Искусство' },
  MountainSnow: { en: 'Travel / Adventures', ru: 'Путешествия / Приключения' },
  Gamepad2: { en: 'Play / Games', ru: 'Игры / Развлечения (без залипания)' },
  DollarSign: { en: 'Finances', ru: 'Финансы / Заработок / Траты' },
  Home: { en: 'Home chores', ru: 'Домашние дела / Уют' },
  Ban: { en: 'Limit / Ban', ru: 'Запрет / Ограничение (общее)' },
  ThumbsDown: { en: 'Avoid', ru: 'Негативная привычка / Избегать' },
  TrendingDown: { en: 'Reduce', ru: 'Снижение / Уменьшение негативного / Анти-залипание' },
  Wine: { en: 'Alcohol tracking', ru: 'Вино / Алкоголь (отслеживание)' },
  Anchor: { en: 'Anchor / Stability', ru: 'Якорь / Стабильность' },
  Award: { en: 'Award', ru: 'Награда' },
  Cloudy: { en: 'Weather / Cloudy', ru: 'Облачно / Погода' },
};

const goalFallbacks: Record<string, Record<Language, string>> = {
  'Здоровье и Фитнес': {
    en: 'Improve physical health and activity',
    ru: 'Улучшить физическое здоровье и активность',
  },
  'Благополучие и Осознанность': {
    en: 'Find inner calm and presence',
    ru: 'Достичь внутренней гармонии и спокойствия',
  },
  'Питание и Напитки': {
    en: 'Maintain balanced nutrition',
    ru: 'Поддерживать здоровое питание',
  },
  'Развитие': {
    en: 'Invest in personal and professional growth',
    ru: 'Постоянное личностное и профессиональное развитие',
  },
  'Продуктивность': {
    en: 'Boost efficiency and focus',
    ru: 'Повысить эффективность и результативность',
  },
  'Работа': {
    en: 'Reach new professional milestones',
    ru: 'Достичь профессиональных успехов',
  },
  'Финансы': {
    en: 'Improve financial wellbeing',
    ru: 'Улучшить финансовое благополучие',
  },
  'Режим дня': {
    en: 'Optimize your daily routine',
    ru: 'Оптимизировать распорядок дня',
  },
  'Хобби и Отдых': {
    en: 'Enjoy your hobbies and downtime',
    ru: 'Получать удовольствие от увлечений',
  },
  'Дом и Быт': {
    en: 'Keep your home organized and cozy',
    ru: 'Поддерживать порядок и комфорт',
  },
  'Ограничения / Негативные привычки': {
    en: 'Reduce the impact of negative habits',
    ru: 'Избавиться от негативного влияния',
  },
  'Общее': {
    en: 'Stay consistent and track your progress',
    ru: 'Регулярно выполнять и отслеживать прогресс',
  },
};

const genericGoalFallback: Record<Language, string> = {
  en: 'Stay consistent and track your progress',
  ru: 'Регулярно выполнять и отслеживать прогресс',
};

export function getLocalizedCategoryName(category: string, language: Language) {
  return categoryTranslations[category]?.[language] ?? category;
}

export function getLocalizedIconName(iconKey: string, language: Language) {
  return iconTranslations[iconKey]?.[language] ?? iconKey;
}

export function getGoalFallbackForCategory(category: string, language: Language) {
  return goalFallbacks[category]?.[language];
}

export function getGenericGoalFallback(language: Language) {
  return genericGoalFallback[language];
}
