
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useCategories } from '../../hooks/useCategories'
import { Input } from '../ui/input'
import CategoryCard from '../CategoryCard'
import PaginationControls from './PaginationControls'

const CategoriesSection = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { categories, loading: loadingCategories } = useCategories()
  
  // State for pagination
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1)
  
  // Items per page constants
  const itemsPerPage = 5
  
  // State for filtering
  const [categoryFilter, setCategoryFilter] = useState('')

  // Filter and paginate categories
  const filteredCategories = categoryFilter
    ? categories.filter(category => 
        category.name.toLowerCase().includes(categoryFilter.toLowerCase()))
    : categories
    
  const totalCategoryPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const indexOfLastCategory = currentCategoryPage * itemsPerPage
  const indexOfFirstCategory = indexOfLastCategory - itemsPerPage
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory)

  // Handler for the "View All" button
  const handleViewAll = () => {
    navigate('/categories')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">{t('browseModels')}</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={t('searchCategories')}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <button
            onClick={handleViewAll}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            {t('viewAll')}
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {loadingCategories ? (
          <div className="col-span-full text-center py-12">{t('loadingShops')}</div>
        ) : currentCategories.length > 0 ? (
          currentCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t('noCategoriesFound')}
          </div>
        )}
      </div>
      
      {/* Categories Pagination */}
      <PaginationControls 
        currentPage={currentCategoryPage}
        totalPages={totalCategoryPages}
        setPage={setCurrentCategoryPage}
      />
    </div>
  )
}

export default CategoriesSection
