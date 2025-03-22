
import { PlusIcon, MinusIcon, EyeIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../types'
import { useCart } from '../hooks/useCart'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../contexts/LanguageContext'

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

  useEffect(() => {
    // Fetch shop name
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
    
    // Extract model details from the compatibility string
    // This is a simplified approach - in a real implementation, you would need to 
    // store the actual car model IDs or extract them from the database
    const regex = /(\w+)\s+(\w+)\s+\((\d+)(?:-(\d+))?\)/
    const match = carModel.match(regex)
    
    if (match) {
      // For demo purposes, navigate to a placeholder model ID
      // In a real implementation, you would need the actual model ID
      navigate(`/models/placeholder-model-id`)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div 
        className="aspect-square w-full overflow-hidden bg-gray-200 cursor-pointer relative"
        onClick={handleImageClick}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button 
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation()
            handleImageClick()
          }}
        >
          <EyeIcon className="h-4 w-4 text-gray-700" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {product.name} {shopName && <span className="text-gray-600">({shopName})</span>}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{product.price.toFixed(2)} EGP</span>
          <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} ${t('inStock')}` : t('outOfStock')}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
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
        <div className="mt-4">
          {product.stock > 0 && (
            cartItem ? (
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => updateQuantity(product.id, Math.max(0, cartItem.quantity - 1))}
                  className="flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  <MinusIcon className="h-5 w-5" />
                </button>
                <span className="text-lg font-medium text-gray-900">{cartItem.quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                  className="flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => removeItem(product.id)}
                  className="flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                >
                  {t('remove')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => addItem(product)}
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
