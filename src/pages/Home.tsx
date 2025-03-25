
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
      <HomeHero />

      {/* Categories Section */}
      <CategoriesSection />

      {/* Featured Shops Section */}
      <ShopsSection />

      {/* Featured Products Section */}
      <ProductsSection />
    </div>
  )
}
