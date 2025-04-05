
import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  Settings, 
  ShieldCheck, 
  Clock, 
  HeadphonesIcon, 
  Truck 
} from 'lucide-react'
import { motion } from 'framer-motion'

const ServiceSection = () => {
  const { t } = useLanguage()
  
  const services = [
    {
      icon: <Settings className="h-10 w-10 text-indigo-600" />,
      title: 'expertService',
      description: 'expertServiceDesc'
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-indigo-600" />,
      title: 'qualityGuarantee',
      description: 'qualityGuaranteeDesc'
    },
    {
      icon: <Clock className="h-10 w-10 text-indigo-600" />,
      title: 'quickInstallation',
      description: 'quickInstallationDesc'
    },
    {
      icon: <HeadphonesIcon className="h-10 w-10 text-indigo-600" />,
      title: 'customerSupport',
      description: 'customerSupportDesc'
    },
    {
      icon: <Truck className="h-10 w-10 text-indigo-600" />,
      title: 'freeShipping',
      description: 'freeShippingDesc'
    }
  ]
  
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{t('ourServices')}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t('servicesDescription')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-gray-50 to-indigo-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover-lift"
            >
              <div className="bg-white p-4 rounded-lg shadow-sm inline-block mb-5">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t(service.title)}</h3>
              <p className="text-gray-600">{t(service.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ServiceSection
