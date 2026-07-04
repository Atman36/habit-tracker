'use client';

import type { Achievement, UserAchievements } from '@/lib/types';
import { AchievementsDialog } from './AchievementsDialog';
import { Trophy, Award, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/components/LanguageProvider';

interface AchievementsShelfProps {
  achievements: Achievement[];
  userAchievements: UserAchievements;
}

const SHELF_SLOTS = 6;

export function AchievementsShelf({ achievements, userAchievements }: AchievementsShelfProps) {
  const t = useTranslations();
  const unlocked = achievements.filter(a => !!a.unlockedAt);
  const total = achievements.length;
  const slots = Array.from({ length: SHELF_SLOTS }, (_, i) => unlocked[i] ?? null);

  return (
    <AchievementsDialog
      achievements={achievements}
      userAchievements={userAchievements}
      trigger={
        <button
          type="button"
          className="w-full rounded-panel border-2 border-border bg-card p-4 text-left shadow-hard-sm transition-all hover:translate-y-[1px] hover:shadow-hard-xs active:translate-y-[3px] active:shadow-none"
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wide">
            <Trophy className="h-4 w-4 text-amber" />
            <span>{t.achievements.shelfLabel} {unlocked.length}/{total}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {slots.map((achievement, i) => (
              <div
                key={achievement?.id ?? `locked-${i}`}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 border-border",
                  achievement ? "bg-accent text-accent-foreground" : "border-dashed bg-card text-muted-foreground"
                )}
              >
                {achievement ? <Award className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
              </div>
            ))}
          </div>
        </button>
      }
    />
  );
}
