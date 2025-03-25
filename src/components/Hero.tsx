
import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatedButton } from './ui/AnimatedButton';
import { useLanguage } from '../contexts/LanguageContext';

const Hero: React.FC = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subHeadingRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const timeout = setTimeout(() => {
      headingRef.current?.classList.add('revealed');
      
      setTimeout(() => {
        subHeadingRef.current?.classList.add('revealed');
        
        setTimeout(() => {
          buttonsRef.current?.classList.add('revealed');
          
          setTimeout(() => {
            imageRef.current?.classList.add('revealed');
          }, 200);
        }, 200);
      }, 200);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center overflow-hidden relative pt-32 pb-20">
      {/* Enhanced background with gradient, pattern and image */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-indigo-100 z-0"></div>
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] z-0"></div>
      <div className="absolute inset-0 z-0 opacity-20" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay'
      }}></div>
      
      <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center z-10">
        <div className="w-full lg:w-1/2 mb-16 lg:mb-0">
          <div className="max-w-xl">
            <h1 
              ref={headingRef} 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 opacity-0 translate-y-8 transition-all duration-700 ease-apple"
            >
              {t('experienceSmartDriving')} <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">{t('brandName')}</span>
            </h1>
            
            <p 
              ref={subHeadingRef}
              className="text-lg md:text-xl text-gray-700 mb-8 opacity-0 translate-y-8 transition-all duration-700 ease-apple delay-100"
            >
              {t('carDescription')}
            </p>
            
            <div 
              ref={buttonsRef}
              className="flex flex-col sm:flex-row gap-4 opacity-0 translate-y-8 transition-all duration-700 ease-apple delay-200"
            >
              <AnimatedButton 
                variant="primary" 
                icon={<ArrowRight className="w-5 h-5" />}
              >
                {t('getStarted')}
              </AnimatedButton>
              
              <AnimatedButton variant="secondary">
                {t('learnMore')}
              </AnimatedButton>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <img 
            ref={imageRef}
            src="https://images.unsplash.com/photo-1617704548623-340376564e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
            alt={t('brandName') + " Dashboard"} 
            className="w-full max-w-lg rounded-2xl shadow-2xl opacity-0 translate-y-8 transition-all duration-700 ease-apple delay-300 object-cover border-4 border-white"
          />
        </div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-14 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse-slow"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
