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

  if (!searchQuery) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-[200]">
      {searchLoading ? (
        <div className="p-4 text-center text-gray-500">{t('searching')}</div>
      ) : (
        <>
          {searchCarModels.length > 0 && (
            <div className="border-b">
              <div className="p-2 bg-gray-50 text-sm font-medium text-gray-700">
                {t('carModels')}
              </div>
              {searchCarModels.slice(0, 3).map(carModel => (
                <div
                  key={carModel.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => handleCarModelClick(carModel.make, carModel.model)}
                >
                  <div className="mr-3 rounded-full p-2 bg-indigo-100">
                    <CarIcon className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium">{carModel.make} {carModel.model}</div>
                    <div className="text-sm text-gray-500">
                      {carModel.yearStart}{carModel.yearEnd ? ` - ${carModel.yearEnd}` : '+'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchShops.length > 0 && (
            <div className="border-b">
              <div className="p-2 bg-gray-50 text-sm font-medium text-gray-700">
                {t('shops')}
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
                {t('products')}
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
          {searchQuery && (searchProducts.length > 3 || searchShops.length > 3 || searchCarModels.length > 3) && (
            <button
              onClick={handleSearch}
              className="w-full p-3 text-center text-sm text-indigo-600 hover:bg-gray-50"
            >
              {t('viewAllResults')}
            </button>
          )}
          {searchQuery && !searchProducts.length && !searchShops.length && !searchCarModels.length && (
            <div className="p-4 text-center text-gray-500">
              {t('noResults')} "{searchQuery}"
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SearchResults
