
import React, { useEffect } from 'react';
import Navbar from '@/components/navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ProductShowcase from '@/components/ProductShowcase';
import Footer from '@/components/Footer';
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
      <Navbar transparent={true} />
      <main className="mt-20">
        <Hero />
        <Features />
        <ProductShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
