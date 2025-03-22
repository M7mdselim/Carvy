
import { useLanguage } from '../../contexts/LanguageContext';

interface LogoutButtonProps {
  onLogout: () => Promise<void>;
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
  const { t } = useLanguage();
  
  return (
    <button
      onClick={onLogout}
      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition"
    >
      {t('logout')}
    </button>
  );
}
