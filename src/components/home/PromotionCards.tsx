
import React, { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { Link } from 'react-router-dom'
import { Badge } from '../ui/badge'
import { ShieldCheck, TruckIcon, CreditCard, ArrowRight } from 'lucide-react'

const PromotionCards = () => {
  const { t } = useLanguage()
  const [animatedItems, setAnimatedItems] = useState<number[]>([])
  
  const features = [
    {
      title: 'qualityParts',
      description: 'qualityPartsDescription',
      icon: <ShieldCheck className="h-10 w-10 text-indigo-600" />,
      link: '/categories',
      bgClass: 'bg-gradient-to-br from-indigo-50 to-indigo-100'
    },
    {
      title: 'fastDelivery',
      description: 'fastDeliveryDescription',
      icon: <TruckIcon className="h-10 w-10 text-indigo-600" />,
      link: '/shops',
      bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    {
      title: 'securePayment',
      description: 'securePaymentDescription',
      icon: <CreditCard className="h-10 w-10 text-indigo-600" />,
      link: '/faq',
      bgClass: 'bg-gradient-to-br from-purple-50 to-purple-100'
    }
  ]
  
  useEffect(() => {
    // Animate items one by one with a delay
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedItems(prev => {
          const next = [...prev]
          const nextItem = prev.length
          if (nextItem < features.length) {
            next.push(nextItem)
            return next
          } else {
            clearInterval(interval)
            return prev
          }
        })
      }, 200)
      
      return () => clearInterval(interval)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [features.length])
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index}
            className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-500 overflow-hidden flex flex-col hover-lift staggered-fade-in ${animatedItems.includes(index) ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: `${index * 0.1}s` }}
          >
            <div className={`p-8 flex-grow ${feature.bgClass}`}>
              <div className="p-3 bg-white/80 backdrop-blur-sm inline-block rounded-lg mb-6 shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t(feature.title)}</h3>
              <p className="text-gray-600">{t(feature.description)}</p>
            </div>
            <div className="px-8 py-4 bg-white border-t border-gray-100">
              <Link 
                to={feature.link}
                className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center transition-colors"
              >
                {t('learnMore')} <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PromotionCards
