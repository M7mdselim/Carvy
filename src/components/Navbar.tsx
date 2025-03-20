
import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

// Define NavbarProps interface
export interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const { user, signOut } = useAuth()
  const { items, total } = useCart()
  const location = useLocation()
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Models', href: '/categories' },
    { name: 'Shops', href: '/shops' },
    { name: 'Contact Us', href: '/contact' }, // Added Contact Us link
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
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                    Carvy
                  </Link>
                </div>
                <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        isCurrentPath(item.href)
                          ? 'border-indigo-500 text-indigo-600 font-semibold before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-indigo-600 before:transform before:origin-left before:transition-transform before:duration-200 before:scale-x-100'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-gray-300 before:transform before:origin-left before:transition-transform before:duration-200 before:scale-x-0 hover:before:scale-x-100',
                        'relative inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                <Link 
                  to="/cart/" 
                  className="group relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <div className="relative">
                    <ShoppingCartIcon className="h-6 w-6" />
                    {cartItemCount > 0 && (
                      <div className="absolute -top-2 -right-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white ring-2 ring-white">
                          {cartItemCount}
                        </span>
                        <div className="hidden group-hover:block absolute top-full right-0 w-64 mt-3">
                          <div className="bg-white rounded-lg shadow-xl py-4 px-4 border border-gray-100">
                            <div className="text-sm font-medium text-gray-900 mb-2">
                              Cart Summary
                            </div>
                            <div className="space-y-2">
                              {items.map(item => (
                                <div key={item.product.id} className="flex justify-between text-sm">
                                  <span className="text-gray-600 truncate">{item.product.name}</span>
                                  <span className="text-gray-900">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex justify-between font-medium">
                                <span>Total:</span>
                                <span className="text-indigo-600">{total.toFixed(2)}</span>
                              </div>
                            </div>
                            <Link
                              to="/cart"
                              className="mt-3 block w-full text-center bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                            >
                              View Cart
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>

                {user ? (
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex rounded-full bg-white ring-2 ring-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={`https://ui-avatars.com/api/?name=${user.email}&background=random`}
                        alt=""
                      />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? 'bg-gray-50' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/orders"
                              className={classNames(
                                active ? 'bg-gray-50' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Orders
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={signOut}
                              className={classNames(
                                active ? 'bg-gray-50' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="space-x-4">
                    <Link
                      to="/login"
                      className="text-gray-500 hover:text-gray-900 font-medium transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex items-center sm:hidden space-x-4">
                <Link 
                  to="/cart" 
                  className="relative p-2 text-gray-600"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white ring-2 ring-white">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
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

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    isCurrentPath(item.href)
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                    'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            {user ? (
              <div className="border-t border-gray-200 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={`https://ui-avatars.com/api/?name=${user.email}&background=random`}
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/orders"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Orders
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="button"
                    onClick={signOut}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Login
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/register"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Register
                  </Disclosure.Button>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
