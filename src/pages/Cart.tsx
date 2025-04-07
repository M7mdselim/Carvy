
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useIsMobile } from '../hooks/use-mobile'
import { useLanguage } from '../contexts/LanguageContext'
import { ImageIcon, Trash2, Plus, Minus } from 'lucide-react'
import { Button } from '../components/ui/button'
import { formatCurrency } from '../lib/utils'

export default function Cart() {
  const { t } = useLanguage();
  const { items, removeItem, updateQuantity, total } = useCart();
  const isMobile = useIsMobile();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('emptyCart')}</h2>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            {t('startShopping')}
          </p>
          <Link
            to="/products"
            className="mt-4 md:mt-6 inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-8">{t('shoppingCart')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          <ul className="divide-y divide-gray-200">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex flex-col sm:flex-row py-4 px-3 sm:py-6 sm:px-6">
                <Link 
                  to={`/products/${product.id}`}
                  className="flex-shrink-0 w-full sm:w-24 h-32 sm:h-24 mb-3 sm:mb-0 mx-auto sm:mx-0 border border-gray-200 rounded-md overflow-hidden"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-center object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </Link>
                <div className="sm:ml-4 flex-1 flex flex-col">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between text-base font-medium text-gray-900">
                      <h3 className="text-center sm:text-left">{product.name}</h3>
                      <p className="text-center sm:text-right sm:ml-4 mt-1 sm:mt-0">{formatCurrency(product.price * quantity)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 text-center sm:text-left">{product.category}</p>
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-end justify-between text-sm mt-3 sm:mt-0">
                    <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(product.id, Math.max(0, quantity - 1))}
                          className="h-8 w-8 rounded-full"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="px-3 py-1 text-gray-900">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="h-8 w-8 rounded-full"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(product.id)}
                        className="text-red-600 hover:text-red-500 h-8 w-8 rounded-full"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {formatCurrency(product.price)} {t('each')}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">{t('orderSummary')}</h2>
          <div className="space-y-3">
            {/* <div className="flex justify-between text-base">
              <p>{t('subtotal')}</p>
              <p>{formatCurrency(total)}</p>
            </div> */}
            <div className="flex justify-between text-lg font-semibold pt-3 border-t mt-3">
              <p>{t('total')}</p>
              <p>{formatCurrency(total)}</p>
            </div>
          </div>
          <Link
            to="/checkout"
            className="mt-6 w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {t('checkout')}
          </Link>
          <Link
            to="/products"
            className="mt-4 w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
