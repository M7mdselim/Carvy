
import { useState, useEffect } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useLanguage } from '../contexts/LanguageContext'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '../components/ui/input'
import { ShopProductCard } from '../components/ShopProductCard'
import { Badge } from '../components/ui/badge'

export default function Products() {
  const { t, language } = useLanguage();
  const { products, loading: loadingProducts } = useProducts();
  const { categories, loading: loadingCategories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get parameters from URL
  const categoryParam = searchParams.get('category');
  const makeParam = searchParams.get('make');
  const modelParam = searchParams.get('model');
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;
  const [isRtl, setIsRtl] = useState(language === 'ar');
  const [activeFilters, setActiveFilters] = useState<{category?: string, make?: string, model?: string}>({});

  useEffect(() => {
    // Set active filters from URL params
    const filters: {category?: string, make?: string, model?: string} = {};
    
    if (categoryParam) {
      filters.category = categoryParam;
      setSelectedCategory(categoryParam);
    }
    
    if (makeParam) {
      filters.make = makeParam;
    }
    
    if (modelParam) {
      filters.model = modelParam;
    }
    
    if (Object.keys(filters).length > 0) {
      setActiveFilters(filters);
    }
  }, [categoryParam, makeParam, modelParam]);

  // Update URL when category dropdown changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    
    if (selectedCategory) {
      newParams.set('category', selectedCategory);
    } else {
      newParams.delete('category');
    }
    
    setSearchParams(newParams);
  }, [selectedCategory, setSearchParams]);

  useEffect(() => {
    setIsRtl(language === 'ar');
    document.body.classList.toggle('rtl', language === 'ar');
    return () => {
      document.body.classList.remove('rtl');
    };
  }, [language]);

  // Filter products based on category, search query, and make/model
  const filteredProducts = products
    .filter(product => !selectedCategory || product.category === selectedCategory)
    .filter(product => 
      !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(product => {
      if (!activeFilters.make && !activeFilters.model) return true;
      
      // Check if the product is compatible with the specified make and model
      return product.compatibility.some(compatStr => {
        // Simple string check - not the most robust solution but works for demo
        if (activeFilters.make && activeFilters.model) {
          return compatStr.toLowerCase().includes(activeFilters.make.toLowerCase()) && 
                 compatStr.toLowerCase().includes(activeFilters.model.toLowerCase());
        } else if (activeFilters.make) {
          return compatStr.toLowerCase().includes(activeFilters.make.toLowerCase());
        } else if (activeFilters.model) {
          return compatStr.toLowerCase().includes(activeFilters.model.toLowerCase());
        }
        return true;
      });
    });

  // Paginate products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, activeFilters]);

  // Load more products
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Clear filters
  const clearFilters = () => {
    setActiveFilters({});
    setSelectedCategory('');
    setSearchParams({});
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
      
      {/* Show active filters if any */}
      {(activeFilters.category || activeFilters.make || activeFilters.model) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('activeFilters')}:</span>
          {activeFilters.category && (
            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex items-center gap-1">
              {activeFilters.category}
              <button onClick={clearFilters} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(activeFilters.make || activeFilters.model) && (
            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex items-center gap-1">
              {activeFilters.make && `${activeFilters.make}`} {activeFilters.model && `${activeFilters.model}`}
              <button onClick={clearFilters} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

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
            {(activeFilters.make || activeFilters.model) && ` ${t('matching')} ${activeFilters.make || ''} ${activeFilters.model || ''}`}
          </p>
          {(activeFilters.category || activeFilters.make || activeFilters.model) && (
            <Button 
              onClick={clearFilters}
              variant="outline" 
              className="mt-4"
            >
              {t('clearFilters')}
            </Button>
          )}
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
