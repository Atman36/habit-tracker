
import type { IconOption } from '@/lib/types';
import {
  BookOpen, Dumbbell, Coffee, Bed, Zap, Apple, DollarSign, Lightbulb, Briefcase, Smile, Brain, Target, Droplets, CalendarDays, CheckCircle, TrendingUp,
  Clock, Wind, PersonStanding, HandHeart, Carrot, Ban, Bike, Home, GraduationCap, NotebookText, Star, Moon, ShowerHead, Palette, Utensils, Hourglass, ThumbsDown,
  Activity, Anchor, Award, BarChart3, BatteryCharging, Bell, Bone, Bookmark, Box, Building2, Camera, Clapperboard, Cloudy, Code, Cog, Compass,
  Cpu, CreditCard, Crop, Database, Ear, Eraser, Factory, Feather, Figma, FileText, Filter, Flag, Folder, Footprints, Forklift, Gamepad2,
  Gauge, Ghost, Gift, GitFork, Globe, Grab, Grip, Headphones, Heart, HelpCircle, Image, Infinity, Info, IterationCcw, KeyRound, Landmark, Layers,
  LayoutGrid, ListChecks, LogIn, LogOut, Mail, MapPin, Medal, Megaphone, Menu, MessageCircle, Mic2, MousePointerClick, Music2, Newspaper, Package,
  PaintBucket, Paperclip, ParkingCircle, Pencil, Percent, Phone, PieChart, Pin, Plane, Plug, Pocket, Printer, Puzzle, Quote, Repeat, RotateCcw, Rss,
  Save, ScanLine, Scissors, ScreenShare, Send, Server, Settings2, ShieldCheck, ShoppingBag, Sigma, Smartphone, Sprout, Sticker, SunMedium, Sunset,
  SwissFranc, Table, Tag, Tent, Terminal, TestTube2, TextCursorInput, Ticket, ToyBrick, Train, Trash2, TreePine, Trophy, Tv, Umbrella, Vault, Video,
  Voicemail, Wallet, Watch, Wifi, Wine, Wrench, Youtube, CircleDot, ClipboardList, Users, Leaf, Flame, BarChart, BriefcaseMedical, MountainSnow, School, TrendingDown
} from 'lucide-react';

export const ADDITIONAL_CATEGORY_KEY = 'Дополнительные';

