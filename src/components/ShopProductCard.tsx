
import { PlusIcon, MinusIcon, EyeIcon, Trash2Icon, ImageIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../types'
import { useCart } from '../hooks/useCart'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../contexts/LanguageContext'
import { toast } from 'sonner'
import { useIsMobile } from '../hooks/use-mobile'

interface ShopProductCardProps {
  product: Product
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const { t, language } = useLanguage()
  const cartItem = items.find(item => item.product.id === product.id)
  const navigate = useNavigate()
  const [shopName, setShopName] = useState<string>('')
  const isRtl = language === 'ar'
  const isMobile = useIsMobile()
  const isInactive = product.status === 'inactive'

  useEffect(() => {
    const fetchShopName = async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('name')
        .eq('id', product.shopId)
        .single()

      if (!error && data) {
        setShopName(data.name)
      }
    }

    fetchShopName()
  }, [product.shopId])

  const handleImageClick = () => {
    navigate(`/products/${product.id}`)
  }

  const handleCarModelClick = (carModel: string, event: React.MouseEvent) => {
    event.stopPropagation()
    navigate(`/products/${product.id}`)
  }

  const handleAddToCart = () => {
    if (isInactive) {
      toast.error(t('outOfStock'))
      return
    }
    
    addItem(product)
  }

  const handleIncreaseQuantity = () => {
    if (!cartItem) return
    
    if (isInactive) {
      toast.error(t('outOfStock'))
      return
    }
    
    updateQuantity(product.id, cartItem.quantity + 1)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-auto md:h-[420px]">
      <div 
        className="aspect-square w-full overflow-hidden bg-gray-200 cursor-pointer relative"
        onClick={handleImageClick}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isInactive ? 'opacity-70' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ImageIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
        <button 
          className="absolute top-2 right-2 bg-white p-1.5 md:p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation()
            handleImageClick()
          }}
        >
          <EyeIcon className="h-3 w-3 md:h-4 md:w-4 text-gray-700" />
        </button>
        
        {/* Out of stock overlay */}
        {isInactive && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {t('outOfStock')}
          </div>
        )}
      </div>
      <div className="p-3 md:p-4 flex flex-col flex-grow">
        <h3 className={`text-sm md:text-lg font-semibold text-gray-900 line-clamp-2 ${isMobile ? 'h-10' : 'h-14'}`}>
          {product.name} {shopName && <span className="text-gray-600">({shopName})</span>}
        </h3>
        {!isMobile && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2 h-10">{product.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-gray-900`}>
            {product.price.toFixed(2)} EGP
          </span>
          <span className={`text-xs md:text-sm ${!isInactive ? 'text-green-600' : 'text-red-600'}`}>
            {!isInactive ? t('inStock') : t('outOfStock')}
          </span>
        </div>
        
        {!isMobile && product.compatibility && product.compatibility.length > 0 && (
          <div className="mt-2 overflow-y-auto max-h-16 scrollbar-thin scrollbar-thumb-gray-300">
            <div className="flex flex-wrap gap-1">
              {product.compatibility.map((car) => (
                <span
                  key={car}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 cursor-pointer hover:bg-indigo-100"
                  onClick={(e) => handleCarModelClick(car, e)}
                >
                  {car}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-auto pt-2 md:pt-3">
          {!isInactive ? (
            cartItem ? (
              <div className="flex items-center justify-between gap-1 md:gap-2">
                <button
                  onClick={() => updateQuantity(product.id, Math.max(0, cartItem.quantity - 1))}
                  className="flex-1 flex items-center justify-center px-2 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  <MinusIcon className="h-3 w-3 md:h-5 md:w-5" />
                </button>
                <span className="text-sm md:text-lg font-medium text-gray-900">{cartItem.quantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="flex-1 flex items-center justify-center px-2 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  <PlusIcon className="h-3 w-3 md:h-5 md:w-5" />
                </button>
                <button
                  onClick={() => removeItem(product.id)}
                  className="flex items-center justify-center px-2 md:px-4 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200"
                  aria-label={t('remove')}
                >
                  <Trash2Icon className="h-3 w-3 md:h-5 md:w-5" />
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
          ) : (
            <div className="w-full text-center py-2 text-red-600 font-medium bg-red-50 rounded-md">
              {t('outOfStock')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
