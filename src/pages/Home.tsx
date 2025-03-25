
import { useLanguage } from '../contexts/LanguageContext'
import HomeHero from '../components/home/HomeHero'
import CategoriesSection from '../components/home/CategoriesSection'
import ShopsSection from '../components/home/ShopsSection'
import ProductsSection from '../components/home/ProductsSection'

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section with Search */}
      <div className="relative z-20">
        <HomeHero />
      </div>

      {/* Categories Section */}
      <div className="mt-20 relative z-10">
        <CategoriesSection />
      </div>

      {/* Featured Shops Section */}
      <div className="mt-16">
        <ShopsSection />
      </div>

      {/* Featured Products Section */}
      <div className="mt-16">
        <ProductsSection />
      </div>
    </div>
  )
}
