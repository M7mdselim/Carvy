import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Product } from '../types'
import { ShopProductCard } from '../components/ShopProductCard'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '../components/ui/button'
import { ChevronLeft, Filter, Search, Calendar } from 'lucide-react'
import { Input } from '../components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select'
import { isYearInRange } from '../lib/utils'

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
  const [productsPerPage, setProductsPerPage] = useState(12)
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<string>('')
  const isRtl = language === 'ar'

  useEffect(() => {
    fetchCarModelAndProducts()
  }, [modelId])
  
  useEffect(() => {
    if (carModel) {
      const years: number[] = [];
      const startYear = carModel.year_start;
      const endYear = carModel.year_end || new Date().getFullYear();
      
      for (let year = startYear; year <= endYear; year++) {
        years.push(year);
      }
      
      setAvailableYears(years.sort((a, b) => b - a));
    }
  }, [carModel]);

  useEffect(() => {
    let result = [...products]
    
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory)
    }
    
    if (selectedYear && selectedYear !== 'all') {
      const year = parseInt(selectedYear);
      result = result.filter(product => {
        return product.compatibility.some(compatStr => isYearInRange(compatStr, year));
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query)
      )
    }
    
    switch (sortBy) {
      case 'price-low-high':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high-low':
        result.sort((a, b) => b.price - a.price)
        break
      case 'oldest':
        break
      case 'newest':
      default:
        break
    }
    
    setFilteredProducts(result)
    setCurrentPage(1)
  }, [products, selectedCategory, searchQuery, sortBy, selectedYear])

  async function fetchCarModelAndProducts() {
    try {
      setLoading(true)
      
      const { data: carModelData, error: carModelError } = await supabase
        .from('car_models')
        .select('*')
        .eq('id', modelId)
        .single()
      
      if (carModelError) throw carModelError
      
      setCarModel(carModelData)
      
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
      
      const uniqueProducts = new Map<string, any>()
      const uniqueCategories = new Set<string>()
      
      productsData.forEach(item => {
        if (item.products && !uniqueProducts.has(item.products.id)) {
          uniqueProducts.set(item.products.id, item.products)
          
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
        status: product.status || 'active',
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

  const displayedProducts = filteredProducts.slice(0, currentPage * productsPerPage)
  const hasMoreProducts = displayedProducts.length < filteredProducts.length

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
            >
              <SelectTrigger className="pl-10">
                <SelectValue placeholder={t('selectYear')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allYears')}</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
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
              setSelectedYear('')
              setSortBy('newest')
            }}
          >
            {t('clearFilters')}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map(product => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            {hasMoreProducts && (
              <Button 
                onClick={handleLoadMore} 
                variant="outline"
                className="px-6"
              >
                {t('loadMore')}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
