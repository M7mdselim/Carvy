
import React, { useEffect } from 'react';
import { observeElements } from '@/utils/animations';
import { useLanguage } from '../contexts/LanguageContext';

const features = [
  {
    titleKey: "intelligentNavigation",
    descriptionKey: "navigationDescription",
    icon: "🧭",
  },
  {
    titleKey: "voiceControl",
    descriptionKey: "voiceControlDescription",
    icon: "🎤",
  },
  {
    titleKey: "safetyAlerts",
    descriptionKey: "safetyDescription",
    icon: "🛡️",
  },
  {
    titleKey: "ecoDriving",
    descriptionKey: "ecoDescription",
    icon: "🌿",
  },
  {
    titleKey: "seamlessConnectivity",
    descriptionKey: "connectivityDescription",
    icon: "📱",
  },
  {
    titleKey: "personalization",
    descriptionKey: "personalizationDescription",
    icon: "👤",
  }
];

const Features: React.FC = () => {
  const { t } = useLanguage();
  
  useEffect(() => {
    const observer = observeElements();
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section id="features" className="section-padding bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('intelligentFeatures')}
          </h2>
          <p className="text-lg text-gray-700">
            {t('featureDescription')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card p-8 rounded-2xl reveal-on-scroll"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="feature-icon-container">
                <span className="text-2xl">{feature.icon}</span>
                <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse-slow"></div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t(feature.titleKey)}</h3>
              <p className="text-gray-700">{t(feature.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
