
import { Link } from 'react-router-dom'
import type { Category } from '../types'

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/products?category=${encodeURIComponent(category.name)}`}
      className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={category.icon}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
      </div>
    </Link>
  )
}
