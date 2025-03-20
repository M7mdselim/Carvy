import { useSearchParams } from 'react-router-dom'
import { useSearch } from '../hooks/useSearch'
import ProductCard from '../components/ProductCard'
import ShopCard from '../components/ShopCard'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { products, shops, loading, error } = useSearch(query)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Searching...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">Error: {error.message}</div>
      </div>
    )
  }

  const hasResults = products.length > 0 || shops.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Search Results for "{query}"
      </h1>

      {!hasResults && (
        <div className="text-center text-gray-500">
          No results found for "{query}"
        </div>
      )}

      {shops.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}