
import { ShoppingBagIcon, CreditCardIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { NavigateFunction } from 'react-router-dom';

interface QuickActionsProps {
  navigate: NavigateFunction;
}

export function QuickActions({ navigate }: QuickActionsProps) {
  const { t } = useLanguage();
  
  return (
    <div className="py-4">
      <h2 className="text-lg font-medium text-gray-900">{t('quickActions')}</h2>
      <div className="mt-4 space-y-2">
        <button 
          onClick={() => navigate('/cart')}
          className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition"
        >
          <div className="flex items-center">
            <ShoppingBagIcon className="h-5 w-5 text-gray-500" />
            <span className="ml-3 text-gray-900">{t('myCart')}</span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
        </button>
        
        <button 
          onClick={() => navigate('/checkout')}
          className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition"
        >
          <div className="flex items-center">
            <CreditCardIcon className="h-5 w-5 text-gray-500" />
            <span className="ml-3 text-gray-900">{t('checkout')}</span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
        </button>
        
        <button 
          onClick={() => navigate('/saved-addresses')}
          className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition"
        >
          <div className="flex items-center">
            <MapPinIcon className="h-5 w-5 text-gray-500" />
            <span className="ml-3 text-gray-900">{t('savedAddresses')}</span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
