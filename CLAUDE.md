# CLAUDE.md - AI Assistant Guide for Habit Tracker

> **Purpose**: This document provides AI assistants with comprehensive guidance on the structure, conventions, and workflows of the Habit Tracker codebase.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Key Technologies](#key-technologies)
4. [Directory Structure](#directory-structure)
5. [Data Models](#data-models)
6. [Development Conventions](#development-conventions)
7. [Common Tasks](#common-tasks)
8. [Important Patterns](#important-patterns)
9. [Bilingual Support](#bilingual-support)
10. [Testing & Deployment](#testing--deployment)
11. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Habit Tracker** is a modern, local-first habit tracking application with AI-powered guidance. Key characteristics:

- **Local-First Architecture**: All data stored in browser localStorage (no backend database)
- **Bilingual**: Full English and Russian language support
- **AI-Powered**: Optional OpenRouter integration for personalized habit tips
- **Modern Stack**: Next.js 15 App Router, React 18, TypeScript, Tailwind CSS
- **Rich Features**: Drag-and-drop reordering, multiple view modes, analytics, achievements, Markdown import/export

### Core Capabilities
- Create positive/negative habits with goals, icons, frequency settings
- Track completions with three view modes (detailed/compact/minimal)
- Visualize progress with charts, streaks, weekly heatmaps
- Earn achievements and badges (13 predefined with 4 rarity levels)
- Get AI-powered personalized tips (via OpenRouter API)
- Import/export all data as structured Markdown
- Full theme support (light/dark/system)
- Custom user-defined categories with icons

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         Browser (Client-Side)            │
│  ┌────────────────────────────────────┐ │
│  │   React Components (UI Layer)      │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │   State Management (Hooks)         │ │
│  │   - useLocalStorage                │ │
│  │   - Context (Theme, Language)      │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │   localStorage (Data Persistence)  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
         │
         │ (Optional AI Features)
         ▼
┌─────────────────────────────────────────┐
│     Server Actions (Next.js Edge)       │
│  - fetchPersonalizedHabitTipsAction     │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│       OpenRouter API (External)         │
│  - DeepSeek, Claude, GPT, etc.          │
└─────────────────────────────────────────┘
```

### Component Hierarchy

```
App (src/app/layout.tsx)
├── LanguageProvider (bilingual support)
├── ThemeProvider (light/dark/system)
├── Toaster (notifications)
└── HabitTrackerClient (src/components/HabitTrackerClient.tsx)
    ├── Header (title, theme toggle, actions)
    ├── Date Navigator (calendar + quick nav)
    ├── StatsOverview (metrics dashboard)
    ├── WeeklyProgress (weekly heatmap)
    ├── Habit List (with DnD context)
    │   └── HabitItem[] (sortable cards)
    ├── PersonalizedTipsSection (AI tips)
    ├── AddHabitDialog (create/edit form)
    ├── ApiKeyDialog (OpenRouter settings)
    ├── CategorySettingsDialog (preferences)
    ├── ExportDialog (Markdown export)
    └── AchievementsDialog (badges, progress)
```

---

## Key Technologies

### Core Stack
- **Next.js**: 15.3.2 (App Router with Turbopack)
- **React**: 18.3.1
- **TypeScript**: 5.x (strict mode)
- **Tailwind CSS**: 3.4.1 (with CSS variables for theming)

### UI & Components
- **shadcn/ui**: Radix UI primitives (50+ components in `src/components/ui/`)
- **Lucide React**: Icon library (100+ icons)
- **Recharts**: Chart visualizations
- **next-themes**: Theme system
- **@dnd-kit**: Drag-and-drop reordering

### State & Forms
- **react-hook-form**: Form handling with validation
- **zod**: Schema validation
- **date-fns**: Date manipulation and formatting
- **Custom useLocalStorage hook**: State persistence

### AI Integration
- **Genkit**: 1.8.0 (Google's AI orchestration framework)
- **OpenRouter**: Multi-model AI gateway
- **Server Actions**: Next.js 15 server actions for API calls

---

## Directory Structure

```
/habit-tracker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page (renders HabitTrackerClient)
│   │   └── globals.css         # Global styles + CSS variables
│   │
│   ├── components/             # All React components
│   │   ├── ui/                 # shadcn/ui components (50+ files)
│   │   ├── HabitTrackerClient.tsx  # Main app component (790 lines)
│   │   ├── HabitItem.tsx       # Individual habit card/row
│   │   ├── AddHabitDialog.tsx  # Create/edit habit form
│   │   ├── PersonalizedTipsSection.tsx  # AI tips display
│   │   ├── StatsOverview.tsx   # Analytics dashboard
│   │   ├── WeeklyProgress.tsx  # Weekly heatmap
│   │   ├── icons.tsx           # Icon catalog (100+ icons)
│   │   └── [other dialogs]     # Various feature dialogs
│   │
│   ├── lib/                    # Core business logic
│   │   ├── types.ts            # TypeScript type definitions ⭐
│   │   ├── translations.ts     # i18n (en/ru) ⭐
│   │   ├── localStorage.ts     # Custom hook for state persistence
│   │   ├── achievements.ts     # Achievement system logic
│   │   ├── actions.ts          # Server actions for AI
│   │   ├── iconLocalization.ts # Icon/category translations
│   │   ├── achievementLocalization.ts  # Achievement translations
│   │   └── utils.ts            # Utility functions (cn, etc.)
│   │
│   ├── ai/                     # AI integration layer
│   │   ├── genkit.ts           # Genkit configuration
│   │   ├── flows/
│   │   │   └── personalized-habit-tips.ts  # OpenRouter flow
│   │   └── dev.ts              # Genkit dev entry point
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-toast.ts        # Toast notifications
│   │   └── use-mobile.tsx      # Mobile detection
│   │
│   └── pages/                  # Pages Router (legacy)
│       └── _document.tsx       # HTML document wrapper
│
├── docs/                       # Documentation
├── scripts/                    # Build/utility scripts
├── public/                     # Static assets
│
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind customization
├── next.config.ts              # Next.js configuration
├── components.json             # shadcn/ui configuration
├── apphosting.yaml             # Firebase deployment config
└── .env                        # Environment variables (not committed)
```

### Key Files (⭐ = Frequently Modified)

| File | Purpose | Modify When |
|------|---------|-------------|
| `src/lib/types.ts` ⭐ | All TypeScript interfaces | Adding new data fields, models |
| `src/lib/translations.ts` ⭐ | Bilingual strings (en/ru) | Adding any user-facing text |
| `src/components/HabitTrackerClient.tsx` ⭐ | Main app logic and state | Adding features, modifying workflows |
| `src/components/icons.tsx` ⭐ | Icon catalog | Adding new icons/categories |
| `src/lib/iconLocalization.ts` | Icon name translations | After adding icons |
| `src/lib/achievements.ts` | Achievement definitions | Adding new achievements |
| `src/ai/flows/personalized-habit-tips.ts` | AI prompt logic | Modifying AI behavior |

---

## Data Models

### Core Types (src/lib/types.ts)

```typescript
// Habit is the main data model
interface Habit {
  id: string                      // UUID v4
  name: string                    // Display name
  description?: string            // Optional description
  icon: string                    // Key from availableIcons (NOT component name)
  goal: string                    // User's goal statement
  frequency: 'daily' | 'weekly' | 'monthly'
  type: 'positive' | 'negative'   // Positive = do it, Negative = avoid it
  completions: HabitCompletion[]  // Array of completion records
  createdAt: string               // ISO date string
  streak: number                  // Auto-calculated (don't set manually)
}

interface HabitCompletion {
  date: string                    // YYYY-MM-DD format (NOT ISO)
  status: 'completed' | 'failed' | 'skipped'
  notes?: string
}

interface UserDefinedCategory {
  id: string                      // UUID v4
  name: string                    // Custom category name
  iconKey: string                 // Reference to availableIcons key
}

interface OpenRouterSettings {
  apiKey: string
  modelName?: string              // Default: deepseek/deepseek-chat
  systemPrompt?: string
}
```

### localStorage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `habits` | `Habit[]` | All habit data |
| `userCategories` | `UserDefinedCategory[]` | Custom categories |
| `openrouter_settings` | `OpenRouterSettings \| null` | AI API config |
| `compact_habit_view` | `boolean` | View mode toggle |
| `minimal_habit_view` | `boolean` | View mode toggle |
| `show_stats_overview_section` | `boolean` | Section visibility |
| `show_weekly_progress_section` | `boolean` | Section visibility |
| `language` | `'en' \| 'ru'` | UI language |
| `theme` | `'light' \| 'dark' \| 'system'` | Theme setting |

### Important Data Constraints

1. **Date Formats**:
   - Completion dates: `YYYY-MM-DD` (e.g., `"2024-11-17"`)
   - Timestamps: ISO strings (e.g., `"2024-11-17T12:00:00.000Z"`)
   - Always use `date-fns` for date operations

2. **Icon Keys**:
   - Must match keys in `availableIcons` object
   - Examples: `"BookOpen"`, `"Bike"`, `"Coffee"`
   - NOT Lucide component names

3. **Streaks**:
   - Always auto-calculated via `calculateStreak()`
   - Never set `streak` manually
   - Recalculated after any habit modification

4. **IDs**:
   - Use `crypto.randomUUID()` for new habits/categories
   - UUIDs v4 format

---

## Development Conventions

### TypeScript
- **Strict Mode**: Enabled (but build errors ignored - see `next.config.ts`)
- **No `any`**: Use proper types from `src/lib/types.ts`
- **Path Aliases**: Use `@/` for imports (e.g., `@/lib/types`)
- **Target**: ES2017

### React
- **Client Components**: All components are `'use client'` (no SSR)
- **Server Actions**: Mark with `'use server'` at top of file
- **Hooks**: Follow React hooks rules (no conditional calls)
- **Props**: Define explicit interfaces for all component props

### Styling
- **Tailwind Classes**: Use utility classes, avoid inline styles
- **CSS Variables**: Use semantic variables (e.g., `hsl(var(--primary))`)
- **Theme-Aware**: Always support both light/dark themes
- **cn() Utility**: Use for conditional classNames
  ```typescript
  import { cn } from "@/lib/utils"
  className={cn("base-class", condition && "conditional-class")}
  ```

### State Management
- **Local State**: `useState` for component-level state
- **Persistent State**: `useLocalStorage` for data persistence
- **Context**: Only for theme and language (avoid overuse)
- **No Props Drilling**: Use context or composition instead

### File Naming
- **Components**: PascalCase (e.g., `HabitItem.tsx`)
- **Utilities**: camelCase (e.g., `localStorage.ts`)
- **Types**: Singular (e.g., `types.ts` not `types.d.ts`)

### Code Organization
- **One Component Per File**: Except for small helper components
- **Export Pattern**: Named exports preferred over default
- **Imports Order**:
  1. React/Next imports
  2. Third-party libraries
  3. Local components
  4. Utilities and types
  5. Styles

---

## Common Tasks

### Adding a New Habit Field

1. **Update Type Definition** (`src/lib/types.ts`):
   ```typescript
   interface Habit {
     // ... existing fields
     newField: string  // Add your field
   }
   ```

2. **Update AddHabitDialog** (`src/components/AddHabitDialog.tsx`):
   - Add form field to UI
   - Add to validation schema (if required)
   - Update `onSave` handler

3. **Update HabitItem** (`src/components/HabitItem.tsx`):
   - Display new field in UI
   - Update edit handler if editable

4. **Update Markdown Import/Export** (`src/components/HabitTrackerClient.tsx`):
   - Add to `exportMarkdown()` function
   - Update `parseHabitMarkdown()` function

5. **Add Translations** (if user-facing):
   - English: `src/lib/translations.ts` → `translations.en`
   - Russian: `src/lib/translations.ts` → `translations.ru`

### Adding a New Icon/Category

1. **Add Icon** (`src/components/icons.tsx`):
   ```typescript
   import { NewIcon } from 'lucide-react'

   export const availableIcons = {
     // ... existing icons
     NewIcon: {
       name: 'Russian Name',        // Internal name (Russian)
       icon: NewIcon,                // Lucide component
       category: 'Russian Category'  // Existing or new category
     }
   }
   ```

2. **Add Localization** (`src/lib/iconLocalization.ts`):
   ```typescript
   export function localizeIconName(key: string, language: 'en' | 'ru'): string {
     const localization: Record<string, { en: string; ru: string }> = {
       // ... existing localizations
       NewIcon: { en: 'English Name', ru: 'Russian Name' }
     }
   }
   ```

3. **Add Category Translation** (if new category):
   ```typescript
   export function localizeCategoryName(category: string, language: 'en' | 'ru'): string {
     const localization: Record<string, { en: string; ru: string }> = {
       // ... existing categories
       'Russian Category': { en: 'English Category', ru: 'Russian Category' }
     }
   }
   ```

### Adding a New Achievement

1. **Define Achievement** (`src/lib/achievements.ts`):
   ```typescript
   const achievementsList: Record<string, Omit<Achievement, 'id' | 'unlockedAt'>> = {
     // ... existing achievements
     new_achievement: {
       type: 'new_achievement',
       name: 'Achievement Name (Russian)',
       description: 'Description (Russian)',
       badgeIcon: '🏆',  // Emoji or SVG filename
       rarity: 'rare'    // common | rare | epic | legendary
     }
   }
   ```

2. **Add Unlock Logic**:
   - Update `checkAndUnlockAchievements()` function
   - Add condition for unlocking

3. **Add Translations** (`src/lib/achievementLocalization.ts`):
   ```typescript
   export function localizeAchievementName(type: AchievementType, language: 'en' | 'ru'): string {
     const names: Record<AchievementType, { en: string; ru: string }> = {
       // ... existing names
       new_achievement: { en: 'English Name', ru: 'Russian Name' }
     }
   }
   ```

### Adding a New Translation String

1. **Add to English** (`src/lib/translations.ts`):
   ```typescript
   export const translations = {
     en: {
       general: {
         // ... existing strings
         newString: 'English text'
       }
     }
   }
   ```

2. **Add to Russian**:
   ```typescript
   export const translations = {
     ru: {
       general: {
         // ... existing strings
         newString: 'Русский текст'
       }
     }
   }
   ```

3. **Use in Component**:
   ```typescript
   const t = useTranslations()
   <span>{t.general.newString}</span>
   ```

### Modifying AI Behavior

1. **Update System Prompt** (`src/ai/flows/personalized-habit-tips.ts`):
   ```typescript
   const systemPrompt = input.systemPrompt || `
     Your custom prompt here...
   `
   ```

2. **Modify Output Schema** (if changing structure):
   ```typescript
   const PersonalizedHabitTipsOutputSchema = z.object({
     tips: z.array(z.string())  // Modify as needed
   })
   ```

3. **Update Server Action** (`src/lib/actions.ts`):
   - Modify input validation
   - Update error handling
   - Adjust timeout if needed

4. **Test with Different Models**:
   - DeepSeek (default, fast)
   - Claude (best quality)
   - GPT-4 (balanced)

---

## Important Patterns

### 1. Streak Calculation

**Location**: `HabitTrackerClient.tsx:calculateStreak()`

**Algorithm** (for daily habits):
```typescript
1. Start from today, work backwards
2. Skip days before habit creation
3. For each day:
   - If completed: increment streak
   - If skipped: continue (don't break, don't count)
   - If failed: break streak
   - If no entry AND after creation date:
     * Positive habit: break streak
     * Negative habit: continue streak
4. Return final count
```

**Key Rules**:
- Skipped days don't break streaks (neutral)
- Only check days >= habit creation date
- Non-daily habits: simple consecutive count
- Always recalculate after modifications (never trust stored values)

### 2. View Mode Toggle

**Three Modes** (controlled by two booleans):
```typescript
minimal_habit_view = true  → Minimal (checklist)
compact_habit_view = true  → Compact (grid)
both = false               → Detailed (cards)
```

**Rendering Logic**:
```typescript
{minimalHabitView ? (
  <MinimalView />
) : compactHabitView ? (
  <CompactView />
) : (
  <DetailedView />
)}
```

### 3. Positive vs Negative Habits

**Differences**:

| Aspect | Positive Habit | Negative Habit |
|--------|----------------|----------------|
| Complete Button | "Complete" / "Завершить" | "Resisted" / "Устоял" |
| Complete Icon | Check | Shield |
| Failed Button | "Mark Failed" / "Не выполнено" | "Relapsed" / "Сорвался" |
| Failed Icon | X | Alert Triangle |
| Border Color | Green (completed) | Blue (resisted) |
| Streak Logic | No entry = failed | No entry = success |

**Access via**:
```typescript
const isPositive = habit.type === 'positive'
```

### 4. Markdown Import/Export

**Export Structure**:
```markdown
# Habits Export

## Category: Category Name

---

### Habit Name
- IconKey: IconKeyName
- Goal: Habit goal
- Frequency: daily
- Type: positive
- CreatedAt: 2024-01-01T00:00:00.000Z
- Description: Optional description
- Completions:
  - date: 2024-11-17 | status: completed | notes: Optional notes

---

# User Categories Export
- id: uuid, name: Category Name, iconKey: IconKey

# Standard Categories Export (for AI reference)
### Category Name (Russian)
- key: IconKey, name: Icon Name (Russian)
```

**Parsing Logic**:
- Handles both English and Russian headers
- Case-insensitive matching
- Validates icon keys against `availableIcons`
- Generates new UUIDs for imported habits
- Preserves completion history

### 5. Date Navigation

**Components**:
- Calendar popover (full month view)
- Quick buttons (Today, Yesterday, 2 days ago)
- Arrow navigation (Previous/Next day)

**Constraints**:
- Cannot select future dates
- Respects habit creation dates
- Updates all views on change

**Implementation**:
```typescript
const [selectedDate, setSelectedDate] = useState(new Date())
const formattedDate = format(selectedDate, 'yyyy-MM-dd')
```

### 6. Achievement Unlocking

**Check Points**:
- After completing a habit
- After adding new habits
- After daily calculations
- On app load (for time-based achievements)

**Process**:
1. Calculate current stats (streaks, completion rates, etc.)
2. Check each locked achievement's condition
3. If condition met:
   - Mark as unlocked
   - Set `unlockedAt` timestamp
   - Show toast notification
4. Save to localStorage

**Progress Tracking**:
```typescript
achievement.progress = currentValue
achievement.maxProgress = requiredValue
// Progress bar shows: (currentValue / requiredValue) * 100
```

### 7. Drag-and-Drop Reordering

**Library**: `@dnd-kit` (modern, accessible DnD)

**Implementation**:
```typescript
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={habits.map(h => h.id)}>
    {habits.map(habit => (
      <SortableHabitItem key={habit.id} habit={habit} />
    ))}
  </SortableContext>
</DndContext>
```

**handleDragEnd Logic**:
1. Find old and new indices
2. Create new array with reordered items
3. Update state
4. Save to localStorage

**Visual Feedback**:
- Opacity: 0.5 while dragging
- Shadow: Elevated appearance
- Cursor: Grab/grabbing

### 8. AI Integration Flow

```
User clicks "Get Tips"
  ↓
Check API key exists
  ↓
Prepare habit data:
  - Names, goals, types
  - Recent completions (last 7 days)
  - Current streaks
  ↓
Call Server Action
  fetchPersonalizedHabitTipsAction(habits, settings)
  ↓
Server Action calls Genkit Flow
  getPersonalizedHabitTips(input)
  ↓
Genkit Flow calls OpenRouter
  POST https://openrouter.ai/api/v1/chat/completions
  ↓
OpenRouter returns JSON
  { tips: string[] }
  ↓
Validate against Zod schema
  ↓
Return to client
  ↓
Display in PersonalizedTipsSection
```

**Error Handling**:
- No API key: Show dialog to configure
- Network error: Show error toast
- Timeout (30s): Show timeout message
- Invalid response: Show parsing error

---

## Bilingual Support

### Language Architecture

**Storage**: `localStorage.getItem('language')` → `'en' | 'ru'`

**Context**: `LanguageProvider` in `src/app/layout.tsx`

**Hook**: `useLanguage()` returns `{ language, setLanguage }`

**Translations**: `useTranslations()` returns current language object

### Translation Structure

```typescript
// src/lib/translations.ts
export const translations = {
  en: {
    general: { /* common strings */ },
    habits: { /* habit-related strings */ },
    stats: { /* statistics strings */ },
    achievements: { /* achievement strings */ },
    settings: { /* settings strings */ },
    ai: { /* AI-related strings */ }
  },
  ru: {
    // Same structure, Russian values
  }
}
```

### Localization Layers

1. **UI Strings**: `translations.ts` (direct lookups)
2. **Icon Names**: `iconLocalization.ts` (key → localized name)
3. **Category Names**: `iconLocalization.ts` (category → localized name)
4. **Achievement Names**: `achievementLocalization.ts` (type → localized name)
5. **Achievement Descriptions**: `achievementLocalization.ts` (type → localized desc)

### Adding Bilingual Features

**Rule**: ALL user-facing strings must be in both languages

**Process**:
1. Add English string to `translations.en`
2. Add Russian string to `translations.ru`
3. Use `t.section.key` in component
4. Test in both languages (toggle in UI)

**Example**:
```typescript
// Bad (hardcoded)
<button>Save</button>

// Good (bilingual)
const t = useTranslations()
<button>{t.general.save}</button>
```

### Markdown Bilingual Support

**Headers**: Parser accepts both English and Russian
```markdown
# Habits Export         OR    # Экспорт привычек
## Category: Health     OR    ## Категория: Здоровье
```

**Implementation**: Multiple regex patterns in `parseHabitMarkdown()`

---

## Testing & Deployment

### Current Testing Status

**⚠️ No tests currently exist**

Recommended testing approach if implementing:
- **Unit Tests**: `vitest` for utilities, calculations
- **Component Tests**: `@testing-library/react` for UI
- **E2E Tests**: `playwright` for full workflows

### Build Process

```bash
# Development (with Turbopack)
npm run dev              # Port 9005

# Type checking (manual, not in build)
npm run typecheck        # tsc --noEmit

# Linting (manual, not in build)
npm run lint             # next lint

# Production build
npm run build            # Ignores TS/ESLint errors

# Production server
npm start                # Runs built app
```

### Build Configuration

**⚠️ Important**: Both TypeScript and ESLint errors are IGNORED during builds

```typescript
// next.config.ts
{
  typescript: {
    ignoreBuildErrors: true  // TS errors don't block builds
  },
  eslint: {
    ignoreDuringBuilds: true // ESLint errors don't block builds
  }
}
```

**Implication**: Always run `npm run typecheck` manually before committing

### Environment Variables

```bash
# .env (optional, for server-side API key)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_DEFAULT_MODEL=deepseek/deepseek-chat
OPENROUTER_SITE_URL=http://localhost:9005
OPENROUTER_SITE_NAME=Habit Tracker
```

**Note**: Users can provide their own API key via UI (stored in localStorage)

### Deployment

**Platform**: Firebase App Hosting (configured via `apphosting.yaml`)

**Configuration**:
```yaml
runConfig:
  maxInstances: 1  # Single instance
```

**Also Compatible With**:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any static hosting (after `next build`)

**Pre-Deployment Checklist**:
1. Run `npm run typecheck` (manual check)
2. Run `npm run lint` (manual check)
3. Test in both languages
4. Test in both themes (light/dark)
5. Test import/export
6. Verify localStorage persistence
7. Test AI integration (if using)

---

## Troubleshooting

### Common Issues

#### 1. "Icon not found" error

**Cause**: Icon key doesn't match `availableIcons`

**Solution**:
```typescript
// Check key exists
import { availableIcons } from '@/components/icons'
const iconKey = 'BookOpen'  // Must match exactly
const exists = iconKey in availableIcons
```

#### 2. Streak not updating

**Cause**: Not calling `recalculateAllStreaks()`

**Solution**:
```typescript
// After any habit modification
setHabits(newHabits)
recalculateAllStreaks()  // Don't forget this!
```

#### 3. Translation missing

**Cause**: String not in both languages

**Solution**:
```typescript
// Check both exist
translations.en.section.key  // English
translations.ru.section.key  // Russian
```

#### 4. localStorage not persisting

**Cause**: SSR/hydration issues

**Solution**:
```typescript
// Always check window exists
if (typeof window !== 'undefined') {
  localStorage.setItem(key, value)
}

// Or use useLocalStorage hook (handles this)
```

#### 5. Date format errors

**Cause**: Mixing ISO strings and YYYY-MM-DD

**Solution**:
```typescript
// For completion dates
const dateStr = format(date, 'yyyy-MM-dd')  // "2024-11-17"

// For timestamps
const timestamp = new Date().toISOString()  // "2024-11-17T12:00:00.000Z"
```

#### 6. AI tips not loading

**Causes & Solutions**:
- No API key: Show `ApiKeyDialog`
- Network error: Check OpenRouter status
- Timeout: Increase timeout in flow (currently 30s)
- Invalid model: Check model name format
- Invalid response: Check Zod schema matches API response

#### 7. Import fails silently

**Cause**: Markdown format mismatch

**Debug**:
```typescript
// Check console for parsing errors
console.log('Parsed habits:', parsedHabits)

// Validate icon keys
const validIconKeys = Object.keys(availableIcons)
const invalidKeys = parsedHabits.filter(h => !validIconKeys.includes(h.icon))
```

### Debug Mode

Add to localStorage for debug logging:
```typescript
localStorage.setItem('debug', 'true')
```

Then check console for detailed logs (if implemented in code)

### Performance Issues

**Large Habit Lists** (100+ habits):
- Consider pagination or virtualization
- Limit completion history (e.g., last 365 days)
- Use `useMemo` for expensive calculations
- Debounce localStorage writes

**Slow AI Responses**:
- Use faster models (DeepSeek > GPT > Claude)
- Reduce habit count in prompt
- Implement streaming responses
- Add loading skeleton

---

## Quick Reference

### File Location Cheat Sheet

| Task | File(s) |
|------|---------|
| Add/modify types | `src/lib/types.ts` |
| Add UI text | `src/lib/translations.ts` |
| Add icons | `src/components/icons.tsx` + `src/lib/iconLocalization.ts` |
| Modify main app | `src/components/HabitTrackerClient.tsx` |
| Add achievements | `src/lib/achievements.ts` + `src/lib/achievementLocalization.ts` |
| Modify AI behavior | `src/ai/flows/personalized-habit-tips.ts` |
| Add UI component | `src/components/` (+ `src/components/ui/` for primitives) |
| Modify theme | `src/app/globals.css` (CSS variables) |
| Add custom hook | `src/hooks/` |
| Modify build | `next.config.ts` |

### Command Cheat Sheet

```bash
# Development
npm run dev                    # Start dev server (port 9005)
npm run genkit:dev             # Start Genkit dev UI
npm run genkit:watch           # Genkit with watch mode

# Quality Checks
npm run typecheck              # Check TypeScript (manual)
npm run lint                   # Run ESLint (manual)

# Production
npm run build                  # Build for production
npm start                      # Run production server

# Dependencies
npm install                    # Install all dependencies
npm install <package>          # Add new dependency
```

### Key Keyboard Shortcuts (in development)

| Action | Shortcut |
|--------|----------|
| Save file | Cmd/Ctrl + S |
| Format code | Cmd/Ctrl + Shift + F |
| Quick fix | Cmd/Ctrl + . |
| Go to definition | F12 |
| Find references | Shift + F12 |

---

## Best Practices for AI Assistants

### When Modifying This Codebase

1. **Always Check Types First**
   - Read `src/lib/types.ts` before making changes
   - Ensure type compatibility across modifications

2. **Maintain Bilingual Parity**
   - Every EN string needs an RU equivalent
   - Test both languages after changes
   - Use translation functions, never hardcode

3. **Respect Local-First Architecture**
   - No backend database assumptions
   - All state via localStorage or React state
   - Consider offline-first implications

4. **Preserve Existing Patterns**
   - Follow established naming conventions
   - Use existing utility functions
   - Match component structure style

5. **Update Related Files**
   - Types → Translations → Components → Tests (if added)
   - Icon → Localization → Usage
   - Achievement → Localization → Unlock logic

6. **Test Cross-Cutting Concerns**
   - Light/dark theme compatibility
   - English/Russian language switching
   - All three view modes (detailed/compact/minimal)
   - Markdown import/export round-trip
   - Mobile responsiveness

7. **Document Significant Changes**
   - Update this CLAUDE.md if architecture changes
   - Add comments for complex logic
   - Update README.md for user-facing features

8. **Handle Edge Cases**
   - Empty states (no habits, no completions)
   - Large datasets (100+ habits, 365+ days)
   - Invalid user input
   - Network failures (for AI features)
   - localStorage quota exceeded

### Code Review Checklist

Before committing changes:

- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] All user-facing strings translated (en + ru)
- [ ] Tested in light and dark themes
- [ ] Tested in both languages
- [ ] Tested all three view modes (if UI change)
- [ ] localStorage persistence works
- [ ] Markdown export includes new fields
- [ ] Markdown import handles new fields
- [ ] Achievements still unlock correctly (if related)
- [ ] Streak calculation still accurate (if related)
- [ ] Mobile-responsive (if UI change)
- [ ] No console errors or warnings
- [ ] Follows existing code style

---

## Additional Resources

### External Documentation

- **Next.js 15 Docs**: https://nextjs.org/docs
- **React 18 Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Lucide Icons**: https://lucide.dev/icons
- **date-fns**: https://date-fns.org/docs
- **Genkit**: https://firebase.google.com/docs/genkit
- **OpenRouter**: https://openrouter.ai/docs

### Project-Specific Docs

- `README.md`: User-facing documentation
- `docs/`: Additional documentation (if any)
- `.windsurfrules`: Windsurf AI rules (project conventions)

### Getting Help

1. **Check this CLAUDE.md first** for architecture guidance
2. **Read type definitions** in `src/lib/types.ts`
3. **Review existing code** for patterns
4. **Check console** for errors
5. **Test in both languages** to catch i18n issues

---

## Changelog

| Date | Change |
|------|--------|
| 2024-11-17 | Initial CLAUDE.md creation |

---

**End of CLAUDE.md**

> This document should be updated whenever significant architectural changes are made to the codebase. Keep it current to help future AI assistants understand the project quickly and accurately.
