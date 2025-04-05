
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, ChevronRightIcon } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useCategories } from '../../hooks/useCategories'
import { Input } from '../ui/input'
import CategoryCard from '../CategoryCard'
import PaginationControls from './PaginationControls'
import { Button } from '../ui/button'

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

  // Reset pagination when filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryFilter(e.target.value)
    setCurrentCategoryPage(1) // Reset to first page when filter changes
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl font-bold text-gray-900">{t('browseModels')}</h2>
            <p className="mt-2 text-lg text-gray-600">{t('findPartsForYourCar')}</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-auto">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t('searchCategories')}
                value={categoryFilter}
                onChange={handleFilterChange}
                className="pl-10 pr-4 py-2 w-full md:w-64"
              />
            </div>
            <Button 
              variant="outline"
              onClick={handleViewAll}
              className="flex items-center w-full md:w-auto"
            >
              {t('viewAll')}
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {loadingCategories ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 min-h-[300px]">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-200 rounded-xl h-48"></div>
            ))}
          </div>
        ) : currentCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {currentCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">{t('noCategoriesFound')}</p>
          </div>
        )}
        
        {/* Categories Pagination */}
        {filteredCategories.length > itemsPerPage && (
          <div className="mt-8">
            <PaginationControls 
              currentPage={currentCategoryPage}
              totalPages={totalCategoryPages}
              setPage={setCurrentCategoryPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoriesSection
