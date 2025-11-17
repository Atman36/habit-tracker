'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Language, TranslationContent } from '@/lib/translations';
import { defaultLanguage, translations } from '@/lib/translations';
import useLocalStorage from '@/lib/localStorage';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useLocalStorage<Language>('app_language', defaultLanguage);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

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
  return translations[language];
}
