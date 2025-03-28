
import { useLanguage } from '../contexts/LanguageContext';
import { GlobeIcon } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    changeLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`navbar-text flex items-center text-gray-500 hover:text-gray-700 transition ${className}`}
      aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <GlobeIcon className="w-5 h-5 mr-1 no-flip" />
      <span className="text-sm font-medium">{language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
};
