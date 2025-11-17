
'use client';

import { useState } from 'react';
import type { Habit, ApiError, OpenRouterSettings } from '@/lib/types';
import { fetchPersonalizedHabitTipsAction, type OpenRouterActionSettings } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lightbulb, AlertTriangle, Settings2 } from 'lucide-react';

interface PersonalizedTipsSectionProps {
  habits: Habit[];
  openRouterSettings: OpenRouterSettings | null;
  onOpenSettingsDialog: () => void;
}

export function PersonalizedTipsSection({ habits, openRouterSettings, onOpenSettingsDialog }: PersonalizedTipsSectionProps) {
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchTips = async () => {
    setIsLoading(true);
    setError(null);
    setTips([]);

    if (!openRouterSettings?.apiKey) {
      setError("API ключ OpenRouter не настроен. Пожалуйста, добавьте его и выберите модель.");
      onOpenSettingsDialog();
      setIsLoading(false);
      return;
    }

    const settingsForAction: OpenRouterActionSettings = {
        apiKey: openRouterSettings.apiKey,
        modelName: openRouterSettings.modelName || undefined, // Pass modelName if set
        systemPrompt: openRouterSettings.systemPrompt || undefined, // Pass systemPrompt if set
    };

    const result = await fetchPersonalizedHabitTipsAction(habits, settingsForAction);
    
    if ('error' in result) {
      const apiError = result as ApiError;
      setError(apiError.error);
      if (apiError.code === 'API_KEY_INVALID' || apiError.code === 'API_KEY_MISSING' || apiError.code === 'MODEL_NAME_MISSING') {
        onOpenSettingsDialog(); 
      }
    } else {
      setTips(result.tips);
    }
    setIsLoading(false);
  };

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          Персональные советы
        </CardTitle>
        <CardDescription>
          Получите советы от AI-помощника, чтобы улучшить ваши привычки и достигать целей эффективнее.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button onClick={handleFetchTips} disabled={isLoading || habits.length === 0} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Получение советов...
              </>
            ) : (
              'Получить советы'
            )}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Настройки OpenRouter:</span>
            {openRouterSettings?.apiKey ? (
              <Button variant="ghost" size="icon" onClick={onOpenSettingsDialog} aria-label="Настройки OpenRouter">
                <Settings2 className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onOpenSettingsDialog}>
                Настроить
              </Button>
            )}
          </div>
        </div>

        {habits.length === 0 && !isLoading && (
          <p className="mt-4 text-sm text-muted-foreground">
            Добавьте хотя бы одну привычку, чтобы получить персональные советы.
          </p>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {tips.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-semibold">Ваши персональные советы:</h3>
            <ul className="list-disc list-inside space-y-2 pl-2">
              {tips.map((tip, index) => (
                <li key={index} className="text-sm leading-relaxed">{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
