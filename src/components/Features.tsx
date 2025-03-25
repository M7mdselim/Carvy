
import React, { useEffect } from 'react';
import { observeElements } from '@/utils/animations';

const features = [
  {
    title: "Intelligent Navigation",
    description: "AI-powered routes that adapt to traffic conditions in real-time, saving you time and fuel.",
    icon: "🧭",
  },
  {
    title: "Voice Control",
    description: "Natural language processing allows you to control every aspect of your journey with simple voice commands.",
    icon: "🎤",
  },
  {
    title: "Safety Alerts",
    description: "Proactive warnings about road hazards, weather conditions, and potential vehicle issues.",
    icon: "🛡️",
  },
  {
    title: "Eco Driving",
    description: "Smart insights to help you drive more efficiently, reducing your carbon footprint and fuel costs.",
    icon: "🌿",
  },
  {
    title: "Seamless Connectivity",
    description: "Integrates with your digital ecosystem, including smart home devices and personal calendars.",
    icon: "📱",
  },
  {
    title: "Personalization",
    description: "Learns your preferences and habits to create a customized driving experience that anticipates your needs.",
    icon: "👤",
  }
];

const Features: React.FC = () => {
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
            Intelligent Features for Modern Drivers
          </h2>
          <p className="text-lg text-gray-700">
            Carvy integrates cutting-edge technology to make your driving experience safer, more efficient, and enjoyable.
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
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
