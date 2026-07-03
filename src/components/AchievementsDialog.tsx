'use client';

import { useState } from 'react';
import type { Achievement, UserAchievements } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Award, Crown, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementsDialogProps {
  achievements: Achievement[];
  userAchievements: UserAchievements;
  trigger?: React.ReactNode;
}

const RARITY_COLORS: Record<Achievement['rarity'], string> = {
  common: 'bg-card text-foreground',
  rare: 'bg-accent text-accent-foreground',
  epic: 'bg-secondary text-secondary-foreground',
  legendary: 'bg-amber text-foreground'
};

const RARITY_ICONS = {
  common: Star,
  rare: Award,
  epic: Trophy,
  legendary: Crown
};

const RARITY_LABELS = {
  common: 'Обычное',
  rare: 'Редкое',
  epic: 'Эпическое',
  legendary: 'Легендарное'
};

const FILTER_TRIGGER_CLASS = 'rounded-full border-2 border-transparent font-mono text-[11px] uppercase tracking-[0.06em] data-[state=active]:border-border';

function AchievementCard({ achievement, isUnlocked }: { achievement: Achievement; isUnlocked: boolean }) {
  const RarityIcon = RARITY_ICONS[achievement.rarity];
  const progressPercentage = achievement.maxProgress
    ? Math.round(((achievement.progress || 0) / achievement.maxProgress) * 100)
    : 0;
  // Deterministic slight tilt per achievement, in the -3..3deg range used for section badges elsewhere.
  const rotationDeg = (achievement.id.charCodeAt(0) % 7) - 3;

  return (
    <Card className={cn(
      "rounded-panel border-2 bg-card shadow-hard-sm",
      !isUnlocked && "border-dashed"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Иконка значка */}
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-border",
              isUnlocked ? RARITY_COLORS[achievement.rarity] : "bg-muted text-muted-foreground grayscale"
            )}
            style={{ transform: `rotate(${rotationDeg}deg)` }}
          >
            {isUnlocked ? <RarityIcon className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <CardTitle className={cn(
              "font-sans text-base font-bold leading-tight",
              isUnlocked ? "text-foreground" : "text-muted-foreground"
            )}>
              {achievement.name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge
                variant="outline"
                className={cn("text-[9px] px-2 py-0.5", RARITY_COLORS[achievement.rarity])}
              >
                {RARITY_LABELS[achievement.rarity]}
              </Badge>
              {achievement.category && (
                <Badge variant="outline" className="text-[9px] px-2 py-0.5 text-muted-foreground">
                  {achievement.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className={cn(
          "text-xs mb-3",
          !isUnlocked && "text-muted-foreground"
        )}>
          {achievement.description}
        </CardDescription>

        {/* Прогресс */}
        {!isUnlocked && achievement.maxProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Прогресс</span>
              <span className="font-mono text-[11px]">
                {achievement.progress || 0} / {achievement.maxProgress}
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2"
            />
          </div>
        )}

        {/* Дата получения */}
        {isUnlocked && achievement.unlockedAt && (
          <div className="font-mono text-[10px] text-muted-foreground mt-2">
            Получено: {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UserStats({ userAchievements }: { userAchievements: UserAchievements }) {
  const unlockedCount = userAchievements.unlockedAchievements.length;
  const rarityStats = userAchievements.unlockedAchievements.reduce((acc, achievement) => {
    acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="rounded-panel border-2 border-border bg-secondary p-4 text-center shadow-hard-sm text-secondary-foreground">
        <div className="font-display text-2xl font-bold">{userAchievements.level}</div>
        <div className="text-sm">Уровень</div>
      </div>

      <div className="rounded-panel border-2 border-border bg-card p-4 text-center shadow-hard-sm">
        <div className="font-display text-2xl font-bold">{userAchievements.totalPoints}</div>
        <div className="text-sm text-muted-foreground">Очки</div>
      </div>

      <div className="rounded-panel border-2 border-border bg-card p-4 text-center shadow-hard-sm">
        <div className="font-display text-2xl font-bold">{unlockedCount}</div>
        <div className="text-sm text-muted-foreground">Значки</div>
      </div>

      <div className="rounded-panel border-2 border-border bg-amber p-4 text-center shadow-hard-sm text-foreground">
        <div className="font-display text-2xl font-bold">{rarityStats.legendary || 0}</div>
        <div className="text-sm">Легендарные</div>
      </div>
    </div>
  );
}

export function AchievementsDialog({ achievements, userAchievements, trigger }: AchievementsDialogProps) {
  const [open, setOpen] = useState(false);

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  // Группировка по категориям
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    const category = achievement.category || 'Прочее';
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Trophy className="h-4 w-4" />
      Достижения ({unlockedAchievements.length})
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="max-w-[760px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display uppercase flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Достижения и значки
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto">
          <UserStats userAchievements={userAchievements} />

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className={FILTER_TRIGGER_CLASS}>Все</TabsTrigger>
              <TabsTrigger value="unlocked" className={FILTER_TRIGGER_CLASS}>Получены</TabsTrigger>
              <TabsTrigger value="locked" className={FILTER_TRIGGER_CLASS}>В прогрессе</TabsTrigger>
              <TabsTrigger value="categories" className={FILTER_TRIGGER_CLASS}>По категориям</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={!!achievement.unlockedAt}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="unlocked" className="space-y-4">
              {unlockedAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unlockedAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>У вас пока нет достижений</p>
                  <p className="text-sm">Продолжайте выполнять привычки, чтобы получить первые значки!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="locked" className="space-y-4">
              {lockedAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lockedAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Все достижения получены!</p>
                  <p className="text-sm">Поздравляем с невероятным результатом!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryAchievements.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={!!achievement.unlockedAt}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
