
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { translations, TranslationKey } from '../locales';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  t: (key: TranslationKey | string) => string;
  changeLanguage: (language: Language) => void;
}

const defaultValue: LanguageContextType = {
  language: 'en',
  t: (key: TranslationKey | string) => key.toString(),
  changeLanguage: () => {},
};

const LanguageContext = createContext<LanguageContextType>(defaultValue);

// Hook to use language context
export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Try to get stored language preference or default to English
  const getInitialLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'en';
  };

  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  // Apply RTL direction when language is Arabic
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('language', language);

    // Apply RTL-specific CSS
    if (language === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language]);

  // Translation function
  const t = (key: TranslationKey | string): string => {
    if (typeof key === 'string') {
      // Handle string keys - attempt to use as translation key or return as-is
      return translations[language][key as keyof typeof translations[typeof language]] || key;
    }
    // Handle keys from the TranslationKey type
    return translations[language][key] || String(key);
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Export for convenience
export default LanguageContext;
