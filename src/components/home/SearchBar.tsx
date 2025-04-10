
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
    <div className="max-w-4xl mx-auto" style={{ position: 'relative', zIndex: 99999999 }}>
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
        
        {/* Absolutely positioned search results with highest z-index */}
        <div style={{ position: 'absolute', width: '100%', zIndex: 99999999 }}>
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
