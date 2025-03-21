
import { Disclosure } from '@headlessui/react'
import { Link } from 'react-router-dom'
import { NavigationItem } from './types'
import { classNames } from './utils'
import type { User } from '@supabase/supabase-js'
import { useLanguage } from '../../contexts/LanguageContext'

interface MobileNavProps {
  navigation: NavigationItem[];
  isCurrentPath: (path: string) => boolean;
  user: User | null;
  signOut: () => Promise<void>;
}

export default function MobileNav({ navigation, isCurrentPath, user, signOut }: MobileNavProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  return (
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
              isRTL 
                ? 'pr-3 pl-4 py-2 border-r-4' 
                : 'pl-3 pr-4 py-2 border-l-4',
              'block text-base font-medium transition-colors duration-200'
            )}
          >
            {item.name}
          </Disclosure.Button>
        ))}
      </div>
      {user ? (
        <div className="border-t border-gray-200 pb-3 pt-4">
          <div className={`flex items-center px-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full"
                src={`https://ui-avatars.com/api/?name=${user.email}&background=random`}
                alt=""
              />
            </div>
            <div className={isRTL ? 'mr-3' : 'ml-3'}>
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
  )
}
