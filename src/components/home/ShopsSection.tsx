
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useShops } from '../../hooks/useShops'
import { Input } from '../ui/input'
import ShopCard from '../ShopCard'
import PaginationControls from './PaginationControls'

const ShopsSection = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { shops, loading: loadingShops } = useShops()
  
  // State for pagination
  const [currentShopPage, setCurrentShopPage] = useState(1)
  
  // Items per page constants
  const itemsPerPage = 5
  
  // State for filtering
  const [shopFilter, setShopFilter] = useState('')

  // Filter and paginate shops
  const filteredShops = shopFilter
    ? shops.filter(shop => 
        shop.name.toLowerCase().includes(shopFilter.toLowerCase()) ||
        shop.description.toLowerCase().includes(shopFilter.toLowerCase()))
    : shops
    
  const totalShopPages = Math.ceil(filteredShops.length / itemsPerPage)
  const indexOfLastShop = currentShopPage * itemsPerPage
  const indexOfFirstShop = indexOfLastShop - itemsPerPage
  const currentShops = filteredShops.slice(indexOfFirstShop, indexOfLastShop)

  return (
    <div className="bg-white py-16 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">{t('browseShops')}</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder={t('searchShops')}
                value={shopFilter}
                onChange={(e) => setShopFilter(e.target.value)}
                className="pl-10 pr-4 py-2"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => navigate('/shops')}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              {t('viewAll')}
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {loadingShops ? (
            <div className="col-span-full text-center py-12">{t('loadingShops')}</div>
          ) : currentShops.length > 0 ? (
            currentShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              {t('noShopsFound')}
            </div>
          )}
        </div>
        
        {/* Shops Pagination */}
        <PaginationControls 
          currentPage={currentShopPage}
          totalPages={totalShopPages}
          setPage={setCurrentShopPage}
        />
      </div>
    </div>
  )
}

export default ShopsSection
