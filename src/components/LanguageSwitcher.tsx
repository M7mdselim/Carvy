
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
    const newLanguage: 'ar' | 'en' = language === 'ar' ? 'en' : 'ar';  // Correct type assignment
    changeLanguage(newLanguage); // Now passing the correct type
    localStorage.setItem('language', newLanguage); // Store the preference in localStorage
    
    // Apply always-ltr class to all navbar elements on all pages
    applyNavbarLtrStyles();
  };
  
  // Helper function to apply LTR styles to navbar
  const applyNavbarLtrStyles = () => {
    document.querySelectorAll('.navbar-container').forEach(element => {
      element.classList.add('always-ltr');
    });
  };

  // Check if a language is already saved in localStorage, otherwise set Arabic as default
  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
  
    if (!storedLanguage) {
      // If there's no stored language, default to Arabic
      const defaultLang: 'ar' = 'ar';
      changeLanguage(defaultLang);
      localStorage.setItem('language', defaultLang);
    } else {
      // Set the stored language (no need to compare with current language)
      changeLanguage(storedLanguage as 'ar' | 'en');
    }
    
    // Ensure navbar stays LTR regardless of language on ALL pages
    applyNavbarLtrStyles();
    
    // Also apply the LTR styles whenever route changes or component re-renders
    const observer = new MutationObserver(() => {
      applyNavbarLtrStyles();
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Clean up observer on component unmount
    return () => observer.disconnect();
  }, []); // ✅ Only run effect on first render

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
