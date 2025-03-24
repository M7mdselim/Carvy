
import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import CategoryCard from '../components/CategoryCard'
import { useLanguage } from '../contexts/LanguageContext'
import { Input } from '../components/ui/input'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function Categories() {
  const { t } = useLanguage();
  const { categories, loading } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search query
  const filteredCategories = searchQuery
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : categories;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">{t('allCategories')}</h1>
        <div className="relative w-full md:w-64">
          <Input
            type="text"
            placeholder={t('searchCategories')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">{t('loadingShops')}</div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {t('noCategoriesFound')}
        </div>
      )}
    </div>
  );
}
