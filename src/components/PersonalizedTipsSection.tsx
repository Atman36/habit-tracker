
'use client';

import { useState } from 'react';
import type { Habit, ApiError, OpenRouterSettings } from '@/lib/types';
import { fetchPersonalizedHabitTipsAction, type OpenRouterActionSettings } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lightbulb, AlertTriangle, Settings2, Sparkles } from 'lucide-react';
import { useTranslations } from '@/components/LanguageProvider';

interface PersonalizedTipsSectionProps {
  habits: Habit[];
  openRouterSettings: OpenRouterSettings | null;
  onOpenSettingsDialog: () => void;
}

export function PersonalizedTipsSection({ habits, openRouterSettings, onOpenSettingsDialog }: PersonalizedTipsSectionProps) {
  const t = useTranslations();
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchTips = async () => {
    setIsLoading(true);
    setError(null);
    setTips([]);

    if (!openRouterSettings?.apiKey) {
      setError(t.personalizedTips.missingApiKey);
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
    <Card className="mt-8 bg-[#F0EBFF] dark:bg-muted">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 font-display text-xs uppercase tracking-wide">
            <Lightbulb className="h-5 w-5 text-secondary" />
            {t.personalizedTips.title}
          </CardTitle>
          <span className="rounded-full border-2 border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
            openrouter
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            onClick={handleFetchTips}
            disabled={isLoading || habits.length === 0}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.personalizedTips.fetching}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t.personalizedTips.fetchButton}
              </>
            )}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{t.personalizedTips.settingsLabel}</span>
            {openRouterSettings?.apiKey ? (
              <Button variant="outline" size="icon" onClick={onOpenSettingsDialog} aria-label={t.personalizedTips.configure}>
                <Settings2 className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onOpenSettingsDialog}>
                {t.personalizedTips.configure}
              </Button>
            )}
          </div>
        </div>

        {habits.length === 0 && !isLoading && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t.personalizedTips.noHabits}
          </p>
        )}

        {isLoading && (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5 opacity-70" />
            <Skeleton className="h-4 w-3/5 opacity-50" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t.personalizedTips.errorTitle}</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={onOpenSettingsDialog}>
                <Settings2 className="h-4 w-4" />
                {t.personalizedTips.configure}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {tips.length > 0 && (
          <div className="mt-6 space-y-2">
            {tips.map((tip, index) => (
              <div key={index} className="flex gap-3 rounded-panel border-2 border-border bg-card p-3">
                <span className="shrink-0 font-mono font-bold text-secondary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="font-sans text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
