
import React, { useEffect, useRef } from 'react';
import { observeElements, parallaxEffect } from '@/utils/animations';
import { AnimatedButton } from './ui/AnimatedButton';
import { ArrowRight } from 'lucide-react';

const ProductShowcase: React.FC = () => {
  const parallaxRef1 = useRef<HTMLDivElement>(null);
  const parallaxRef2 = useRef<HTMLDivElement>(null);
  const parallaxRef3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = observeElements();
    
    if (parallaxRef1.current) {
      const cleanup1 = parallaxEffect(parallaxRef1.current, 0.05);
      const cleanup2 = parallaxEffect(parallaxRef2.current!, -0.03);
      const cleanup3 = parallaxEffect(parallaxRef3.current!, 0.02);
      
      return () => {
        observer.disconnect();
        cleanup1();
        cleanup2();
        cleanup3();
      };
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section id="showcase" className="section-padding overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Beautiful Design, Powerful Experience
          </h2>
          <p className="text-lg text-gray-700">
            Carvy combines elegant aesthetics with intuitive functionality to enhance your driving journey.
          </p>
        </div>
        
        {/* First Showcase Item */}
        <div className="flex flex-col lg:flex-row items-center mb-32 staggered-fade-in">
          <div className="w-full lg:w-1/2 mb-10 lg:mb-0 lg:pr-16">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">Intuitive Dashboard</h3>
            <p className="text-lg text-gray-700 mb-6">
              Crystal clear information display that puts critical driving data exactly where you need it, when you need it.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">✓</span>
                <span>Customizable layout to match your preferences</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">✓</span>
                <span>Smart alerts that don't distract from driving</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">✓</span>
                <span>Night and day modes for optimal visibility</span>
              </li>
            </ul>
            <AnimatedButton 
              variant="primary" 
              icon={<ArrowRight className="w-5 h-5" />}
            >
              See Dashboard Demo
            </AnimatedButton>
          </div>
          <div className="w-full lg:w-1/2 relative">
            <div 
              ref={parallaxRef1}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1494905998402-395d579af36f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="Carvy Dashboard" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
        
        {/* Second Showcase Item */}
        <div className="flex flex-col lg:flex-row-reverse items-center mb-32 staggered-fade-in">
          <div className="w-full lg:w-1/2 mb-10 lg:mb-0 lg:pl-16">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">Seamless Mobile Integration</h3>
            <p className="text-lg text-gray-700 mb-6">
              Control and monitor your vehicle remotely with our elegant mobile application that keeps you connected.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">✓</span>
                <span>Remote vehicle status monitoring</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">✓</span>
                <span>Pre-heating and cooling control</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">✓</span>
                <span>Trip planning and synchronization</span>
              </li>
            </ul>
            <AnimatedButton 
              variant="primary" 
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Explore Mobile App
            </AnimatedButton>
          </div>
          <div className="w-full lg:w-1/2 relative">
            <div 
              ref={parallaxRef2}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="Carvy Mobile App" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
        
        {/* Third Showcase Item */}
        <div className="flex flex-col lg:flex-row items-center staggered-fade-in">
          <div className="w-full lg:w-1/2 mb-10 lg:mb-0 lg:pr-16">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">AI Navigation Assistant</h3>
            <p className="text-lg text-gray-700 mb-6">
              More than just directions - a true co-pilot that understands context and anticipates your needs.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">✓</span>
                <span>Predictive routing based on your habits</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">✓</span>
                <span>Real-time traffic optimization</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">✓</span>
                <span>Intelligent POI recommendations</span>
              </li>
            </ul>
            <AnimatedButton 
              variant="primary" 
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Discover Navigation Features
            </AnimatedButton>
          </div>
          <div className="w-full lg:w-1/2 relative">
            <div 
              ref={parallaxRef3}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1581306110807-dcfe5d3cdc95?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="Carvy Navigation" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
