
import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

const FeaturedBanner = () => {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className={`mb-12 md:mb-0 md:max-w-xl transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-indigo-100 font-medium">{t('limitedOffer')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('specialOffer')}</h2>
            <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
              {t('specialOfferDescription')}
            </p>
            <Button asChild className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg px-6 py-6 text-base rounded-xl hover-glow">
              <Link to="/products?category=specialOffers">
                {t('shopNow')} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Feature image with animated effects */}
          <div className={`relative transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-400 rounded-full opacity-20 blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-300 rounded-full opacity-20 blur-3xl" style={{ animationDelay: '1s' }}></div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-yellow-300 rounded-full opacity-50 animate-float"></div>
            <div className="absolute -bottom-4 right-8 w-8 h-8 bg-purple-400 rounded-full opacity-60 animate-float" style={{ animationDelay: '1.5s' }}></div>
            
            <img 
              src="https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1084&q=80" 
              alt="Car engine parts" 
              className="relative z-10 rounded-xl shadow-2xl border-4 border-white/10 max-w-md animate-float hover-lift"
              style={{ animationDelay: '0.5s' }}
            />
          </div>
        </div>
      </div>
      
      {/* Background pattern */}
      <div className="absolute inset-y-0 right-0 w-1/3 bg-white/5 skew-x-12 -z-1" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjItMS44LTQtNC00cy00IDEuOC00IDQgMS44IDQgNCA0IDQtMS44IDQtNHptMC0xOGMwLTIuMi0xLjgtNC00LTRzLTQgMS44LTQgNCAxLjggNCA0IDQgNC0xLjggNC00em0wIDE4YzAtMi4yLTEuOC00LTQtNHMtNCAxLjgtNCA0IDEuOCA0IDQgNCA0LTEuOCA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />
    </div>
  )
}

export default FeaturedBanner
