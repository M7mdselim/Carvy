
import { useState, useEffect } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useLanguage } from '../contexts/LanguageContext'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Search, Filter, X, ArrowLeft, Check } from 'lucide-react'
import { Input } from '../components/ui/input'
import { ShopProductCard } from '../components/ShopProductCard'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover'
import {
  ToggleGroup,
  ToggleGroupItem
} from '../components/ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu'

export default function Products() {
  const { t, language } = useLanguage();
  const { products, loading: loadingProducts } = useProducts();
  const { categories, loading: loadingCategories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get parameters from URL
  const categoryParam = searchParams.get('category');
  const makeParam = searchParams.get('make');
  const modelParam = searchParams.get('model');
  const typeParam = searchParams.get('type');
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryParam ? [categoryParam] : []);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(typeParam ? [typeParam] : []);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortOption, setSortOption] = useState<string>('default');
  const [isRtl, setIsRtl] = useState(language === 'ar');
  const [activeFilters, setActiveFilters] = useState<{category?: string, make?: string, model?: string, type?: string}>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Product type options
  const productTypes = [
    'Engine Parts', 
    'Brake System', 
    'Transmission', 
    'Oil & Fluids', 
    'Tyres', 
    'Electrical', 
    'Body Parts', 
    'Interior', 
    'Exhaust System', 
    'Other'
  ];

  useEffect(() => {
    // Set active filters from URL params
    const filters: {category?: string, make?: string, model?: string, type?: string} = {};
    
    if (categoryParam && categoryParam !== 'all') {
      filters.category = categoryParam;
      setSelectedCategories([categoryParam]);
    }
    
    if (makeParam) {
      filters.make = makeParam;
    }
    
    if (modelParam) {
      filters.model = modelParam;
    }

    if (typeParam && typeParam !== 'all') {
      filters.type = typeParam;
      setSelectedTypes([typeParam]);
    }
    
    if (Object.keys(filters).length > 0) {
      setActiveFilters(filters);
    }
  }, [categoryParam, makeParam, modelParam, typeParam]);

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    
    if (selectedCategories.length === 1) {
      newParams.set('category', selectedCategories[0]);
    } else if (selectedCategories.length === 0) {
      newParams.delete('category');
    }

    if (selectedTypes.length === 1) {
      newParams.set('type', selectedTypes[0]);
    } else if (selectedTypes.length === 0) {
      newParams.delete('type');
    }
    
    setSearchParams(newParams);
  }, [selectedCategories, selectedTypes, searchParams, setSearchParams]);

  useEffect(() => {
    setIsRtl(language === 'ar');
    document.body.classList.toggle('rtl', language === 'ar');
    return () => {
      document.body.classList.remove('rtl');
    };
  }, [language]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Toggle type selection
  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => selectedCategories.length === 0 || selectedCategories.includes(product.category))
    .filter(product => selectedTypes.length === 0 || selectedTypes.includes(product.type || ''))
    .filter(product => 
      !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.productNumber && product.productNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(product => {
      if (!activeFilters.make && !activeFilters.model) return true;
      
      // Check if the product is compatible with the specified make and model
      return product.compatibility && product.compatibility.some(compatStr => {
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
    })
    .sort((a, b) => {
      switch(sortOption) {
        case 'priceAsc':
          return a.price - b.price;
        case 'priceDesc':
          return b.price - a.price;
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        default:
          return 0; // Keep original order
      }
    });

  // Get visible products based on current page
  const displayedProducts = filteredAndSortedProducts.slice(0, currentPage * itemsPerPage);
  const hasMoreProducts = displayedProducts.length < filteredAndSortedProducts.length;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedTypes, searchQuery, activeFilters, sortOption]);

  // Load more products
  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };
  
  // Clear filters
  const clearFilters = () => {
    setActiveFilters({});
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSortOption('default');
    setSearchParams({});
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isRtl ? 'rtl' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/', { replace: true })} 
            className="flex items-center gap-2 hover:bg-gray-100 mr-2"
            aria-label={t('back')}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{t('products')}</h1>
        </div>
        
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
          
          {/* Filter dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t('filters')}
                {(selectedCategories.length > 0 || selectedTypes.length > 0) && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-indigo-600">
                    {selectedCategories.length + selectedTypes.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white shadow-lg rounded-lg">

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{t('category')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge 
                        key={category.id} 
                        variant={selectedCategories.includes(category.name) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleCategory(category.name)}
                      >
                        {selectedCategories.includes(category.name) && (
                          <Check className="mr-1 h-3 w-3" />
                        )}
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">{t('productType')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {productTypes.map((type) => (
                      <Badge 
                        key={type} 
                        variant={selectedTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleType(type)}
                      >
                        {selectedTypes.includes(type) && (
                          <Check className="mr-1 h-3 w-3" />
                        )}
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2 flex justify-between">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    {t('clearFilters')}
                  </Button>
                  <Button size="sm" onClick={() => document.body.click()}>
                    {t('applyFilters')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Separate sort-by dropdown */}
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="bg-white w-full sm:w-48">
              <SelectValue placeholder={t('sortBy')} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="default">{t('default')}</SelectItem>
              <SelectItem value="priceAsc">{t('priceLowToHigh')}</SelectItem>
              <SelectItem value="priceDesc">{t('priceHighToLow')}</SelectItem>
              <SelectItem value="nameAsc">{t('nameAToZ')}</SelectItem>
              <SelectItem value="nameDesc">{t('nameZToA')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Show active filters if any */}
      {(selectedCategories.length > 0 || selectedTypes.length > 0 || sortOption !== 'default') && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('activeFilters')}:</span>
          
          {selectedCategories.map(category => (
            <Badge key={category} className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex items-center gap-1">
              {category}
              <button onClick={() => toggleCategory(category)} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {selectedTypes.map(type => (
            <Badge key={type} className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex items-center gap-1">
              {type}
              <button onClick={() => toggleType(type)} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {activeFilters.make && (
            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex items-center gap-1">
              {activeFilters.make}
              <button onClick={clearFilters} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {activeFilters.model && (
            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex items-center gap-1">
              {activeFilters.model}
              <button onClick={clearFilters} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {sortOption !== 'default' && (
            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex items-center gap-1">
              {sortOption === 'priceAsc' && t('priceLowToHigh')}
              {sortOption === 'priceDesc' && t('priceHighToLow')}
              {sortOption === 'nameAsc' && t('nameAToZ')}
              {sortOption === 'nameDesc' && t('nameZToA')}
              <button onClick={() => setSortOption('default')} className="ml-1">
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
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg shadow-sm">
          <div className="text-gray-400 text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">{t('noProductsFound')}</h3>
          <p className="text-gray-500">
            {selectedCategories.length > 0 && `${t('for')} ${selectedCategories.join(', ')}`}
            {(activeFilters.make || activeFilters.model) && ` ${t('matching')} ${activeFilters.make || ''} ${activeFilters.model || ''}`}
          </p>
          {(selectedCategories.length > 0 || selectedTypes.length > 0 || activeFilters.make || activeFilters.model || sortOption !== 'default') && (
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
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {displayedProducts.map((product) => (
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
  );
}
