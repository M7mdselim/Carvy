
import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { Link } from 'react-router-dom'

const BrandsCarousel = () => {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 200)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Sample car brands - in a real app, these would come from an API
  const brands = [
    { id: 1, name: 'Toyota', logo: 'https://www.carlogos.org/car-logos/toyota-logo-2019-1350x1500.png' },
    { id: 2, name: 'BMW', logo: 'https://www.carlogos.org/car-logos/bmw-logo-2020-gray-1500x1500.png' },
    { id: 3, name: 'Mercedes', logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo-2011-1500x1500.png' },
    { id: 4, name: 'Ford', logo: 'https://www.carlogos.org/car-logos/ford-logo-2017-1500x1500.png' },
    { id: 5, name: 'Honda', logo: 'https://www.carlogos.org/car-logos/honda-logo-2000-full-1500x1500.png' },
    { id: 6, name: 'Hyundai', logo: 'https://www.carlogos.org/car-logos/hyundai-logo-2011-1500x1500.png' },
    { id: 7, name: 'Volkswagen', logo: 'https://www.carlogos.org/car-logos/volkswagen-logo-2019-1500x1500.png' },
    { id: 8, name: 'Audi', logo: 'https://www.carlogos.org/car-logos/audi-logo-2016-1500x1500.png' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <h2 className="text-2xl font-bold text-center mb-2">{t('topBrands')}</h2>
        <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">{t('findPartsByBrand')}</p>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-indigo-400/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
      
      <div className="flex items-center justify-center relative">
        <div className="w-full overflow-hidden bg-white/40 backdrop-blur-sm py-8 px-4 rounded-2xl shadow-sm">
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white via-white/90 to-transparent z-10"></div>
          
          <div className="flex space-x-8 lg:space-x-12 animate-carousel">
            {brands.concat(brands).map((brand, index) => (
              <Link 
                key={`${brand.id}-${index}`}
                to={`/products?brand=${encodeURIComponent(brand.name.toLowerCase())}`}
                className="flex-shrink-0 w-24 h-20 flex flex-col items-center justify-center group"
              >
                <div className="w-16 h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 hover-lift">
                  <img 
                    src={brand.logo} 
                    alt={brand.name} 
                    className="max-h-12 max-w-full object-contain"
                  />
                </div>
                <span className="mt-1 text-xs text-gray-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{brand.name}</span>
              </Link>
            ))}
          </div>
          
          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white/90 to-transparent z-10"></div>
        </div>
      </div>
    </div>
  )
}

export default BrandsCarousel
