'use client';

import { createContext, useContext, useMemo, useEffect, useState } from 'react';
import type { Language, TranslationContent } from '@/lib/translations';
import { defaultLanguage, translations } from '@/lib/translations';
import useLocalStorage from '@/lib/localStorage';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const isValidLanguage = (value: string): value is Language =>
  Object.prototype.hasOwnProperty.call(translations, value);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useLocalStorage<Language>('app_language', defaultLanguage);
  const resolvedLanguage = isValidLanguage(language as string) ? language : defaultLanguage;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isValidLanguage(language as string)) {
      setLanguage(defaultLanguage);
    }
  }, [mounted, language, setLanguage]);

  const value = useMemo(
    () => ({ language: mounted ? resolvedLanguage : defaultLanguage, setLanguage }),
    [mounted, resolvedLanguage, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslations(): TranslationContent {
  const { language } = useLanguage();
  const validLanguage = isValidLanguage(language as string) ? language : defaultLanguage;
  return translations[validLanguage] || translations[defaultLanguage];
}
