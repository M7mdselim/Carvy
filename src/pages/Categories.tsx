
import { useCategories } from '../hooks/useCategories'
import CategoryCard from '../components/CategoryCard'
import { useLanguage } from '../contexts/LanguageContext'

export default function Categories() {
  const { t } = useLanguage();
  const { categories, loading } = useCategories();

  if (loading) {
    return <div className="text-center py-12">{t('loadingShops')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('allCategories')}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
