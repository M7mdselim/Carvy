
import { useState, useEffect } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '../components/ui/button'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination'
import { Search, Filter } from 'lucide-react'
import { Input } from '../components/ui/input'
import { ShopProductCard } from '../components/ShopProductCard'

export default function Products() {
  const { t, language } = useLanguage();
  const { products, loading: loadingProducts } = useProducts();
  const { categories, loading: loadingCategories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;
  const [isRtl, setIsRtl] = useState(language === 'ar');

  useEffect(() => {
    setIsRtl(language === 'ar');
    document.body.classList.toggle('rtl', language === 'ar');
    return () => {
      document.body.classList.remove('rtl');
    };
  }, [language]);

  // Filter products based on category and search query
  const filteredProducts = products
    .filter(product => !selectedCategory || product.category === selectedCategory)
    .filter(product => 
      !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Paginate products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Load more products
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isRtl ? 'rtl' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{t('products')}</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={t('searchProducts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 ${isRtl ? 'text-right pr-10 pl-4' : ''}`}
            />
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
          </div>
          <div className="relative flex items-center">
            <Filter className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`rounded-md border-gray-300 py-2 ${isRtl ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3'} text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full`}
            >
              <option value="">{t('allCategories')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loadingProducts || loadingCategories ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingProducts')}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
          <div className="text-gray-400 text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">{t('noProductsFound')}</h3>
          <p className="text-gray-500">
            {selectedCategory && `${t('for')} ${selectedCategory}`}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProducts.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center">
            {indexOfLastProduct < filteredProducts.length && (
              <Button 
                onClick={handleLoadMore} 
                className="mb-4"
                variant="outline"
              >
                {t('loadMore')}
              </Button>
            )}

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
        </>
      )}
    </div>
  );
}
