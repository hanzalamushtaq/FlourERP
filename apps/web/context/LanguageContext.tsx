'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ur' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isUrdu: boolean;
  t: (urText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'flour_erp_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ur');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (savedLang === 'ur' || savedLang === 'en') {
        setLanguageState(savedLang);
      }
    } catch {
      // Ignore localStorage errors (e.g. during SSR or in private mode)
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      if (language === 'ur') {
        document.documentElement.classList.add('urdu-mode');
        document.body.classList.add('urdu-mode', 'dashboard-nastaleeq-scope');
      } else {
        document.documentElement.classList.remove('urdu-mode');
        document.body.classList.remove('urdu-mode', 'dashboard-nastaleeq-scope');
      }
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ur' ? 'en' : 'ur');
  };

  const t = (urText: string, enText: string): string => {
    return language === 'ur' ? urText : enText;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isUrdu: language === 'ur',
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    return {
      language: 'ur',
      setLanguage: () => {},
      toggleLanguage: () => {},
      isUrdu: true,
      t: (urText: string) => urText,
    };
  }
  return context;
};
