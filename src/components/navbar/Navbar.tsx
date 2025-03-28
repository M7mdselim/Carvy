
import { Fragment } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Disclosure } from '@headlessui/react'
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
import { Heart } from 'lucide-react'

export function Navbar({ transparent = false }: NavbarProps) {
  const { user, signOut } = useAuth()
  const { items } = useCart()
  const location = useLocation()
  const { t } = useLanguage()
  
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

  // Apply different background styles based on the transparent prop
  const navbarBgClass = transparent
    ? 'bg-transparent backdrop-blur-0 bg-opacity-0'
    : 'bg-white shadow-lg backdrop-blur-md bg-opacity-80'

  return (
    <Disclosure as="nav" className={`${navbarBgClass} sticky top-0 left-0 right-0 z-50 transition-colors duration-300 navbar-container`}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 justify-between navbar-container">
              <div className="flex">
                <NavbarLogo />
                <DesktopNav navigation={navigation} isCurrentPath={isCurrentPath} />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
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
              <div className="flex items-center sm:hidden space-x-4">
                <LanguageSwitcher className="mr-2" />
                {user && (
                  <Link to="/wishlist" className="p-2 text-indigo-600">
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
        </>
      )}
    </Disclosure>
  )
}
