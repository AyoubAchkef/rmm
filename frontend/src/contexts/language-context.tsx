'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [messages, setMessages] = useState<any>({});

  useEffect(() => {
    // Load messages for current language
    const loadMessages = async () => {
      try {
        const msgs = await import(`@/i18n/messages/${language}.json`);
        setMessages(msgs.default);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };
    loadMessages();
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = messages;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value === 'string' && params) {
      // Replace parameters in the string
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => str.replace(`{${paramKey}}`, paramValue),
        value
      );
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
