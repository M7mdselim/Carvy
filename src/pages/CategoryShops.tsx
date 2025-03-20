import { useParams } from 'react-router-dom'
import { useShopsByCategory } from '../hooks/useShopsByCategory'
import ShopCard from '../components/ShopCard'

export default function CategoryShops() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { shops, category, loading, error } = useShopsByCategory(categoryId!)

  if (loading) {
    return <div className="text-center py-12">Loading shops...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Error loading shops: {error.message}
      </div>
    )
  }

  if (!category) {
    return <div className="text-center py-12">Category not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name} Shops</h1>
      <p className="text-gray-600 mb-8">Find the best shops for {category.name}</p>
      {shops.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No shops found for this category
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  )
}