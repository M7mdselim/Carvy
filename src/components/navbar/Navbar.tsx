
import { Fragment, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Disclosure, Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { NavbarProps } from './types'
import NavbarLogo from './NavbarLogo'
import DesktopNav from './DesktopNav'
import MobileNav from './MobileNav'
import CartButton from './CartButton'
import UserMenu from './UserMenu'
import AuthButtons from './AuthButtons'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { useLanguage } from '../../contexts/LanguageContext'
import { Heart, Search, X, ImageIcon } from 'lucide-react'
import { useSearch } from '../../hooks/useSearch'
import { Button } from '../ui/button'

export function Navbar({ transparent = false }: NavbarProps) {
  const { user, signOut } = useAuth()
  const { items } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { products, shops, carModels, loading } = useSearch(searchQuery)
  
  // Calculate cart totals here instead of using hook values directly
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('models'), href: '/categories' },
    { name: t('shops'), href: '/shops' },
    { name: t('contactUs'), href: '/contact' },
  ]

  const isCurrentPath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleNavigation = (url: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(url);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleNavigation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  // Apply different background styles based on the transparent prop
  const navbarBgClass = transparent
    ? 'bg-transparent backdrop-blur-0 bg-opacity-0'
    : 'bg-white shadow-lg backdrop-blur-md bg-opacity-80'

  return (
    <Disclosure as="nav" className={`${navbarBgClass} sticky top-0 left-0 right-0 z-50 transition-colors duration-300 navbar-container`}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 md:h-20 justify-between navbar-container">
              <div className="flex">
                <NavbarLogo />
                <DesktopNav navigation={navigation} isCurrentPath={isCurrentPath} />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSearchOpen(true)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <Search className="h-5 w-5" />
                </Button>
                <LanguageSwitcher />
                {user && (
                  <Link to="/wishlist" className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Heart className="h-4 w-4 mr-1" />
                    {t('wishlist')}
                  </Link>
                )}
                <CartButton cartItemCount={cartItemCount} items={items} total={total} />
                {user ? (
                  <UserMenu user={user} signOut={signOut} />
                ) : (
                  <AuthButtons />
                )}
              </div>
              <div className="flex items-center sm:hidden space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSearchOpen(true)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <Search className="h-5 w-5" />
                </Button>
                <LanguageSwitcher className="mr-1" />
                {user && (
                  <Link to="/wishlist" className="p-1 text-indigo-600">
                    <Heart className="h-5 w-5" />
                  </Link>
                )}
                <CartButton cartItemCount={cartItemCount} items={items} total={total} isMobile={true} />
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <MobileNav 
            navigation={navigation} 
            isCurrentPath={isCurrentPath} 
            user={user} 
            signOut={signOut} 
          />

          {/* Search Popover */}
          <Transition
            show={searchOpen}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <div className="absolute top-0 inset-x-0 transform pt-14 sm:pt-20 z-10">
              <div className="mx-auto sm:max-w-3xl px-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-md">
                  <div className="relative p-4">
                    <form onSubmit={handleSearch} className="relative">
                      <div className="flex items-center bg-white rounded-md border border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t('searchPlaceholder')}
                          className="block w-full py-2 pl-10 pr-10 border-none rounded-md bg-transparent focus:outline-none sm:text-sm"
                          autoFocus
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </form>
                    <button 
                      onClick={() => setSearchOpen(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {searchQuery.trim() && (
                    <div className="p-4 border-t border-gray-200 max-h-96 overflow-auto">
                      {loading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">{t('searching')}</p>
                        </div>
                      ) : (
                        <div>
                          {/* Products */}
                          {products.length > 0 && (
                            <div className="mb-6">
                              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                {t('products')}
                              </h3>
                              <ul className="space-y-3">
                                {products.map(product => (
                                  <li key={product.id}>
                                    <button
                                      onClick={() => handleNavigation(`/products/${product.id}`)}
                                      className="flex items-center p-2 w-full text-left hover:bg-gray-50 rounded-md"
                                    >
                                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                        {product.image ? (
                                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center">
                                            <ImageIcon className="h-5 w-5 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                        <p className="text-xs text-gray-500">{formatCurrency(product.price)}</p>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Shops */}
                          {shops.length > 0 && (
                            <div className="mb-6">
                              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                {t('shops')}
                              </h3>
                              <ul className="space-y-3">
                                {shops.map(shop => (
                                  <li key={shop.id}>
                                    <button
                                      onClick={() => handleNavigation(`/shops/${shop.id}`)}
                                      className="flex items-center p-2 w-full text-left hover:bg-gray-50 rounded-md"
                                    >
                                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                        {shop.logo ? (
                                          <img src={shop.logo} alt={shop.name} className="h-full w-full object-cover" />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center">
                                            <ImageIcon className="h-5 w-5 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{shop.name}</p>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Car Models */}
                          {carModels.length > 0 && (
                            <div>
                              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                {t('carModels')}
                              </h3>
                              <ul className="space-y-3">
                                {carModels.map(carModel => (
                                  <li key={carModel.id}>
                                    <button
                                      onClick={() => handleNavigation(`/products?make=${carModel.make}&model=${carModel.model}`)}
                                      className="flex items-center p-2 w-full text-left hover:bg-gray-50 rounded-md"
                                    >
                                      <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{carModel.make} {carModel.model}</p>
                                        <p className="text-xs text-gray-500">
                                          {carModel.yearStart}{carModel.yearEnd ? `-${carModel.yearEnd}` : '+'}
                                        </p>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {products.length === 0 && shops.length === 0 && carModels.length === 0 && (
                            <div className="text-center py-4">
                              <p className="text-gray-500">{t('noResultsFound')}</p>
                            </div>
                          )}

                          {/* View all results button */}
                          {(products.length > 0 || shops.length > 0 || carModels.length > 0) && (
                            <div className="mt-6 text-center">
                              <button
                                onClick={() => handleNavigation(`/search?q=${encodeURIComponent(searchQuery.trim())}`)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                {t('viewAllResults')}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Transition>
        </>
      )}
    </Disclosure>
  )
}

// Helper function to format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}
