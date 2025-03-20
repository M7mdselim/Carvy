
import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatedButton } from './ui/AnimatedButton';

const Hero: React.FC = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subHeadingRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

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
    <section id="home" className="min-h-screen hero-gradient flex items-center justify-center overflow-hidden relative pt-32 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/0 z-0"></div>
      
      <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center z-10">
        <div className="w-full lg:w-1/2 mb-16 lg:mb-0">
          <div className="max-w-xl">
            <h1 
              ref={headingRef} 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6 opacity-0 translate-y-8 transition-all duration-700 ease-apple"
            >
              Experience <span className="gradient-text">Smart Driving</span> Like Never Before
            </h1>
            
            <p 
              ref={subHeadingRef}
              className="text-lg md:text-xl text-gray-700 mb-8 opacity-0 translate-y-8 transition-all duration-700 ease-apple delay-100"
            >
              Carvy transforms your vehicle into an intelligent companion, providing real-time insights and assistance for a seamless driving experience.
            </p>
            
            <div 
              ref={buttonsRef}
              className="flex flex-col sm:flex-row gap-4 opacity-0 translate-y-8 transition-all duration-700 ease-apple delay-200"
            >
              <AnimatedButton 
                variant="primary" 
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Get Started
              </AnimatedButton>
              
              <AnimatedButton variant="secondary">
                Learn More
              </AnimatedButton>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <img 
            ref={imageRef}
            src="https://images.unsplash.com/photo-1617704548623-340376564e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
            alt="Carvy Dashboard" 
            className="w-full max-w-lg rounded-2xl shadow-2xl opacity-0 translate-y-8 transition-all duration-700 ease-apple delay-300 object-cover"
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
