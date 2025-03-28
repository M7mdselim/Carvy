
import { PlusIcon, MinusIcon, Trash2Icon, ImageIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../types'
import { useCart } from '../hooks/useCart'
import { useLanguage } from '../contexts/LanguageContext'
import { toast } from 'sonner'
import { useIsMobile } from '../hooks/use-mobile'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const cartItem = items.find(item => item.product.id === product.id)
  const isRtl = language === 'ar'
  const isMobile = useIsMobile()

  const handleImageClick = () => {
    navigate(`/products/${product.id}`)
  }

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error(t('outOfStock'))
      return
    }
    
    if (cartItem && cartItem.quantity >= product.stock) {
      toast.error(`${t('maxStockReached')}: ${product.stock}`)
      return
    }
    
    addItem(product)
  }

  const handleIncreaseQuantity = () => {
    if (!cartItem) return
    
    if (cartItem.quantity >= product.stock) {
      toast.error(`${t('maxStockReached')}: ${product.stock}`)
      return
    }
    
    updateQuantity(product.id, cartItem.quantity + 1)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-auto md:h-[420px]">
      <div 
        className="aspect-square w-full overflow-hidden bg-gray-200 cursor-pointer"
        onClick={handleImageClick}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ImageIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-3 md:p-4 flex flex-col flex-grow">
        <h3 className={`text-sm md:text-lg font-semibold text-gray-900 line-clamp-2 ${isMobile ? 'h-10' : 'h-14'}`}>
          {product.name}
        </h3>
        {!isMobile && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2 h-10">{product.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-gray-900`}>
            {product.price.toFixed(2)} EGP
          </span>
          {!isMobile && (
            <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} ${t('inStock')}` : t('outOfStock')}
            </span>
          )}
        </div>
        
        <div className="mt-auto pt-2 md:pt-3">
          {product.stock > 0 && (
            cartItem ? (
              <div className="flex items-center justify-between gap-1 w-full">
                <button
                  onClick={() => updateQuantity(product.id, Math.max(0, cartItem.quantity - 1))}
                  className="flex-1 flex items-center justify-center px-1 md:px-2 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  <MinusIcon className="h-3 w-3 md:h-4 md:w-4" />
                </button>
                <span className="text-sm md:text-lg font-medium text-gray-900 px-1 md:px-2">{cartItem.quantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="flex-1 flex items-center justify-center px-1 md:px-2 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  <PlusIcon className="h-3 w-3 md:h-4 md:w-4" />
                </button>
                <button
                  onClick={() => removeItem(product.id)}
                  className="flex items-center justify-center px-2 md:px-3 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200"
                  aria-label={t('remove')}
                >
                  <Trash2Icon className="h-3 w-3 md:h-4 md:w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center px-2 md:px-4 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <PlusIcon className={`h-3 w-3 md:h-5 md:w-5 ${isRtl ? 'ml-1 md:ml-2' : 'mr-1 md:mr-2'}`} />
                {t('addToCart')}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
