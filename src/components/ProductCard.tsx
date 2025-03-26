
import { PlusIcon, MinusIcon, Trash2Icon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../types'
import { useCart } from '../hooks/useCart'
import { useLanguage } from '../contexts/LanguageContext'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const cartItem = items.find(item => item.product.id === product.id)
  const isRtl = language === 'ar'

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-[420px]">
      <div 
        className="aspect-square w-full overflow-hidden bg-gray-200 cursor-pointer"
        onClick={handleImageClick}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 h-14">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2 h-10">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{product.price.toFixed(2)} EGP</span>
          <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} ${t('inStock')}` : t('outOfStock')}
          </span>
        </div>
        
        {/* Removed compatibility section */}
        
        <div className="mt-auto pt-3">
          {product.stock > 0 && (
            cartItem ? (
              <div className="flex items-center justify-between gap-1 w-full">
                <button
                  onClick={() => updateQuantity(product.id, Math.max(0, cartItem.quantity - 1))}
                  className="flex-1 flex items-center justify-center px-2 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="text-lg font-medium text-gray-900 px-2">{cartItem.quantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="flex-1 flex items-center justify-center px-2 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeItem(product.id)}
                  className="flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200"
                  aria-label={t('remove')}
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <PlusIcon className={`h-5 w-5 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                {t('addToCart')}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