export const availableIcons: Record<string, IconOption> = {
  // Общее
  CheckCircle: { name: 'Выполнение', icon: CheckCircle, category: 'Общее' },
  Activity: { name: 'Активность', icon: Activity, category: 'Продуктивность' },
  Bell: { name: 'Уведомление / Напоминание', icon: Bell, category: 'Общее' },
  ShieldCheck: { name: 'Защита / Безопасность', icon: ShieldCheck, category: 'Общее' },
  Sprout: { name: 'Росток / Начало', icon: Sprout, category: 'Развитие' },
  KeyRound: { name: 'Ключ / Доступ', icon: KeyRound, category: 'Общее' },

  // Продуктивность
  Target: { name: 'Цель / Фокус', icon: Target, category: 'Продуктивность' },
  CalendarDays: { name: 'Планирование / Календарь', icon: CalendarDays, category: 'Продуктивность' },
  BarChart: { name: 'Статистика / Анализ', icon: BarChart, category: 'Продуктивность' },
  ListChecks: { name: 'Чек-лист / Задачи', icon: ListChecks, category: 'Продуктивность' },
  Hourglass: { name: 'Управление временем', icon: Hourglass, category: 'Продуктивность'},
  Pencil: { name: 'Запись / Редактирование', icon: Pencil, category: 'Продуктивность' },
  Bookmark: { name: 'Закладка / Запомнить', icon: Bookmark, category: 'Продуктивность' },
  FileText: { name: 'Документ / Отчет', icon: FileText, category: 'Продуктивность' },
  Newspaper: { name: 'Чтение новостей / Информация', icon: Newspaper, category: 'Продуктивность' },
  Gauge: {name: 'Измерение / Производительность', icon: Gauge, category: 'Продуктивность'},
  Repeat: {name: 'Повтор / Цикл', icon: Repeat, category: 'Продуктивность'},

  // Работа
  Briefcase: { name: 'Работа / Проекты', icon: Briefcase, category: 'Работа' },
  Terminal: { name: 'Программирование / Кодинг', icon: Terminal, category: 'Работа' },
  Code: { name: 'Код / Разработка', icon: Code, category: 'Работа' },
  Building2: { name: 'Офис / Компания', icon: Building2, category: 'Работа' },

  // Развитие
  Brain: { name: 'Размышление / Улучшение', icon: Brain, category: 'Развитие' },
  GraduationCap: { name: 'Обучение / Знания', icon: GraduationCap, category: 'Развитие' },
  BookOpen: { name: 'Чтение / Книги', icon: BookOpen, category: 'Развитие' },
  TrendingUp: { name: 'Личностный рост', icon: TrendingUp, category: 'Развитие' },
  School: { name: 'Учеба / Курсы', icon: School, category: 'Развитие'},
  Lightbulb: { name: 'Идеи / Инсайты', icon: Lightbulb, category: 'Развитие' },
  Puzzle: { name: 'Решение задач / Логика', icon: Puzzle, category: 'Развитие' },

  // Здоровье и Фитнес
  PersonStanding: { name: 'Йога / Зарядка / Растяжка', icon: PersonStanding, category: 'Здоровье и Фитнес' },
  Zap: { name: 'Энергия / Интенсивность / Гвозди', icon: Zap, category: 'Здоровье и Фитнес' }, // Используем Zap для "Стояние на гвоздях"
  Dumbbell: { name: 'Силовые упражнения / Планка / Отжимания', icon: Dumbbell, category: 'Здоровье и Фитнес' },
  Bike: { name: 'Кардио / Активный отдых / Прогулка / Велосипед', icon: Bike, category: 'Здоровье и Фитнес' },
  BriefcaseMedical: { name: 'Здоровье (общее) / Врач', icon: BriefcaseMedical, category: 'Здоровье и Фитнес'},
  Heart: { name: 'Сердце / Кардио здоровье', icon: Heart, category: 'Здоровье и Фитнес' },

  // Питание и Напитки
  Carrot: { name: 'Фрукты / Овощи / Здоровая еда', icon: Carrot, category: 'Питание и Напитки' },
  Droplets: { name: 'Вода / Гидратация', icon: Droplets, category: 'Питание и Напитки' },
  Coffee: { name: 'Кофе / Чай / Напитки', icon: Coffee, category: 'Питание и Напитки' },
  Utensils: { name: 'Прием пищи / Готовка', icon: Utensils, category: 'Питание и Напитки' },
  Apple: { name: 'Фрукт / Перекус', icon: Apple, category: 'Питание и Напитки' },
  BanSugarAndFlour: { name: 'Без мучного и сахара', icon: Ban, category: 'Питание и Напитки'}, // Используем Ban для "Мучное и сахар после 3х" и "Еда после 6"

  // Режим дня
  Clock: { name: 'Подъём / Время / Режим', icon: Clock, category: 'Режим дня' },
  ShowerHead: { name: 'Душ / Гигиена', icon: ShowerHead, category: 'Режим дня' },
  Moon: { name: 'Сон / Отдых', icon: Moon, category: 'Режим дня' },
  Bed: { name: 'Отход ко сну / Сон до 22.30', icon: Bed, category: 'Режим дня' },

  // Благополучие и Осознанность
  Wind: { name: 'Дыхание / Свежий воздух', icon: Wind, category: 'Благополучие и Осознанность' },
  HandHeart: { name: 'Благодарность / Доброта', icon: HandHeart, category: 'Благополучие и Осознанность' },
  CircleDot: { name: 'Медитация / Осознанность', icon: CircleDot, category: 'Благополучие и Осознанность' },
  NotebookText: { name: 'Дневник / Записи', icon: NotebookText, category: 'Благополучие и Осознанность' },
  ClipboardList: { name: 'Дневник успеха / Достижения', icon: ClipboardList, category: 'Благополучие и Осознанность' },
  Leaf: { name: 'Природа / Релаксация', icon: Leaf, category: 'Благополучие и Осознанность' },
  Users: { name: 'Общение / Семья / Друзья', icon: Users, category: 'Благополучие и Осознанность'},
  Smile: { name: 'Настроение / Позитив', icon: Smile, category: 'Благополучие и Осознанность' },

  // Хобби и Отдых
  Palette: { name: 'Творчество / Искусство', icon: Palette, category: 'Хобби и Отдых' },
  MountainSnow: { name: 'Путешествия / Приключения', icon: MountainSnow, category: 'Хобби и Отдых'},
  Gamepad2: { name: 'Игры / Развлечения (без залипания)', icon: Gamepad2, category: 'Хобби и Отдых' }, // Для "Залипание без смысла" можно использовать Ban или TrendingDown

  // Финансы
  DollarSign: { name: 'Финансы / Заработок / Траты', icon: DollarSign, category: 'Финансы' },

  // Дом и Быт
  Home: { name: 'Домашние дела / Уют', icon: Home, category: 'Дом и Быт' },

  // Ограничения / Негативные привычки
  Ban: { name: 'Запрет / Ограничение (общее)', icon: Ban, category: 'Ограничения / Негативные привычки' },
  ThumbsDown: { name: 'Негативная привычка / Избегать', icon: ThumbsDown, category: 'Ограничения / Негативные привычки' },
  TrendingDown: { name: 'Снижение / Уменьшение негативного / Анти-залипание', icon: TrendingDown, category: 'Ограничения / Негативные привычки' },
  Wine: { name: 'Вино / Алкоголь (отслеживание)', icon: Wine, category: 'Ограничения / Негативные привычки' },

  // Дополнительные (эти иконки будут доступны для выбора в настройках категорий, но не в основном списке при добавлении привычки)
  Anchor: { name: 'Якорь / Стабильность', icon: Anchor, category: ADDITIONAL_CATEGORY_KEY },
  Award: { name: 'Награда', icon: Award, category: ADDITIONAL_CATEGORY_KEY },
  Cloudy: { name: 'Облачно / Погода', icon: Cloudy, category: ADDITIONAL_CATEGORY_KEY },
};

export const defaultIconKey = 'CheckCircle'; // "Выполнение"

export const getIconComponent = (iconKey: string | undefined): React.FC<React.SVGProps<SVGSVGElement> & {className?: string}> => {
  return availableIcons[iconKey || defaultIconKey]?.icon || CheckCircle;
};
