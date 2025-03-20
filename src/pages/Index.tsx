
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ProductShowcase from '@/components/ProductShowcase';
import Footer from '@/components/Footer';
import { observeElements } from '@/utils/animations';

// Define the props type for Navbar if it's not already defined elsewhere
interface NavbarProps {
  transparent?: boolean;
}

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
      <main>
        <Hero />
        <Features />
        <ProductShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
