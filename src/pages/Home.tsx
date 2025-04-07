
import { useLanguage } from '../contexts/LanguageContext'
import HomeHero from '../components/home/HomeHero'
import CategoriesSection from '../components/home/CategoriesSection'
import ShopsSection from '../components/home/ShopsSection'
import ProductsSection from '../components/home/ProductsSection'
import BrandsCarousel from '../components/home/BrandsCarousel'
import PromotionCards from '../components/home/PromotionCards'
import { useEffect } from 'react'
import { observeElements } from '../utils/animations'

export default function Home() {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Initialize scroll animations
    const observer = observeElements();
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Hero Section with Search */}
      <div className="relative z-20">
        <HomeHero />
      </div>

      {/* Promotion Cards */}
      {/* <div className="mt-8 lg:mt-12 reveal-on-scroll">
        <PromotionCards />
      </div> */}
      
      {/* Categories Section */}
      <div className="mt-16 lg:mt-24 relative z-10 reveal-on-scroll">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-blue-50 -z-10 skew-y-3 transform origin-bottom-right"></div>
        <CategoriesSection />
      </div>

      {/* Featured Products Section */}
      <div className="mt-20 lg:mt-28 reveal-on-scroll">
        <ProductsSection />
      </div>

      {/* Brands Carousel */}
      <div className="mt-20 lg:mt-28 py-12 bg-gradient-to-r from-gray-50 to-indigo-50 reveal-on-scroll">
        <BrandsCarousel />
      </div>

      {/* Featured Shops Section */}
      <div className="mt-20 lg:mt-28 mb-28 reveal-on-scroll">
        <ShopsSection />
      </div>
    </div>
  )
}
