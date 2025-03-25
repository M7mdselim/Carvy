
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
    
    // Check if the key exists in the current language's translations
    if (translations[lang] && key in translations[lang]) {
      return translations[lang][key as TranslationKey] || key;
    }
    
    // Fallback to English if the key doesn't exist in the current language
    if (lang !== 'en' && translations['en'] && key in translations['en']) {
      return translations['en'][key as TranslationKey];
    }
    
    // Return the key itself as fallback if not found in any language
    return key;
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
