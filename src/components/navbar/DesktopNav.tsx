
import { Link } from 'react-router-dom'
import { NavigationItem } from './types'
import { classNames } from './utils'

interface DesktopNavProps {
  navigation: NavigationItem[];
  isCurrentPath: (path: string) => boolean;
}

export default function DesktopNav({ navigation, isCurrentPath }: DesktopNavProps) {
  return (
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
  )
}
