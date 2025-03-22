
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { classNames } from './utils'
import type { User } from '@supabase/supabase-js'
import { useLanguage } from '../../contexts/LanguageContext'

interface UserMenuProps {
  user: User;
  signOut: () => Promise<void>;
}

export default function UserMenu({ user, signOut }: UserMenuProps) {
  const { t } = useLanguage();
  
  return (
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
                {t('profile')}
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
                {t('orders')}
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
                {t('logout')}
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
