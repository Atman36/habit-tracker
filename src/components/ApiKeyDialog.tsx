
'use client';

import { useState, useEffect } from 'react';
import type { OpenRouterSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KeyRound, Settings, Brain } from 'lucide-react';
import { useTranslations } from '@/components/LanguageProvider';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: OpenRouterSettings) => void;
  currentSettings?: OpenRouterSettings | null;
}

const DEFAULT_MODEL_NAME = "deepseek/deepseek-chat";

const POPULAR_MODELS = [
  { value: "deepseek/deepseek-chat", labelKey: 'deepseek' },
  { value: "anthropic/claude-3-haiku", labelKey: 'claudeHaiku' },
  { value: "anthropic/claude-3-sonnet", labelKey: 'claudeSonnet' },
  { value: "google/gemini-flash-1.5", labelKey: 'gemini' },
  { value: "mistralai/mistral-7b-instruct", labelKey: 'mistral' },
  { value: "openai/gpt-3.5-turbo", labelKey: 'gpt35' },
  { value: "openai/gpt-4o-mini", labelKey: 'gpt4o' },
  { value: "meta-llama/llama-3.1-8b-instruct", labelKey: 'llama' },
  { value: "custom", labelKey: 'custom' }
] as const;

export function ApiKeyDialog({ isOpen, onClose, onSave, currentSettings }: ApiKeyDialogProps) {
  const t = useTranslations();
  const defaultPrompt = t.apiDialog.defaultSystemPrompt;
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState(DEFAULT_MODEL_NAME);
  const [systemPrompt, setSystemPrompt] = useState(defaultPrompt);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_NAME);
  const [customModel, setCustomModel] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(currentSettings?.apiKey || '');
      const currentModel = currentSettings?.modelName || DEFAULT_MODEL_NAME;
      setModelName(currentModel);
      setSystemPrompt(currentSettings?.systemPrompt || defaultPrompt);
      
      // Check if current model is in popular models list
      const isPopularModel = POPULAR_MODELS.some(model => model.value === currentModel);
      if (isPopularModel) {
        setSelectedModel(currentModel);
        setCustomModel('');
      } else {
        setSelectedModel('custom');
        setCustomModel(currentModel);
      }
    }
  }, [isOpen, currentSettings, defaultPrompt]);

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    if (value !== 'custom') {
      setModelName(value);
      setCustomModel('');
    }
  };

  const handleCustomModelChange = (value: string) => {
    setCustomModel(value);
    setModelName(value);
  };

  const handleSave = () => {
    const finalModelName = selectedModel === 'custom' ? customModel.trim() : selectedModel;
    if (apiKey.trim() && finalModelName) {
      onSave({
        apiKey: apiKey.trim(),
        modelName: finalModelName,
        systemPrompt: systemPrompt.trim() || defaultPrompt
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            {t.apiDialog.title}
          </DialogTitle>
          <DialogDescription>
            {t.apiDialog.description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">{t.apiDialog.apiKeyLabel}</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pl-10"
                placeholder="sk-or-..."
              />
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">{t.apiDialog.modelLabel}</Label>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue placeholder={t.apiDialog.selectPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {POPULAR_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {t.apiDialog.models[model.labelKey]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedModel === 'custom' && (
              <Input
                value={customModel}
                onChange={(e) => handleCustomModelChange(e.target.value)}
                placeholder={t.apiDialog.customModelPlaceholder}
                className="mt-2"
              />
            )}

            <p className="text-xs text-muted-foreground">
              {t.apiDialog.modelHelper}
            </p>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              {t.apiDialog.systemPromptLabel}
            </Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={defaultPrompt}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              {t.apiDialog.systemPromptHelper}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t.apiDialog.cancel}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!apiKey.trim() || (selectedModel === 'custom' ? !customModel.trim() : !selectedModel)}
          >
            {t.apiDialog.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
