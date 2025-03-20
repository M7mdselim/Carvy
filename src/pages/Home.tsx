
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import CategoryCard from '../components/CategoryCard'
import ShopCard from '../components/ShopCard'
import ProductCard from '../components/ProductCard'
import { useCategories } from '../hooks/useCategories'
import { useShops } from '../hooks/useShops'
import { useProducts } from '../hooks/useProducts'
import { useSearch } from '../hooks/useSearch'

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { products: searchProducts, shops: searchShops, loading: searchLoading } = useSearch(searchQuery)
  const { categories, loading: loadingCategories } = useCategories()
  const { shops, loading: loadingShops } = useShops()
  const { products, loading: loadingProducts } = useProducts()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="relative isolate">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Find the Perfect Parts for Your Car in Egypt
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Browse thousands of auto parts from trusted sellers worldwide
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
        </div>
      </div>

      {/* Models Section with Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for parts, shops, brands, or car models..."
              className="w-full rounded-full border-2 border-indigo-200 pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-lg text-lg"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-indigo-400" />
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-10">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : (
                  <>
                    {searchShops.length > 0 && (
                      <div className="border-b">
                        <div className="p-2 bg-gray-50 text-sm font-medium text-gray-700">
                          Shops
                        </div>
                        {searchShops.slice(0, 3).map(shop => (
                          <div
                            key={shop.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/shops/${shop.id}`)}
                          >
                            <div className="font-medium">{shop.name}</div>
                            <div className="text-sm text-gray-500">{shop.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchProducts.length > 0 && (
                      <div>
                        <div className="p-2 bg-gray-50 text-sm font-medium text-gray-700">
                          Products
                        </div>
                        {searchProducts.slice(0, 3).map(product => (
                          <div
                            key={product.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/shops/${product.shopId}?product=${product.id}`)}
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.price.toFixed(2)} EGP</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchQuery && (searchProducts.length > 3 || searchShops.length > 3) && (
                      <button
                        onClick={handleSearch}
                        className="w-full p-3 text-center text-sm text-indigo-600 hover:bg-gray-50"
                      >
                        View all results
                      </button>
                    )}
                    {searchQuery && !searchProducts.length && !searchShops.length && (
                      <div className="p-4 text-center text-gray-500">
                        No results found
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </form>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse Models</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {loadingCategories ? (
            <div className="col-span-full text-center py-12">Loading models...</div>
          ) : (
            categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          )}
        </div>
      </div>

      {/* Featured Shops Section */}
      <div className="bg-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Shops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingShops ? (
              <div className="col-span-full text-center py-12">Loading shops...</div>
            ) : (
              shops.slice(0, 6).map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingProducts ? (
            <div className="col-span-full text-center py-12">Loading products...</div>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
