
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function NavbarLogo() {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-shrink-0 items-center">
      <Link to="/" className="flex items-center">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
          <rect width="40" height="40" rx="8" fill="url(#paint0_linear)" />
          <path d="M10 25C10 22.2386 12.2386 20 15 20H25C27.7614 20 30 22.2386 30 25V28C30 29.1046 29.1046 30 28 30H12C10.8954 30 10 29.1046 10 28V25Z" fill="white"/>
          <circle cx="15" cy="25" r="2" fill="#3B82F6"/>
          <circle cx="25" cy="25" r="2" fill="#3B82F6"/>
          <path d="M11 18L15 10H25L29 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <defs>
            <linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6"/>
              <stop offset="1" stopColor="#1E40AF"/>
            </linearGradient>
          </defs>
        </svg>
        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
          {t('brandName')}
        </span>
      </Link>
    </div>
  );
}
