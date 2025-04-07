import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { GlobeIcon } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    // Ensure that the changeLanguage function receives a valid Language type ('en' | 'ar')
    const newLanguage: 'en' | 'ar' = language === 'en' ? 'ar' : 'en';  // Correct type assignment
    changeLanguage(newLanguage); // Now passing the correct type
    localStorage.setItem('language', newLanguage); // Store the preference in localStorage
  };

  // Check if a language is already saved in localStorage, otherwise set Arabic as default
  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (!storedLanguage) {
      changeLanguage('ar'); // Set Arabic as the default language on initial load
      localStorage.setItem('language', 'ar'); // Store Arabic in localStorage
    } else if (storedLanguage !== language) {
      changeLanguage(storedLanguage as 'en' | 'ar'); // Explicitly casting the stored language value
    }
  }, [language, changeLanguage]);

  return (
    <button
      onClick={toggleLanguage}
      className={`navbar-text flex items-center text-gray-500 hover:text-gray-700 transition ${className}`}
      aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <GlobeIcon className={`w-5 h-5 mr-1 ${language === 'ar' ? 'rotate-180' : ''} transition`} />
      <span className="text-sm font-medium">{language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
};
