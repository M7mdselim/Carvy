
import { Link } from 'react-router-dom'
import type { Shop } from '../types'
import { useIsMobile } from '../hooks/use-mobile'
import { ImageIcon } from 'lucide-react'

interface ShopCardProps {
  shop: Shop
}

export default function ShopCard({ shop }: ShopCardProps) {
  const isMobile = useIsMobile()

  return (
    <Link
      to={`/shops/${shop.id}`}
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-200">
        {shop.logo ? (
          <img
            src={shop.logo}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ImageIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-1 md:mb-2">
          <h3 className="text-sm md:text-lg font-semibold text-gray-900 line-clamp-1">{shop.name}</h3>
          {!isMobile && (shop.rating ?? 0) > 0 && (
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm text-gray-600">
                {(shop.rating ?? 0).toFixed(1)} ({shop.reviewCount ?? 0})
              </span>
            </div>
          )}
        </div>
        {!isMobile && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{shop.description}</p>
        )}
        {!isMobile && shop.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 md:gap-2">
            {shop.categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
