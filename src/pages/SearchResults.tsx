
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSearch } from '../hooks/useSearch'
import ProductCard from '../components/ProductCard'
import ShopCard from '../components/ShopCard'
import { useLanguage } from '../contexts/LanguageContext'
import { CarIcon } from 'lucide-react'

export default function SearchResults() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { products, shops, carModels, loading, error } = useSearch(query);

  const handleCarModelClick = (make: string, model: string) => {
    navigate(`/products?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">{t('searching')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  const hasResults = products.length > 0 || shops.length > 0 || carModels.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {t('searchResults')} "{query}"
      </h1>

      {!hasResults && (
        <div className="text-center text-gray-500">
          {t('noResults')} "{query}"
        </div>
      )}

      {carModels.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('carModels')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {carModels.map((carModel) => (
              <div 
                key={carModel.id}
                onClick={() => handleCarModelClick(carModel.make, carModel.model)}
                className="flex flex-col items-center p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white cursor-pointer"
              >
                <div className="rounded-full p-4 bg-indigo-100 mb-4">
                  <CarIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center">
                  {carModel.make} {carModel.model}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {carModel.yearStart}
                  {carModel.yearEnd ? ` - ${carModel.yearEnd}` : '+'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {shops.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('shops')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('products')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
