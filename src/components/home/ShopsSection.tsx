
import { useNavigate } from 'react-router-dom'
import { useShops } from '../../hooks/useShops'
import { Button } from '../../components/ui/button'
import { useLanguage } from '../../contexts/LanguageContext'
import ShopCard from '../ShopCard'
import { useIsMobile } from '../../hooks/use-mobile'

const ShopsSection = () => {
  const { t } = useLanguage()
  const { shops, loading } = useShops()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  // Get featured shops (first 6)
  const featuredShops = shops.slice(0, 6)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{t('featuredShops')}</h2>
        <Button 
          variant="outline"
          onClick={() => navigate('/shops')}
        >
          {t('viewAll')}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse h-64"
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {featuredShops.map(shop => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ShopsSection
