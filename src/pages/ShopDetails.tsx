
import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useShopDetails } from '../hooks/useShopDetails'
import { Search, ImageIcon, ArrowUpDown } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

export default function ShopDetails() {
  const { t } = useLanguage();
  const { shopId } = useParams<{ shopId: string }>();
  const { shop, products, loading } = useShopDetails(shopId!);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('default');

  const sortedProducts = useMemo(() => {
    const filtered = products?.filter(product => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase().trim();
      return product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.price?.toString().includes(query);
    }) || [];
    
    // Apply sorting
    switch(sortOption) {
      case 'priceAsc':
        return [...filtered].sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return [...filtered].sort((a, b) => b.price - a.price);
      case 'nameAsc':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case 'nameDesc':
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [products, searchQuery, sortOption]);

  if (loading) {
    return <div className="text-center py-12">{t('loadingShops')}</div>;
  }

  if (!shop) {
    return <div className="text-center py-12 text-red-600">{t('noShopsFound')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-lg">
              <ImageIcon className="h-16 w-16 text-gray-400" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
            {shop.description && (
              <p className="text-gray-600 mt-2">{shop.description}</p>
            )}
            {shop.categories && shop.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {shop.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('products')} ({sortedProducts.length})</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('searchProducts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <SelectValue placeholder={t('sortBy')} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="default">{t('sortBy')}</SelectItem>
              <SelectItem value="priceAsc">{t('priceLowToHigh')}</SelectItem>
              <SelectItem value="priceDesc">{t('priceHighToLow')}</SelectItem>
              <SelectItem value="nameAsc">{t('nameAToZ')}</SelectItem>
              <SelectItem value="nameDesc">{t('nameZToA')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery.trim() ? (
            <>{t('noProductsMatching')} "{searchQuery}" {t('inThisShop')}</>
          ) : (
            <>{t('noProductsAvailable')}</>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
