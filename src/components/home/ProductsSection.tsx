
import { useNavigate } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { Button } from '../../components/ui/button'
import { useLanguage } from '../../contexts/LanguageContext'
import ProductCard from '../ProductCard'
import { useIsMobile } from '../../hooks/use-mobile'

const ProductsSection = () => {
  const { t } = useLanguage()
  const { products, loading } = useProducts()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  // Get featured products (first 6)
  const featuredProducts = products.slice(0, 6)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{t('featuredProducts')}</h2>
        <Button 
          variant="outline" 
          onClick={() => navigate('/products')}
        >
          {t('viewAll')}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse h-80"
            >
              <div className="h-40 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded mt-auto"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductsSection
