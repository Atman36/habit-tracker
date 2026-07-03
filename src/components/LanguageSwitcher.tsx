'use client';

import { Languages } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage, useTranslations } from '@/components/LanguageProvider';
import type { Language } from '@/lib/translations';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const t = useTranslations();

  const handleChange = (value: string) => {
    setLanguage((value as Language) || 'en');
  };

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger className={className} aria-label={t.languageSwitcher.label}>
        <SelectValue>
          <div className="flex items-center gap-1.5">
            <Languages className="h-4 w-4" />
            <span className="text-sm font-medium capitalize">
              {language === 'en' ? t.languageSwitcher.english : t.languageSwitcher.russian}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t.languageSwitcher.english}</SelectItem>
        <SelectItem value="ru">{t.languageSwitcher.russian}</SelectItem>
      </SelectContent>
    </Select>
  );
}
