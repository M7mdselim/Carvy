
import { useNavigate } from 'react-router-dom'
import { CarIcon } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import type { Product, Shop, CarModel } from '../../types'

interface SearchResultsProps {
  searchQuery: string
  searchLoading: boolean
  searchProducts: Product[]
  searchShops: Shop[]
  searchCarModels: CarModel[]
  handleSearch: (e: React.FormEvent) => void
}

const SearchResults = ({
  searchQuery,
  searchLoading,
  searchProducts,
  searchShops,
  searchCarModels,
  handleSearch,
}: SearchResultsProps) => {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleCarModelClick = (make: string, model: string) => {
    navigate(`/products?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`)
  }

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`)
  }

  if (!searchQuery) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-2 w-full max-w-صxl mx-auto bg-white rounded-xl shadow-2xl z-[200] overflow-hidden border border-gray-200 animate-fade-in">
  {searchLoading ? (
    <div className="p-6 text-center text-gray-500 text-sm">{t('searching')}</div>
  ) : (
    <div className="max-h-[70vh] overflow-y-auto">
      {searchCarModels.length > 0 && (
        <div className="border-b">
          <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
            {t('carModels')}
          </div>
          {searchCarModels.slice(0, 3).map((carModel) => (
            <div
              key={carModel.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => handleCarModelClick(carModel.make, carModel.model)}
            >
              <div className="flex-shrink-0 rounded-full p-2 bg-indigo-100">
                <CarIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-sm">
                <div className="font-medium">
                  {carModel.make} {carModel.model}
                </div>
                <div className="text-gray-500">
                  {carModel.yearStart}
                  {carModel.yearEnd ? ` - ${carModel.yearEnd}` : ' +'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchShops.length > 0 && (
        <div className="border-b">
          <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
            {t('shops')}
          </div>
          {searchShops.slice(0, 3).map((shop) => (
            <div
              key={shop.id}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => navigate(`/shops/${shop.id}`)}
            >
              <div className="text-sm font-medium">{shop.name}</div>
              <div className="text-sm text-gray-500">{shop.description}</div>
            </div>
          ))}
        </div>
      )}

      {searchProducts.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
            {t('products')}
          </div>
          {searchProducts.slice(0, 3).map((product) => (
            <div
              key={product.id}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="text-sm font-medium">{product.name}</div>
              <div className="text-sm text-gray-500">{product.price.toFixed(2)} EGP</div>
            </div>
          ))}
        </div>
      )}

      {searchQuery &&
        (searchProducts.length > 3 ||
          searchShops.length > 3 ||
          searchCarModels.length > 3) && (
          <button
            onClick={(e) => handleSearch(e)}
            className="w-full px-4 py-3 text-center text-sm font-medium text-indigo-600 hover:bg-gray-50 transition-colors"
          >
            {t('viewAllResults')}
          </button>
        )}

      {searchQuery &&
        !searchProducts.length &&
        !searchShops.length &&
        !searchCarModels.length && (
          <div className="p-6 text-center text-sm text-gray-500">
            {t('noResults')} "{searchQuery}"
          </div>
        )}
    </div>
  )}
</div>

  )
}

export default SearchResults
