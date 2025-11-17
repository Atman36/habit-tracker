# 🎯 Habit Tracker

A modern, local-first habit tracker with AI guidance. Plan routines, record completions, visualize progress, and export/import everything as Markdown. The interface ships with English by default and lets you switch to Russian at any time.

## Core capabilities

- **Habit management** – create positive or negative habits with goals, notes, frequency, and custom icons. Drag-and-drop reordering plus inline editing keeps the list tidy.
- **Four habit views** – toggle between:
  1. **Detailed cards** with streaks, notes, and per-habit analytics.
  2. **Compact grid** that keeps icons and quick actions without the extra text.
  3. **Minimal checklist** for ultra-dense tracking.
  4. **Analytics-first layout** where stats/weekly widgets can be shown or hidden for a data-heavy or distraction-free workspace.
- **Analytics dashboard** – a stats overview, weekly heatmap, and per-habit charts surface completion rates, streaks, and trends.
- **Achievements & gamification** – earn localized badges, track rarity counts, and monitor progress toward locked achievements.
- **AI-powered tips** – connect an OpenRouter API key and receive short habit-specific nudges. The dialog stores your key/model locally and supports custom prompts.
- **Import/export** – download a Markdown snapshot (including custom categories) and import it later. The parser understands both English and Russian headers.
- **Personalization** – light/dark/system themes, custom user categories with icons, language switcher, and persistent layout settings via `localStorage`.

## Technology stack

- **Framework**: Next.js (App Router) + React
- **Styling**: Tailwind CSS, CSS variables, next-themes
- **UI components**: shadcn/ui + Lucide icons
- **Charts**: Recharts via shadcn charts wrappers
- **State**: React hooks + browser `localStorage`
- **Dates**: `date-fns`
- **Forms & validation**: `react-hook-form` + `zod`
- **AI**: Genkit flow + OpenRouter API integration

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure AI access (optional)** – create `.env` and add your OpenRouter key:
   ```env
   OPENROUTER_API_KEY="your_key_here"
   # OPENROUTER_DEFAULT_MODEL="mistralai/mistral-7b-instruct" # Optional
   # OPENROUTER_SITE_URL="http://localhost:9005"             # Optional
   # OPENROUTER_SITE_NAME="Habit Tracker"                    # Optional
   ```
3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:9005`.
4. **(Optional) Genkit dev loop**
   ```bash
   npm run genkit:dev       # one-off run
   npm run genkit:watch     # watch mode
   ```

## Project structure

- `src/app` – Next.js pages/layouts.
- `src/components` – UI + client components (habit list, dialogs, analytics widgets, etc.).
- `src/lib` – helpers, translations, achievements, icon catalogs, server actions.
- `src/ai` – Genkit flows for OpenRouter tips.
- `src/hooks` – custom hooks such as `useLocalStorage` and toasts.

## Development tips

- Add new user-facing strings to `src/lib/translations.ts` with both languages.
- Icon/category names stay in Russian internally; use `src/lib/iconLocalization.ts` (and `achievementLocalization.ts`) to display the correct language.
- Exported Markdown should remain parseable even if you localize headings—`parseHabitMarkdown` handles English and Russian variants.
- When adding new UI surfaces, make sure they honor the language/theme settings and keep the four habit views consistent.
