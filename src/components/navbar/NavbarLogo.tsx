
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function NavbarLogo() {
  const { t, language } = useLanguage();
  
  return (
    <div className="flex flex-shrink-0 items-center">
      <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
        {language === 'ar' ? 'كارڤي' : t('brandName')}
      </Link>
    </div>
  );
}
