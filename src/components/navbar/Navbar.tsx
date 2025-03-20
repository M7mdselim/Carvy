
import { Fragment } from 'react'
import { useLocation } from 'react-router-dom'
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

export function Navbar({ transparent = false }: NavbarProps) {
  const { user, signOut } = useAuth()
  const { items, total } = useCart()
  const location = useLocation()
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Models', href: '/categories' },
    { name: 'Shops', href: '/shops' },
    { name: 'Contact Us', href: '/contact' },
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
    <Disclosure as="nav" className={`${navbarBgClass} sticky top-0 z-50 transition-colors duration-300`}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 justify-between">
              <div className="flex">
                <NavbarLogo />
                <DesktopNav navigation={navigation} isCurrentPath={isCurrentPath} />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                <CartButton cartItemCount={cartItemCount} items={items} total={total} />
                {user ? (
                  <UserMenu user={user} signOut={signOut} />
                ) : (
                  <AuthButtons />
                )}
              </div>
              <div className="flex items-center sm:hidden space-x-4">
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
