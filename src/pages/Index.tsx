
import React, { useEffect } from 'react';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ProductShowcase from '@/components/ProductShowcase';
import { observeElements } from '@/utils/animations';

const Index = () => {
  useEffect(() => {
    const observer = observeElements();
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main>
        <Hero />
        <Features />
        <ProductShowcase />
      </main>
    </div>
  );
};

export default Index;
