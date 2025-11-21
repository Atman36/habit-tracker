export type Language = 'en' | 'ru';

export const defaultLanguage: Language = 'en';

interface ToastTranslations {
  habitAddedTitle: string;
  habitAddedDescription: (name: string) => string;
  habitUpdatedTitle: string;
  habitUpdatedDescription: (name: string) => string;
  habitDeletedTitle: string;
  habitDeletedDescription: (name: string) => string;
  invalidIconTitle: string;
  invalidIconDescription: string;
  categoryAddedTitle: string;
  categoryAddedDescription: (name: string) => string;
  categoryDeletedTitle: string;
  categoryDeletedDescription: (name: string) => string;
  exportEmptyTitle: string;
  exportEmptyDescription: string;
  exportSuccessTitle: string;
  exportSuccessDescription: string;
  importSuccessTitle: string;
  importSuccessDescription: (count: number) => string;
  importErrorTitle: string;
  importErrorDescription: string;
  aiSettingsSavedTitle: string;
  aiSettingsSavedDescription: string;
}

interface StatsTranslations {
  title: string;
  cards: {
    completedToday: string;
    completionRate: string;
    averageStreak: string;
    bestStreak: string;
    completedThisMonth: string;
  };
  motivational: {
    empty: string;
    excellent: string;
    good: string;
    gettingThere: string;
    keepGoing: string;
  };
}

interface WeeklyProgressTranslations {
  title: string;
  description: string;
  previousWeekAria: string;
  nextWeekAria: string;
  noHabits: string;
  progressTooltipSuffix: string;
  overallLabel: string;
  overallDetails: (completed: number, total: number) => string;
  legendLabel: string;
  legendHigh: string;
  legendMedium: string;
  legendLow: string;
  legendZero: string;
  legendNoHabits: string;
}

interface AddHabitTranslations {
  triggerLabel: string;
  dialog: {
    addTitle: string;
    editTitle: string;
    addDescription: string;
    editDescription: string;
    goalHeading: string;
    goalHint: string;
  };
  form: {
    nameLabel: string;
    namePlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    userCategoryLabel: string;
    goalLabel: string;
    goalPlaceholder: string;
    frequencyLabel: string;
    frequencyPlaceholder: string;
    frequencyDaily: string;
    frequencyWeekly: string;
    frequencyMonthly: string;
    typeLabel: string;
    typePositive: string;
    typeNegative: string;
    cancel: string;
    submitAdd: string;
    submitSave: string;
  };
  errors: {
    nameRequired: string;
    iconRequired: string;
    goalRequired: string;
    frequencyRequired: string;
    typeRequired: string;
  };
  instructionsHint: string;
}

interface HabitItemTranslations {
  positiveComplete: string;
  positiveCompleted: string;
  negativeComplete: string;
  negativeCompleted: string;
  negativeFailed: string;
  negativeFailedCompleted: string;
  negativeSkipAria: { checked: string; unchecked: string; };
  aria: {
    markComplete: string;
    markedComplete: string;
    markFailed: string;
    markedFailed: string;
    markResisted: string;
    markedResisted: string;
    markRelapse: string;
    markedRelapse: string;
    markSkipped: string;
    markedSkipped: string;
  };
  showProgress: string;
  showHistory: string;
  noHistory: string;
}

interface CategorySettingsTranslations {
  title: string;
  description: string;
  appearanceTitle: string;
  themeLabel: string;
  detailLabel: string;
  compactLabel: string;
  minimalLabel: string;
  analyticsTitle: string;
  statsLabel: string;
  weeklyLabel: string;
  manageTitle: string;
  manageDescription: string;
  newCategoryLabel: string;
  newCategoryPlaceholder: string;
  chooseIconLabel: string;
  chooseIconPlaceholder: string;
  saveCategory: string;
  yourCategoriesTitle: string;
  closeButton: string;
  languageLabel: string;
}

interface PersonalizedTipsTranslations {
  title: string;
  description: string;
  fetchButton: string;
  fetching: string;
  settingsLabel: string;
  configure: string;
  missingApiKey: string;
  noHabits: string;
  errorTitle: string;
  tipsTitle: string;
}

interface ApiDialogTranslations {
  title: string;
  description: string;
  apiKeyLabel: string;
  modelLabel: string;
  selectPlaceholder: string;
  customModelPlaceholder: string;
  modelHelper: string;
  systemPromptLabel: string;
  systemPromptHelper: string;
  cancel: string;
  save: string;
  defaultSystemPrompt: string;
  models: Record<string, string>;
}

