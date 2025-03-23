
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, TranslationKey } from '../locales';

interface LanguageContextProps {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
    document.body.classList.toggle('rtl', language === 'ar');
    return () => {
      document.body.classList.remove('rtl');
    };
  }, [language]);

  const t = (key: string) => {
    const lang = language as keyof typeof translations;
    return translations[lang][key as TranslationKey] || key;
  };

  const value: LanguageContextProps = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
