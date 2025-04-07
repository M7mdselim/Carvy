
import { useNavigate } from 'react-router-dom'
import { useShops } from '../../hooks/useShops'
import { Button } from '../../components/ui/button'
import { useLanguage } from '../../contexts/LanguageContext'
import ShopCard from '../ShopCard'
import { useIsMobile } from '../../hooks/use-mobile'
import { ChevronRight } from 'lucide-react'

const ShopsSection = () => {
  const { t } = useLanguage()
  const { shops, loading } = useShops()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  // Get featured shops (first 6)
  const featuredShops = shops.slice(0, 6)

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-3xl font-bold text-gray-900">{t('featuredShops')}</h2>
            {/* <p className="mt-2 text-lg text-gray-600">{t('discoverTopShops')}</p> */}
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/shops')}
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
                className="bg-gray-100 rounded-lg animate-pulse h-64"
              >
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {featuredShops.map(shop => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopsSection
