
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Car, Package, Store, Loader2, Settings, Tag } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useSearch } from '../../hooks/useSearch'
import SearchResults from './SearchResults'
import { Command } from '../ui/command'

const SearchBar = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { products: searchProducts, shops: searchShops, carModels: searchCarModels, loading: searchLoading } = useSearch(searchQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Quick search options
  const quickSearchCategories = [
    { label: t('engineParts'), value: 'Engine Parts', icon: <Settings className="h-4 w-4 text-indigo-400" /> },
    { label: t('brakeSystem'), value: 'Brake System', icon: <Settings className="h-4 w-4 text-red-400" /> },
    { label: t('transmission'), value: 'Transmission', icon: <Settings className="h-4 w-4 text-blue-400" /> },
    { label: t('electrical'), value: 'Electrical', icon: <Settings className="h-4 w-4 text-yellow-400" /> }
  ]
  
  const popularBrands = [
    { label: 'Toyota', value: 'Toyota', icon: <Car className="h-4 w-4 text-gray-500" /> },
    { label: 'BMW', value: 'BMW', icon: <Car className="h-4 w-4 text-blue-500" /> },
    { label: 'Mercedes', value: 'Mercedes', icon: <Car className="h-4 w-4 text-gray-600" /> },
    { label: 'Honda', value: 'Honda', icon: <Car className="h-4 w-4 text-red-500" /> }
  ]
  
  const popularProducts = [
    { label: t('oilFilter'), value: 'Oil Filter', icon: <Tag className="h-4 w-4 text-green-500" /> },
    { label: t('brakeDiscs'), value: 'Brake Discs', icon: <Tag className="h-4 w-4 text-red-500" /> },
    { label: t('sparkPlugs'), value: 'Spark Plugs', icon: <Tag className="h-4 w-4 text-yellow-500" /> },
    { label: t('airFilter'), value: 'Air Filter', icon: <Tag className="h-4 w-4 text-blue-500" /> }
  ]

  const handleQuickSearch = (term: string) => {
    navigate(`/products?type=${encodeURIComponent(term)}`);
  }
  
  const handleBrandSearch = (brand: string) => {
    navigate(`/products?make=${encodeURIComponent(brand)}`);
  }
  
  const handleProductSearch = (product: string) => {
    setSearchQuery(product);
    setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(product)}`);
    }, 100);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className={`flex items-center bg-white rounded-xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl ${isFocused ? 'border-indigo-400 ring-4 ring-indigo-100' : 'border-indigo-100'}`}>
          <div className="pl-5">
            <Search className={`h-6 w-6 transition-colors duration-300 ${isFocused ? 'text-indigo-600' : 'text-indigo-400'}`} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={t('searchPlaceholder')}
            className="w-full py-4 px-4 text-gray-700 border-none rounded-xl bg-transparent focus:outline-none text-base md:text-lg"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={clearSearch}
              className="p-2 mr-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <button 
            type="submit" 
            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium py-3 px-6 rounded-r-xl transition-all duration-300"
          >
            {searchLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              t('search')
            )}
          </button>
        </div>
        
        {isFocused && !searchQuery && (
          <div className="absolute w-full mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100">
            {/* Popular categories */}
            <div className="p-4">
              <div className="font-medium text-sm text-gray-500 mb-3">{t('popularCategories')}</div>
              <div className="grid grid-cols-2 gap-2">
                {quickSearchCategories.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleQuickSearch(option.value)}
                    className="text-left px-3 py-2 hover:bg-indigo-50 rounded-md flex items-center text-gray-600 hover:text-indigo-700 transition-colors"
                  >
                    {option.icon}
                    <span className="ml-2">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Popular brands */}
            <div className="border-t">
              <div className="p-4">
                <div className="font-medium text-sm text-gray-500 mb-3">{t('popularBrands')}</div>
                <div className="grid grid-cols-2 gap-2">
                  {popularBrands.map((brand) => (
                    <button
                      key={brand.value}
                      type="button"
                      onClick={() => handleBrandSearch(brand.value)}
                      className="text-left px-3 py-2 hover:bg-indigo-50 rounded-md flex items-center text-gray-600 hover:text-indigo-700 transition-colors"
                    >
                      {brand.icon}
                      <span className="ml-2">{brand.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Popular products */}
            <div className="border-t">
              <div className="p-4">
                <div className="font-medium text-sm text-gray-500 mb-3">{t('popularProducts')}</div>
                <div className="grid grid-cols-2 gap-2">
                  {popularProducts.map((product) => (
                    <button
                      key={product.value}
                      type="button"
                      onClick={() => handleProductSearch(product.value)}
                      className="text-left px-3 py-2 hover:bg-indigo-50 rounded-md flex items-center text-gray-600 hover:text-indigo-700 transition-colors"
                    >
                      {product.icon}
                      <span className="ml-2">{product.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="border-t">
              <div className="p-4">
                <div className="font-medium text-sm text-gray-500 mb-3">{t('quickLinks')}</div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/categories')}
                    className="text-left px-3 py-2 hover:bg-indigo-50 rounded-md flex items-center text-gray-600 hover:text-indigo-700 transition-colors"
                  >
                    <Package className="h-4 w-4 mr-2 text-indigo-400" />
                    {t('browseAllCategories')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/shops')}
                    className="text-left px-3 py-2 hover:bg-indigo-50 rounded-md flex items-center text-gray-600 hover:text-indigo-700 transition-colors"
                  >
                    <Store className="h-4 w-4 mr-2 text-indigo-400" />
                    {t('browseAllShops')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="absolute w-full z-[200] mt-1">
          <SearchResults 
            searchQuery={searchQuery}
            searchLoading={searchLoading}
            searchProducts={searchProducts}
            searchShops={searchShops}
            searchCarModels={searchCarModels}
            handleSearch={handleSearch}
          />
        </div>
      </form>
    </div>
  )
}

export default SearchBar
