
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import CategoryCard from '../components/CategoryCard'
import ShopCard from '../components/ShopCard'
import ProductCard from '../components/ProductCard'
import { useCategories } from '../hooks/useCategories'
import { useShops } from '../hooks/useShops'
import { useProducts } from '../hooks/useProducts'
import { useSearch } from '../hooks/useSearch'
import { useLanguage } from '../contexts/LanguageContext'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination'
import { Input } from '../components/ui/input'

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { products: searchProducts, shops: searchShops, loading: searchLoading } = useSearch(searchQuery);
  const { categories, loading: loadingCategories } = useCategories();
  const { shops, loading: loadingShops } = useShops();
  const { products, loading: loadingProducts } = useProducts();
  
  // Added states for product filtering and pagination
  const [productFilter, setProductFilter] = useState('');
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const productsPerPage = 6;
  
  // Added states for shop filtering and pagination
  const [shopFilter, setShopFilter] = useState('');
  const [currentShopPage, setCurrentShopPage] = useState(1);
  const shopsPerPage = 6;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  // Filter and paginate products
  const filteredProducts = productFilter
    ? products.filter(product => 
        product.name.toLowerCase().includes(productFilter.toLowerCase()) ||
        product.description.toLowerCase().includes(productFilter.toLowerCase()))
    : products;
    
  const indexOfLastProduct = currentProductPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  // Filter and paginate shops
  const filteredShops = shopFilter
    ? shops.filter(shop => 
        shop.name.toLowerCase().includes(shopFilter.toLowerCase()) ||
        shop.description.toLowerCase().includes(shopFilter.toLowerCase()))
    : shops;
    
  const indexOfLastShop = currentShopPage * shopsPerPage;
  const indexOfFirstShop = indexOfLastShop - shopsPerPage;
  const currentShops = filteredShops.slice(indexOfFirstShop, indexOfLastShop);
  const totalShopPages = Math.ceil(filteredShops.length / shopsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="relative isolate">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {t('findPerfectParts')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {t('browseThousands')}
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
        </div>
      </div>

      {/* Models Section with Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-full border-2 border-indigo-200 pl-12 pr-4 py-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-lg text-lg"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-indigo-400" />
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-10">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500">{t('searching')}</div>
                ) : (
                  <>
                    {searchShops.length > 0 && (
                      <div className="border-b">
                        <div className="p-2 bg-gray-50 text-sm font-medium text-gray-700">
                          {t('shops')}
                        </div>
                        {searchShops.slice(0, 3).map(shop => (
                          <div
                            key={shop.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/shops/${shop.id}`)}
                          >
                            <div className="font-medium">{shop.name}</div>
                            <div className="text-sm text-gray-500">{shop.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchProducts.length > 0 && (
                      <div>
                        <div className="p-2 bg-gray-50 text-sm font-medium text-gray-700">
                          {t('products')}
                        </div>
                        {searchProducts.slice(0, 3).map(product => (
                          <div
                            key={product.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/shops/${product.shopId}?product=${product.id}`)}
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.price.toFixed(2)} EGP</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchQuery && (searchProducts.length > 3 || searchShops.length > 3) && (
                      <button
                        onClick={handleSearch}
                        className="w-full p-3 text-center text-sm text-indigo-600 hover:bg-gray-50"
                      >
                        {t('viewAllResults')}
                      </button>
                    )}
                    {searchQuery && !searchProducts.length && !searchShops.length && (
                      <div className="p-4 text-center text-gray-500">
                        {t('noResults')} "{searchQuery}"
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </form>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('browseModels')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {loadingCategories ? (
            <div className="col-span-full text-center py-12">{t('loadingShops')}</div>
          ) : (
            categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          )}
        </div>
      </div>

      {/* Featured Shops Section */}
      <div className="bg-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">{t('featuredShops')}</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('searchShops')}
                  value={shopFilter}
                  onChange={(e) => setShopFilter(e.target.value)}
                  className="pl-10 pr-4 py-2"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <button
                onClick={() => navigate('/shops')}
                className="flex items-center text-indigo-600 hover:text-indigo-800"
              >
                {t('viewAll')}
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingShops ? (
              <div className="col-span-full text-center py-12">{t('loadingShops')}</div>
            ) : currentShops.length > 0 ? (
              currentShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                {t('noShopsFound')}
              </div>
            )}
          </div>
          
          {filteredShops.length > shopsPerPage && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentShopPage(prev => Math.max(prev - 1, 1))}
                      className={`cursor-pointer ${currentShopPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(totalShopPages, 5) }).map((_, index) => {
                    const pageNumber = currentShopPage > 3 ? 
                      currentShopPage - 3 + index + 1 : 
                      index + 1;
                      
                    return pageNumber <= totalShopPages ? (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink 
                          isActive={currentShopPage === pageNumber}
                          onClick={() => setCurrentShopPage(pageNumber)}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    ) : null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentShopPage(prev => Math.min(prev + 1, totalShopPages))}
                      className={`cursor-pointer ${currentShopPage === totalShopPages ? 'pointer-events-none opacity-50' : ''}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">{t('featuredProducts')}</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder={t('searchProducts')}
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="pl-10 pr-4 py-2"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              {t('viewAll')}
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loadingProducts ? (
            <div className="col-span-full text-center py-12">{t('loadingProducts')}</div>
          ) : currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              {t('noProductsFound')}
            </div>
          )}
        </div>
        
        {filteredProducts.length > productsPerPage && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentProductPage(prev => Math.max(prev - 1, 1))}
                    className={`cursor-pointer ${currentProductPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(totalProductPages, 5) }).map((_, index) => {
                  const pageNumber = currentProductPage > 3 ? 
                    currentProductPage - 3 + index + 1 : 
                    index + 1;
                    
                  return pageNumber <= totalProductPages ? (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink 
                        isActive={currentProductPage === pageNumber}
                        onClick={() => setCurrentProductPage(pageNumber)}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ) : null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentProductPage(prev => Math.min(prev + 1, totalProductPages))}
                    className={`cursor-pointer ${currentProductPage === totalProductPages ? 'pointer-events-none opacity-50' : ''}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}
