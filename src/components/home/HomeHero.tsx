
import { useLanguage } from '../../contexts/LanguageContext'
import SearchBar from './SearchBar'
import { Button } from '../ui/button'
import { ChevronRight, Search, Car, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const HomeHero = () => {
  const { t } = useLanguage()
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isImagesLoaded, setIsImagesLoaded] = useState(false)

  useEffect(() => {
    // Show the search bar immediately
    setIsSearchVisible(true)

    // After images are loaded, set the state
    const imageTimer = setTimeout(() => {
      setIsImagesLoaded(true)
    }, 300)

    return () => {
      clearTimeout(imageTimer)
    }
  }, [])

  return (
    <div className="relative isolate overflow-visible" style={{ position: 'static' }}>
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50 -z-10"></div>
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>
      
      {/* Animated circles */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply opacity-10 animate-float"></div>
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Hero content */}
      <div className="relative pt-6 pb-24 md:pt-10 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text content */}
          <div className={`text-center lg:text-left ${isImagesLoaded ? 'slide-in-left' : 'opacity-0'}`}>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-6">
              {t('findPerfectParts')}
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 leading-tight">
                {t('forYourCar')}
              </span>
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600 max-w-lg mx-auto lg:mx-0">
              {t('browseThousands')}
            </p>

            <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="px-6 py-7 rounded-lg text-base shadow-lg hover-glow bg-gradient-to-r from-indigo-600 to-indigo-700">
                <Link to="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {t('shopNow')} <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-6 py-7 rounded-lg text-base border-2 hover:border-indigo-300 hover:bg-indigo-50">
                <Link to="/shops">
                  <Car className="mr-2 h-5 w-5" />
                  {t('findShops')}
                </Link>
              </Button>
            </div>
            
          </div>
          
          {/* Right side image */}
          <div className={`hidden lg:flex justify-end ${isImagesLoaded ? 'slide-in-right' : 'opacity-0'}`}>
            <img 
              src="https://gcejhxrwyftlzbztngug.supabase.co/storage/v1/object/public/Shops%20Photos//ZABTT.png"
              alt="Car dashboard"
              className="rounded-2xl shadow-2xl max-w-md object-cover h-196 border-4 border-white animate-float hover-lift"
            />
          </div>
        </div>

        {/* Search bar with highest z-index */}
        <div className={`relative px-4 pt-8 pb-6 transition-all duration-500 ease-in-out ${isSearchVisible ? 'fade-in' : 'opacity-0 translate-y-10'}`} 
          style={{ position: 'relative', zIndex: 99999999 }}>
          <SearchBar />
        </div>

        {/* Quick search options */}
        <div className={`mt-24 lg:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto transition-all duration-500 ease-in-out ${isImagesLoaded ? 'fade-in' : 'opacity-0'}`}>
          {['Engine Parts', 'Brake System', 'Transmission', 'Electrical'].map((category, index) => (
            <Link 
              key={category} 
              to={`/products?type=${encodeURIComponent(category)}`}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm hover-lift hover:bg-white text-gray-700 font-medium"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Bottom gradient */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
      </div>
    </div>
  )
}

export default HomeHero
