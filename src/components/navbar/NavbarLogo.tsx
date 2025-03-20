
import { Link } from 'react-router-dom'

export default function NavbarLogo() {
  return (
    <div className="flex flex-shrink-0 items-center">
      <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
        Carvy
      </Link>
    </div>
  )
}
