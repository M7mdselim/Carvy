
import { useLanguage } from '../../contexts/LanguageContext'
import SearchBar from './SearchBar'

const HomeHero = () => {
  const { t } = useLanguage()

  return (
    <div className="relative isolate mb-32">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {t('findPerfectParts')}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {t('browseThousands')}
          </p>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
      </div>
      
      <div className="relative z-20 mb-12">
        <SearchBar />
      </div>
    </div>
  )
}

export default HomeHero
