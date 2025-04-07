
import { useNavigate } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { Button } from '../../components/ui/button'
import { useLanguage } from '../../contexts/LanguageContext'
import ProductCard from '../ProductCard'
import { useIsMobile } from '../../hooks/use-mobile'
import { ChevronRight } from 'lucide-react'

const ProductsSection = () => {
  const { t } = useLanguage()
  const { products, loading } = useProducts()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  // Get featured products (first 6)
  const featuredProducts = products.slice(0, 6)

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-3xl font-bold text-gray-900">{t('featuredProducts')}</h2>
            {/* <p className="mt-2 text-lg text-gray-600">{t('topSellingParts')}</p> */}
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/products')}
            className="flex items-center justify-center self-start sm:self-center"
          >
            {t('viewAll')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg animate-pulse h-96"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsSection
