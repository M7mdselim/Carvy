
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useProducts } from '../../hooks/useProducts'
import { Input } from '../ui/input'
import ProductCard from '../ProductCard'
import PaginationControls from './PaginationControls'

const ProductsSection = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { products, loading: loadingProducts } = useProducts()
  
  // State for pagination
  const [currentProductPage, setCurrentProductPage] = useState(1)
  
  // Items per page constants
  const itemsPerPage = 5
  
  // State for filtering
  const [productFilter, setProductFilter] = useState('')

  // Filter and paginate products
  const filteredProducts = productFilter
    ? products.filter(product => 
        product.name.toLowerCase().includes(productFilter.toLowerCase()) ||
        product.description.toLowerCase().includes(productFilter.toLowerCase()))
    : products
    
  const totalProductPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const indexOfLastProduct = currentProductPage * itemsPerPage
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">{t('browseProducts')}</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={t('searchProducts')}
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            {t('viewAll')}
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {loadingProducts ? (
          <div className="col-span-full text-center py-12">{t('loadingProducts')}</div>
        ) : currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t('noProductsFound')}
          </div>
        )}
      </div>
      
      {/* Products Pagination */}
      <PaginationControls 
        currentPage={currentProductPage}
        totalPages={totalProductPages}
        setPage={setCurrentProductPage}
      />
    </div>
  )
}

export default ProductsSection
