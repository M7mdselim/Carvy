import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Product } from '../types'
import { ShopProductCard } from '../components/ShopProductCard'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '../components/ui/button'
import { ChevronLeft, Filter, Search } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination'

export default function ModelProducts() {
  const { modelId } = useParams<{ modelId: string }>()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  
  const [carModel, setCarModel] = useState<{
    id: string;
    make: string;
    model: string;
    year_start: number;
    year_end?: number;
  } | null>(null)
  
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 9
  const isRtl = language === 'ar'

  useEffect(() => {
    fetchCarModelAndProducts()
  }, [modelId])

  useEffect(() => {
    // Filter and sort products whenever filters change
    let result = [...products]
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory)
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query)
      )
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low-high':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high-low':
        result.sort((a, b) => b.price - a.price)
        break
      case 'oldest':
        // Since we don't have a created_at field in our Product interface,
        // we'll keep the original order which should be by created_at
        break
      case 'newest':
      default:
        // This is the default order from the API
        break
    }
    
    setFilteredProducts(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [products, selectedCategory, searchQuery, sortBy])

  async function fetchCarModelAndProducts() {
    try {
      setLoading(true)
      
      // Fetch car model
      const { data: carModelData, error: carModelError } = await supabase
        .from('car_models')
        .select('*')
        .eq('id', modelId)
        .single()
      
      if (carModelError) throw carModelError
      
      setCarModel(carModelData)
      
      // Fetch products compatible with this car model
      const { data: productsData, error: productsError } = await supabase
        .from('product_car_models')
        .select(`
          product_id,
          products (
            *,
            categories (name),
            product_car_models (
              car_models (
                make,
                model,
                year_start,
                year_end
              )
            )
          )
        `)
        .eq('car_model_id', modelId)
      
      if (productsError) throw productsError
      
      // Process products data
      const uniqueProducts = new Map<string, any>()
      const uniqueCategories = new Set<string>()
      
      productsData.forEach(item => {
        if (item.products && !uniqueProducts.has(item.products.id)) {
          uniqueProducts.set(item.products.id, item.products)
          
          // Collect unique categories
          if (item.products.categories?.name) {
            uniqueCategories.add(item.products.categories.name)
          }
        }
      })
      
      const formattedProducts = Array.from(uniqueProducts.values()).map(product => ({
        id: product.id,
        shopId: product.shop_id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        image: product.image || 'https://via.placeholder.com/500',
        category: product.categories?.name || 'Uncategorized',
        compatibility: product.product_car_models?.map((pcm: any) => {
          const car = pcm.car_models
          return `${car.make} ${car.model} (${car.year_start}${car.year_end ? `-${car.year_end}` : '+'})`
        }) || [],
        stock: product.stock,
      }))
      
      setProducts(formattedProducts)
      setFilteredProducts(formattedProducts)
      setCategories(Array.from(uniqueCategories))
    } catch (e) {
      console.error('Error fetching products:', e)
      setError(e instanceof Error ? e : new Error('Failed to fetch products for this car model'))
    } finally {
      setLoading(false)
    }
  }

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-2 text-gray-500">{t('loadingProducts')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-500">
          <p>{t('errorLoadingProducts')}</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!carModel) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{t('carModelNotFound')}</h2>
          <Button className="mt-4" onClick={() => navigate('/products')}>
            {t('browseAllProducts')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="mb-8">
        <Button 
          variant="outline" 
          className="mb-4 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
          {t('back')}
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900">
          {carModel.make} {carModel.model} ({carModel.year_start}{carModel.year_end ? `-${carModel.year_end}` : '+'})
        </h1>
        <p className="mt-2 text-gray-600">
          {t('productsCompatibleWith')} {carModel.make} {carModel.model}
        </p>
      </div>
      
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={t('searchProducts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="relative flex items-center">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="pl-10">
                <SelectValue placeholder={t('allCategories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('allCategories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('newest')}</SelectItem>
                <SelectItem value="oldest">{t('oldest')}</SelectItem>
                <SelectItem value="price-low-high">{t('priceLowToHigh')}</SelectItem>
                <SelectItem value="price-high-low">{t('priceHighToLow')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
          <div className="text-gray-400 text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">{t('noProductsFound')}</h3>
          <p className="text-gray-500">
            {t('noProductsForThisModelAndFilters')}
          </p>
          <Button 
            className="mt-4" 
            onClick={() => {
              setSelectedCategory('')
              setSearchQuery('')
              setSortBy('newest')
            }}
          >
            {t('clearFilters')}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProducts.map(product => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                    const pageNumber = currentPage > 3 ? 
                      currentPage - 3 + index + 1 : 
                      index + 1;
                      
                    return pageNumber <= totalPages ? (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink 
                          isActive={currentPage === pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    ) : null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}