interface ProgressChartTranslations {
  noData: string;
  positiveTicks: {
    yes: string;
    no: string;
    fail: string;
  };
  negativeTicks: {
    yes: string;
    no: string;
    fail: string;
  };
  tooltipNoEntry: string;
}

interface AchievementsTranslations {
  triggerLabel: string;
  title: string;
  progressLabel: string;
  obtainedLabel: string;
  stats: {
    level: string;
    points: string;
    achievements: string;
    legendary: string;
  };
  tabs: {
    all: string;
    unlocked: string;
    inProgress: string;
    categories: string;
  };
  empty: {
    unlockedTitle: string;
    unlockedDescription: string;
    allUnlockedTitle: string;
    allUnlockedDescription: string;
  };
  rarityLabels: {
    common: string;
    rare: string;
    epic: string;
    legendary: string;
  };
}

interface JournalTranslations {
  title: string;
  description: string;
  noEntryTitle: string;
  noEntryDescription: string;
  addBlock: string;
  blocks: {
    morning: string;
    evening: string;
    freeText: string;
  };
  blockPlaceholders: {
    morning: string;
    evening: string;
    freeText: string;
  };
  mood: {
    label: string;
    levels: {
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
    };
  };
  autoSaved: string;
  deleteBlock: string;
  deleteBlockConfirm: string;
}

export interface TranslationContent {
  metadata: {
    title: string;
    description: string;
  };
  languageSwitcher: {
    label: string;
    english: string;
    russian: string;
  };
  themeSwitcher: {
    toggle: string;
    light: string;
    dark: string;
    system: string;
  };
  general: {
    appName: string;
    loadingHabits: string;
    today: string;
    yesterday: string;
    dayBeforeYesterday: string;
  };
  header: {
    exportAria: string;
    importAria: string;
    categorySettingsAria: string;
  };
  dateNavigator: {
    previousDayAria: string;
    nextDayAria: string;
    calendarPlaceholder: string;
  };
  emptyState: {
    title: string;
    description: string;
    action: string;
  };
  toasts: ToastTranslations;
  stats: StatsTranslations;
  weeklyProgress: WeeklyProgressTranslations;
  addHabit: AddHabitTranslations;
  habitItem: HabitItemTranslations;
  categorySettings: CategorySettingsTranslations;
  personalizedTips: PersonalizedTipsTranslations;
  apiDialog: ApiDialogTranslations;
  progressChart: ProgressChartTranslations;
  achievements: AchievementsTranslations;
  journal: JournalTranslations;
}

export const translations: Record<Language, TranslationContent> = {
  en: {
    metadata: {
      title: 'Habit Tracker',
      description: 'Plan, track, and improve your routines with flexible analytics and AI tips.',
    },
    languageSwitcher: {
      label: 'Language',
      english: 'English',
      russian: 'Русский',
    },
    themeSwitcher: {
      toggle: 'Toggle theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    general: {
      appName: 'Habit Tracker',
      loadingHabits: 'Loading habits…',
      today: 'Today',
      yesterday: 'Yesterday',
      dayBeforeYesterday: '2 days ago',
    },
    header: {
      exportAria: 'Export habits to Markdown',
      importAria: 'Import habits from Markdown',
      categorySettingsAria: 'Open settings',
    },
    dateNavigator: {
      previousDayAria: 'Previous day',
      nextDayAria: 'Next day',
      calendarPlaceholder: 'Pick a date',
    },
    emptyState: {
      title: 'No habits yet',
      description: 'Start tracking routines to see your progress and stay motivated.',
      action: 'Add your first habit',
    },
    toasts: {
      habitAddedTitle: 'Habit added',
      habitAddedDescription: (name) => `"${name}" was added successfully.`,
      habitUpdatedTitle: 'Habit updated',
      habitUpdatedDescription: (name) => `"${name}" was updated successfully.`,
      habitDeletedTitle: 'Habit removed',
      habitDeletedDescription: (name) => `"${name}" was deleted.`,
      invalidIconTitle: 'Invalid icon',
      invalidIconDescription: 'Choose a valid icon for the category.',
      categoryAddedTitle: 'Category added',
      categoryAddedDescription: (name) => `Category "${name}" was added successfully.`,
      categoryDeletedTitle: 'Category removed',
      categoryDeletedDescription: (name) => `Category "${name}" was deleted.`,
      exportEmptyTitle: 'Nothing to export',
      exportEmptyDescription: 'Add habits or categories before exporting.',
      exportSuccessTitle: 'Export ready',
      exportSuccessDescription: 'The habits-export.md file is ready to download.',
      importSuccessTitle: 'Import complete',
      importSuccessDescription: (count) => `${count} habits were imported successfully.`,
      importErrorTitle: 'Import error',
      importErrorDescription: 'We could not parse that file. Please verify the format.',
      aiSettingsSavedTitle: 'AI settings saved',
      aiSettingsSavedDescription: 'You can now request personalized tips with the selected model.',
    },
    stats: {
      title: 'Stats overview',
      cards: {
        completedToday: 'Done today',
        completionRate: 'Completion rate (30d)',
        averageStreak: 'Average streak',
        bestStreak: 'Best streak',
        completedThisMonth: 'Done this month',
      },
      motivational: {
        empty: 'Add habits to see personalized insights!',
        excellent: 'Amazing work! You are on fire! 💪',
        good: 'Great progress! Keep up the momentum. 🚀',
        gettingThere: 'Solid start! Small steps create big wins. ✨',
        keepGoing: 'Every day is a new chance to grow. 🌱',
      },
    },
    weeklyProgress: {
      title: 'Weekly progress',
      description: 'Track completions for each day of the week.',
      previousWeekAria: 'Previous week',
      nextWeekAria: 'Next week',
      noHabits: 'No habits to visualize weekly progress.',
      progressTooltipSuffix: 'completed',
      overallLabel: 'Weekly completion:',
      overallDetails: (completed, total) => `${completed} of ${total} possible`,
      legendLabel: 'Legend:',
      legendHigh: '>80%',
      legendMedium: '50–80%',
      legendLow: '<50%',
      legendZero: '0%',
      legendNoHabits: 'No active habits',
    },
    addHabit: {
      triggerLabel: 'Add habit',
      dialog: {
        addTitle: 'Create a habit',
        editTitle: 'Edit habit',
        addDescription: 'Fill in the details for the routine you want to track.',
        editDescription: 'Update the details for this routine.',
        goalHeading: 'Goal:',
        goalHint: 'Describe what success looks like ("Read 1 chapter", "Do 20 push-ups", "Skip sweets after 6 PM"). It keeps your metric clear and measurable.',
      },
      instructionsHint: 'Categories are grouped so you can quickly find a matching icon.',
      form: {
        nameLabel: 'Name',
        namePlaceholder: 'Example: Read for 30 minutes',
        descriptionLabel: 'Description (optional)',
        descriptionPlaceholder: 'Any helpful details or context',
        categoryLabel: 'Category',
        categoryPlaceholder: 'Choose a category',
        userCategoryLabel: 'Your categories',
        goalLabel: 'Goal',
        goalPlaceholder: 'Example: Finish one chapter',
        frequencyLabel: 'Frequency',
        frequencyPlaceholder: 'Choose frequency',
        frequencyDaily: 'Daily',
        frequencyWeekly: 'Weekly',
        frequencyMonthly: 'Monthly',
        typeLabel: 'Habit type',
        typePositive: 'Positive (do it)',
        typeNegative: 'Negative (avoid it)',
        cancel: 'Cancel',
        submitAdd: 'Add habit',
        submitSave: 'Save changes',
      },
      errors: {
        nameRequired: 'Name is required',
        iconRequired: 'Category is required',
        goalRequired: 'Goal is required',
        frequencyRequired: 'Frequency is required',
        typeRequired: 'Habit type is required',
      },
    },
    habitItem: {
      positiveComplete: 'Mark complete',
      positiveCompleted: 'Completed!',
      negativeComplete: 'Resisted',
      negativeCompleted: 'Resisted!',
      negativeFailed: 'Relapsed',
      negativeFailedCompleted: 'Relapsed!',
      negativeSkipAria: {
        checked: 'Marked as skipped',
        unchecked: 'Mark as skipped',
      },
      aria: {
        markComplete: 'Mark as complete',
        markedComplete: 'Marked as complete',
        markFailed: 'Mark as failed',
        markedFailed: 'Marked as failed',
        markResisted: 'Mark as resisted',
        markedResisted: 'Marked as resisted',
        markRelapse: 'Mark as relapse',
        markedRelapse: 'Marked as relapse',
        markSkipped: 'Mark as skipped',
        markedSkipped: 'Marked as skipped',
      },
      showProgress: 'Show progress',
      showHistory: 'History',
      noHistory: 'No check-ins yet.',
    },
    categorySettings: {
      title: 'Settings',
      description: 'Manage categories, layout, analytics, and preferences.',
      appearanceTitle: 'Appearance',
      themeLabel: 'Color theme',
      detailLabel: 'Habit list density',
      compactLabel: 'Compact cards (titles only)',
      minimalLabel: 'Minimal rows (checkboxes)',
      analyticsTitle: 'Analytics visibility',
      statsLabel: 'Show "Stats overview"',
      weeklyLabel: 'Show "Weekly progress"',
      manageTitle: 'Category manager',
      manageDescription: 'Create reusable categories for your routines.',
      newCategoryLabel: 'Category name',
      newCategoryPlaceholder: 'Example: Morning routine',
      chooseIconLabel: 'Pick an icon',
      chooseIconPlaceholder: 'Choose an icon',
      saveCategory: 'Save category',
      yourCategoriesTitle: 'Your categories',
      closeButton: 'Close',
      languageLabel: 'Interface language',
    },
    apiDialog: {
      title: 'OpenRouter AI settings',
      description: 'Provide your API key and choose a model to enable AI-powered suggestions.',
      apiKeyLabel: 'API key',
      modelLabel: 'Model',
      selectPlaceholder: 'Select a model',
      customModelPlaceholder: 'Enter a full model name, e.g. anthropic/claude-3-opus',
      modelHelper: 'See the full list on OpenRouter. DeepSeek Chat offers a great quality/price balance.',
      systemPromptLabel: 'System prompt',
      systemPromptHelper: 'This prompt defines how the assistant replies to your habit questions.',
      cancel: 'Cancel',
      save: 'Save',
      defaultSystemPrompt: 'You are a friendly habit coach. Share concise, motivating advice to help the user stay consistent.',
      models: {
        deepseek: 'DeepSeek Chat (recommended)',
        claudeHaiku: 'Claude 3 Haiku',
        claudeSonnet: 'Claude 3 Sonnet',
        gemini: 'Gemini Flash 1.5',
        mistral: 'Mistral 7B Instruct',
        gpt35: 'GPT-3.5 Turbo',
        gpt4o: 'GPT-4o Mini',
        llama: 'Llama 3.1 8B',
      custom: 'Other model…',
    },
  },
    progressChart: {
      noData: 'No completion data yet.',
      positiveTicks: {
        yes: 'Yes',
        no: 'No',
        fail: 'Missed',
      },
      negativeTicks: {
        yes: 'Avoided',
        no: 'N/A',
        fail: 'Relapse',
      },
      tooltipNoEntry: 'No entry',
    },
    achievements: {
      triggerLabel: 'Achievements',
      title: 'Achievements & badges',
      progressLabel: 'Progress',
      obtainedLabel: 'Unlocked:',
      stats: {
        level: 'Level',
        points: 'Points',
        achievements: 'Badges',
        legendary: 'Legendary',
      },
      tabs: {
        all: 'All',
        unlocked: 'Unlocked',
        inProgress: 'In progress',
        categories: 'By category',
      },
      empty: {
        unlockedTitle: 'No achievements yet',
        unlockedDescription: 'Keep tracking habits to unlock your first badges!',
        allUnlockedTitle: 'Everything unlocked!',
        allUnlockedDescription: 'Amazing consistency—keep it up!',
      },
      rarityLabels: {
        common: 'Common',
        rare: 'Rare',
        epic: 'Epic',
        legendary: 'Legendary',
      },
    },
    journal: {
      title: 'Daily Journal',
      description: 'Reflect on your day and track your mood.',
      noEntryTitle: 'No journal entry yet',
      noEntryDescription: 'Start writing to capture your thoughts for today.',
      addBlock: 'Add block',
      blocks: {
        morning: 'Morning reflection',
        evening: 'Evening reflection',
        freeText: 'Free notes',
      },
      blockPlaceholders: {
        morning: 'How do you feel this morning? What are your intentions for today?',
        evening: 'How was your day? What went well? What could be better?',
        freeText: 'Write your thoughts here...',
      },
      mood: {
        label: 'Today\'s mood',
        levels: {
          1: 'Very bad',
          2: 'Bad',
          3: 'Okay',
          4: 'Good',
          5: 'Excellent',
        },
      },
      autoSaved: 'Auto-saved',
      deleteBlock: 'Delete block',
      deleteBlockConfirm: 'Are you sure you want to delete this block?',
    },
  },
  ru: {
    metadata: {
      title: 'Трекер привычек',
      description: 'Планируйте, отслеживайте и улучшайте привычки с аналитикой и AI-советами.',
    },
    languageSwitcher: {
      label: 'Язык',
      english: 'English',
      russian: 'Русский',
    },
    themeSwitcher: {
      toggle: 'Переключить тему',
      light: 'Светлая',
      dark: 'Тёмная',
      system: 'Системная',
    },
    general: {
      appName: 'Трекер привычек',
      loadingHabits: 'Загрузка привычек…',
      today: 'Сегодня',
      yesterday: 'Вчера',
      dayBeforeYesterday: 'Позавчера',
    },
    header: {
      exportAria: 'Экспорт в Markdown',
      importAria: 'Импорт из Markdown',
      categorySettingsAria: 'Открыть настройки',
    },
    dateNavigator: {
      previousDayAria: 'Предыдущий день',
      nextDayAria: 'Следующий день',
      calendarPlaceholder: 'Выберите дату',
    },
    emptyState: {
      title: 'Пока нет привычек',
      description: 'Начните отслеживать рутины, чтобы видеть прогресс и мотивацию.',
      action: 'Добавить первую привычку',
    },
    toasts: {
      habitAddedTitle: 'Привычка добавлена',
      habitAddedDescription: (name) => `"${name}" успешно добавлена.`,
      habitUpdatedTitle: 'Привычка обновлена',
      habitUpdatedDescription: (name) => `"${name}" успешно обновлена.`,
      habitDeletedTitle: 'Привычка удалена',
      habitDeletedDescription: (name) => `"${name}" удалена.`,
      invalidIconTitle: 'Неверная иконка',
      invalidIconDescription: 'Пожалуйста, выберите корректную иконку для категории.',
      categoryAddedTitle: 'Категория добавлена',
      categoryAddedDescription: (name) => `Категория "${name}" успешно добавлена.`,
      categoryDeletedTitle: 'Категория удалена',
      categoryDeletedDescription: (name) => `Категория "${name}" удалена.`,
      exportEmptyTitle: 'Нет данных для экспорта',
      exportEmptyDescription: 'Добавьте привычки или категории перед экспортом.',
      exportSuccessTitle: 'Экспорт готов',
      exportSuccessDescription: 'Файл habits-export.md готов к скачиванию.',
      importSuccessTitle: 'Импорт завершён',
      importSuccessDescription: (count) => `${count} привычек успешно импортировано.`,
      importErrorTitle: 'Ошибка импорта',
      importErrorDescription: 'Не удалось обработать файл. Убедитесь, что формат корректен.',
      aiSettingsSavedTitle: 'Настройки AI сохранены',
      aiSettingsSavedDescription: 'Теперь вы можете получать советы с выбранной моделью.',
    },
    stats: {
      title: 'Обзор статистики',
      cards: {
        completedToday: 'Выполнено сегодня',
        completionRate: '% выполнения (30 дн.)',
        averageStreak: 'Средняя серия',
        bestStreak: 'Лучшая серия',
        completedThisMonth: 'Выполнено за месяц',
      },
      motivational: {
        empty: 'Добавьте привычки, чтобы увидеть аналитику!',
        excellent: 'Отличная работа! Вы на высоте! 💪',
        good: 'Хороший прогресс! Продолжайте в том же духе. 🚀',
        gettingThere: 'Неплохое начало! Маленькие шаги ведут к большим результатам. ✨',
        keepGoing: 'Каждый день — новая возможность стать лучше. 🌱',
      },
    },
    weeklyProgress: {
      title: 'Прогресс за неделю',
      description: 'Отслеживайте выполнение привычек по дням недели.',
      previousWeekAria: 'Предыдущая неделя',
      nextWeekAria: 'Следующая неделя',
      noHabits: 'Нет привычек для отображения недельного прогресса.',
      progressTooltipSuffix: 'выполнено',
      overallLabel: 'Общий прогресс за неделю:',
      overallDetails: (completed, total) => `${completed} из ${total} возм.`,
      legendLabel: 'Легенда:',
      legendHigh: '>80%',
      legendMedium: '50-80%',
      legendLow: '<50%',
      legendZero: '0%',
      legendNoHabits: 'Нет активных',
    },
    addHabit: {
      triggerLabel: 'Добавить привычку',
      dialog: {
        addTitle: 'Добавить новую привычку',
        editTitle: 'Редактировать привычку',
        addDescription: 'Заполните информацию о привычке, которую хотите отслеживать.',
        editDescription: 'Обновите детали привычки.',
        goalHeading: 'Цель:',
        goalHint: 'Опишите, что считается успехом («Прочитать 1 главу», «Сделать 20 отжиманий», «Не есть сладкое после 18:00»), чтобы критерий был понятным.',
      },
      instructionsHint: 'Категории сгруппированы, чтобы вы быстрее находили подходящую иконку.',
      form: {
        nameLabel: 'Название',
        namePlaceholder: 'Например, Читать 30 минут',
        descriptionLabel: 'Описание (необязательно)',
        descriptionPlaceholder: 'Любые детали или заметки',
        categoryLabel: 'Категория',
        categoryPlaceholder: 'Выберите категорию',
        userCategoryLabel: 'Ваши категории',
        goalLabel: 'Цель',
        goalPlaceholder: 'Например, Прочитать 1 главу',
        frequencyLabel: 'Частота',
        frequencyPlaceholder: 'Выберите частоту',
        frequencyDaily: 'Ежедневно',
        frequencyWeekly: 'Еженедельно',
        frequencyMonthly: 'Ежемесячно',
        typeLabel: 'Тип привычки',
        typePositive: 'Позитивная (сделать)',
        typeNegative: 'Негативная (избежать)',
        cancel: 'Отмена',
        submitAdd: 'Добавить привычку',
        submitSave: 'Сохранить изменения',
      },
      errors: {
        nameRequired: 'Название обязательно',
        iconRequired: 'Категория обязательна',
        goalRequired: 'Цель обязательна',
        frequencyRequired: 'Частота обязательна',
        typeRequired: 'Тип привычки обязателен',
      },
    },
    habitItem: {
      positiveComplete: 'Отметить выполнение',
      positiveCompleted: 'Выполнено!',
      negativeComplete: 'Удержался',
      negativeCompleted: 'Удержался!',
      negativeFailed: 'Сорвался',
      negativeFailedCompleted: 'Сорвался!',
      negativeSkipAria: {
        checked: 'Отмечено как пропущено',
        unchecked: 'Отметить как пропущено',
      },
      aria: {
        markComplete: 'Отметить как выполнено',
        markedComplete: 'Отмечено как выполнено',
        markFailed: 'Отметить как не выполнено',
        markedFailed: 'Отмечено как не выполнено',
        markResisted: 'Отметить как удержался',
        markedResisted: 'Отмечено как удержался',
        markRelapse: 'Отметить как сорвался',
        markedRelapse: 'Отмечено как сорвался',
        markSkipped: 'Отметить как пропущено',
        markedSkipped: 'Отмечено как пропущено',
      },
      showProgress: 'Показать прогресс',
      showHistory: 'История отметок',
      noHistory: 'Пока нет отметок.',
    },
    categorySettings: {
      title: 'Настройки',
      description: 'Управляйте категориями, внешним видом и отображением данных.',
      appearanceTitle: 'Внешний вид',
      themeLabel: 'Тема оформления',
      detailLabel: 'Детализация списка привычек',
      compactLabel: 'Компактные карточки (только заголовки)',
      minimalLabel: 'Минимальные строки (с чек-боксами)',
      analyticsTitle: 'Отображение аналитики',
      statsLabel: 'Показывать «Обзор статистики»',
      weeklyLabel: 'Показывать «Прогресс за неделю»',
      manageTitle: 'Управление категориями',
      manageDescription: 'Создавайте свои категории для привычек.',
      newCategoryLabel: 'Название категории',
      newCategoryPlaceholder: 'Например, Утренняя рутина',
      chooseIconLabel: 'Выберите иконку',
      chooseIconPlaceholder: 'Выберите иконку',
      saveCategory: 'Сохранить категорию',
      yourCategoriesTitle: 'Ваши категории',
      closeButton: 'Закрыть',
      languageLabel: 'Язык интерфейса',
    },
    personalizedTips: {
      title: 'Персональные советы',
      description: 'Получите краткие советы от AI, чтобы укрепить привычки.',
      fetchButton: 'Получить советы',
      fetching: 'Получение советов…',
      settingsLabel: 'Настройки OpenRouter:',
      configure: 'Настроить',
      missingApiKey: 'API ключ OpenRouter не настроен. Добавьте его и выберите модель.',
      noHabits: 'Добавьте хотя бы одну привычку, чтобы получить советы.',
      errorTitle: 'Ошибка',
      tipsTitle: 'Ваши персональные советы:',
    },
    apiDialog: {
      title: 'Настройки OpenRouter AI',
      description: 'Введите API ключ и выберите модель, чтобы получать советы от AI.',
      apiKeyLabel: 'API ключ',
      modelLabel: 'Модель',
      selectPlaceholder: 'Выберите модель',
      customModelPlaceholder: 'Введите название модели, например: anthropic/claude-3-opus',
      modelHelper: 'Полный список моделей доступен на сайте OpenRouter. Рекомендуем DeepSeek Chat.',
      systemPromptLabel: 'Системный промпт',
      systemPromptHelper: 'Этот промпт определяет, как AI отвечает на вопросы о привычках.',
      cancel: 'Отмена',
      save: 'Сохранить',
      defaultSystemPrompt: 'Ты — дружелюбный коуч по привычкам. Давай краткие мотивационные советы, чтобы помочь пользователю сохранить постоянство.',
      models: {
        deepseek: 'DeepSeek Chat (рекомендуется)',
        claudeHaiku: 'Claude 3 Haiku',
        claudeSonnet: 'Claude 3 Sonnet',
        gemini: 'Gemini Flash 1.5',
        mistral: 'Mistral 7B Instruct',
        gpt35: 'GPT-3.5 Turbo',
        gpt4o: 'GPT-4o Mini',
        llama: 'Llama 3.1 8B',
        custom: 'Другая модель…',
      },
    },
    progressChart: {
      noData: 'Нет данных о выполнении.',
      positiveTicks: {
        yes: 'Да',
        no: 'Нет',
        fail: 'Провал',
      },
      negativeTicks: {
        yes: 'Избежал',
        no: 'Н/Д',
        fail: 'Срыв',
      },
      tooltipNoEntry: 'Нет отметки',
    },
    achievements: {
      triggerLabel: 'Достижения',
      title: 'Достижения и значки',
      progressLabel: 'Прогресс',
      obtainedLabel: 'Получено:',
      stats: {
        level: 'Уровень',
        points: 'Очки',
        achievements: 'Значки',
        legendary: 'Легендарные',
      },
      tabs: {
        all: 'Все',
        unlocked: 'Получены',
        inProgress: 'В прогрессе',
        categories: 'По категориям',
      },
      empty: {
        unlockedTitle: 'У вас пока нет достижений',
        unlockedDescription: 'Продолжайте выполнять привычки, чтобы получить первые значки!',
        allUnlockedTitle: 'Все достижения получены!',
        allUnlockedDescription: 'Поздравляем с невероятным результатом!',
      },
      rarityLabels: {
        common: 'Обычное',
        rare: 'Редкое',
        epic: 'Эпическое',
        legendary: 'Легендарное',
      },
    },
    journal: {
      title: 'Дневник',
      description: 'Рефлексия дня и отслеживание настроения.',
      noEntryTitle: 'Записей пока нет',
      noEntryDescription: 'Начните писать, чтобы сохранить мысли о сегодняшнем дне.',
      addBlock: 'Добавить блок',
      blocks: {
        morning: 'Утренняя рефлексия',
        evening: 'Вечерняя рефлексия',
        freeText: 'Свободные заметки',
      },
      blockPlaceholders: {
        morning: 'Как вы себя чувствуете утром? Какие планы на день?',
        evening: 'Как прошёл день? Что получилось хорошо? Что можно улучшить?',
        freeText: 'Напишите свои мысли здесь...',
      },
      mood: {
        label: 'Настроение сегодня',
        levels: {
          1: 'Очень плохо',
          2: 'Плохо',
          3: 'Нормально',
          4: 'Хорошо',
          5: 'Отлично',
        },
      },
      autoSaved: 'Сохранено',
      deleteBlock: 'Удалить блок',
      deleteBlockConfirm: 'Вы уверены, что хотите удалить этот блок?',
    },
  },
};
