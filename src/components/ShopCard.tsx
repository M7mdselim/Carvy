import { Link } from 'react-router-dom'
import type { Shop } from '../types'

interface ShopCardProps {
  shop: Shop
}

export default function ShopCard({ shop }: ShopCardProps) {
  return (
    <Link
      to={`/shops/${shop.id}`}
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-200">
        <img
          src={shop.logo}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
          {(shop.rating ?? 0) > 0 && (
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm text-gray-600">
                {(shop.rating ?? 0).toFixed(1)} ({shop.reviewCount ?? 0})
              </span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-3">{shop.description}</p>
        <div className="flex flex-wrap gap-2">
          {shop.categories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}