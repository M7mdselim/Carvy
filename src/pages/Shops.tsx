import { useState } from 'react'
import { useShops } from '../hooks/useShops'
import { useCategories } from '../hooks/useCategories'
import ShopCard from '../components/ShopCard'

export default function Shops() {
  const { shops, loading: loadingShops } = useShops()
  const { categories, loading: loadingCategories } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const filteredShops = selectedCategory
    ? shops.filter(shop => shop.categories.includes(selectedCategory))
    : shops

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">All Shops</h1>
        <div className="flex items-center">
          <label htmlFor="category" className="mr-2 text-sm font-medium text-gray-700">
            Filter by Models:
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Models</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingShops || loadingCategories ? (
        <div className="text-center py-12">Loading shops...</div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No shops found {selectedCategory && `for ${selectedCategory}`}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  )
}