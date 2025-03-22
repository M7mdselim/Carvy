
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function NavbarLogo() {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-shrink-0 items-center">
      <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
        {t('brandName')}
      </Link>
    </div>
  );
}
