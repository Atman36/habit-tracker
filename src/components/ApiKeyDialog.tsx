
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

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: OpenRouterSettings) => void;
  currentSettings?: OpenRouterSettings | null;
}

const DEFAULT_MODEL_NAME = "deepseek/deepseek-chat";
const DEFAULT_SYSTEM_PROMPT = "Ты - помощник по формированию привычек. Давай краткие, мотивирующие советы на русском языке для улучшения привычек пользователя.";

const POPULAR_MODELS = [
  { value: "deepseek/deepseek-chat", label: "DeepSeek Chat (Рекомендуется)" },
  { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku" },
  { value: "anthropic/claude-3-sonnet", label: "Claude 3 Sonnet" },
  { value: "google/gemini-flash-1.5", label: "Gemini Flash 1.5" },
  { value: "mistralai/mistral-7b-instruct", label: "Mistral 7B Instruct" },
  { value: "openai/gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "meta-llama/llama-3.1-8b-instruct", label: "Llama 3.1 8B" },
  { value: "custom", label: "Другая модель..." }
];

export function ApiKeyDialog({ isOpen, onClose, onSave, currentSettings }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState(DEFAULT_MODEL_NAME);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_NAME);
  const [customModel, setCustomModel] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(currentSettings?.apiKey || '');
      const currentModel = currentSettings?.modelName || DEFAULT_MODEL_NAME;
      setModelName(currentModel);
      setSystemPrompt(currentSettings?.systemPrompt || DEFAULT_SYSTEM_PROMPT);
      
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
  }, [isOpen, currentSettings]);

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
        systemPrompt: systemPrompt.trim() || DEFAULT_SYSTEM_PROMPT
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
            Настройки OpenRouter AI
          </DialogTitle>
          <DialogDescription>
            Введите ваш API ключ и выберите модель для OpenRouter, чтобы получать персональные советы от AI.
            Ключ можно получить на сайте OpenRouter.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Ключ</Label>
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
            <Label htmlFor="model">Модель</Label>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите модель" />
              </SelectTrigger>
              <SelectContent>
                {POPULAR_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedModel === 'custom' && (
              <Input
                value={customModel}
                onChange={(e) => handleCustomModelChange(e.target.value)}
                placeholder="Введите название модели, например: anthropic/claude-3-opus"
                className="mt-2"
              />
            )}
            
            <p className="text-xs text-muted-foreground">
              Полный список моделей доступен на сайте OpenRouter. Рекомендуем DeepSeek Chat для лучшего соотношения качества и цены.
            </p>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="systemPrompt" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Системный промпт
            </Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={DEFAULT_SYSTEM_PROMPT}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Настройте поведение AI-помощника. Этот промпт определяет, как AI будет отвечать на ваши запросы о привычках.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!apiKey.trim() || (selectedModel === 'custom' ? !customModel.trim() : !selectedModel)}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
