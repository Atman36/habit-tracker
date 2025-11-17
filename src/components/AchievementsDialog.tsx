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

const RARITY_COLORS = {
  common: 'bg-gray-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-500'
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

function AchievementCard({ achievement, isUnlocked }: { achievement: Achievement; isUnlocked: boolean }) {
  const RarityIcon = RARITY_ICONS[achievement.rarity];
  const progressPercentage = achievement.maxProgress 
    ? Math.round(((achievement.progress || 0) / achievement.maxProgress) * 100)
    : 0;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 hover:shadow-md",
      isUnlocked ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-gray-50/50"
    )}>
      {/* Значок разблокировки */}
      <div className="absolute top-2 right-2">
        {isUnlocked ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <Lock className="h-5 w-5 text-gray-400" />
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Иконка значка */}
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            isUnlocked ? RARITY_COLORS[achievement.rarity] : "bg-gray-300",
            isUnlocked ? "text-white" : "text-gray-500"
          )}>
            <RarityIcon className="h-6 w-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle className={cn(
              "text-lg leading-tight",
              isUnlocked ? "text-foreground" : "text-muted-foreground"
            )}>
              {achievement.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  isUnlocked ? RARITY_COLORS[achievement.rarity] : "bg-gray-300",
                  isUnlocked ? "text-white" : "text-gray-600"
                )}
              >
                {RARITY_LABELS[achievement.rarity]}
              </Badge>
              {achievement.category && (
                <Badge variant="outline" className="text-xs">
                  {achievement.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className={cn(
          "text-sm mb-3",
          isUnlocked ? "text-muted-foreground" : "text-gray-500"
        )}>
          {achievement.description}
        </CardDescription>

        {/* Прогресс */}
        {!isUnlocked && achievement.maxProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Прогресс</span>
              <span className="font-medium">
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
          <div className="text-xs text-muted-foreground mt-2">
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{userAchievements.level}</div>
          <div className="text-sm text-muted-foreground">Уровень</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{userAchievements.totalPoints}</div>
          <div className="text-sm text-muted-foreground">Очки</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{unlockedCount}</div>
          <div className="text-sm text-muted-foreground">Достижения</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-500">{rarityStats.legendary || 0}</div>
          <div className="text-sm text-muted-foreground">Легендарные</div>
        </CardContent>
      </Card>
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
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Достижения и значки
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto">
          <UserStats userAchievements={userAchievements} />
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="unlocked">Получены</TabsTrigger>
              <TabsTrigger value="locked">В прогрессе</TabsTrigger>
              <TabsTrigger value="categories">По категориям</TabsTrigger>
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