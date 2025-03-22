
import { Link } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AuthButtons() {
  const { t, language } = useLanguage();
  
  return (
    <div className="flex items-center space-x-4">
      <Link
        to="/login"
        className="text-gray-500 hover:text-gray-900 font-medium transition-colors duration-200"
      >
        {t('signIn')}
      </Link>
      <Link
        to="/register"
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        {t('createAccount')}
      </Link>
    </div>
  )
}
