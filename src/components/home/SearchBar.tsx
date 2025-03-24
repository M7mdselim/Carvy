
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useSearch } from '../../hooks/useSearch'
import SearchResults from './SearchResults'

const SearchBar = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { products: searchProducts, shops: searchShops, carModels: searchCarModels, loading: searchLoading } = useSearch(searchQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full rounded-full border-2 border-indigo-200 pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-lg text-lg"
      />
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-indigo-400" />
      
      <SearchResults 
        searchQuery={searchQuery}
        searchLoading={searchLoading}
        searchProducts={searchProducts}
        searchShops={searchShops}
        searchCarModels={searchCarModels}
        handleSearch={handleSearch}
      />
    </form>
  )
}

export default SearchBar
