
import { Link } from 'react-router-dom'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import type { Product } from '../../types'
import { useLanguage } from '../../contexts/LanguageContext'

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartButtonProps {
  cartItemCount: number;
  items: CartItem[];
  total: number;
  isMobile?: boolean;
}

export default function CartButton({ cartItemCount, items, total, isMobile = false }: CartButtonProps) {
  const { t } = useLanguage();

  // If it's mobile, we don't need the dropdown
  if (isMobile) {
    return (
      <Link 
        to="/cart" 
        className="relative p-2 text-gray-600"
      >
        <ShoppingCartIcon className="h-6 w-6" />
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white ring-2 ring-white">
            {cartItemCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link 
      to="/cart/" 
      className="group relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
    >
      <div className="relative">
        <ShoppingCartIcon className="h-6 w-6" />
        {cartItemCount > 0 && (
          <div className="absolute -top-2 -right-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white ring-2 ring-white">
              {cartItemCount}
            </span>
            <div className="hidden group-hover:block absolute top-full right-0 w-64 mt-3">
              <div className="bg-white rounded-lg shadow-xl py-4 px-4 border border-gray-100 cart-dropdown">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {t('shoppingCart')}
                </div>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate">{item.product.name}</span>
                      <span className="text-gray-900">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between font-medium">
                    <span>{t('subtotal')}:</span>
                    <span className="text-indigo-600">{total.toFixed(2)}</span>
                  </div>
                </div>
                <Link
                  to="/cart"
                  className="mt-3 block w-full text-center bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  {t('cart')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
