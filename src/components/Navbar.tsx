
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AnimatedButton } from './ui/AnimatedButton';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavbarProps {
  transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-apple py-4',
        {
          'glass-nav': isScrolled || !transparent,
          'bg-transparent': transparent && !isScrolled,
          'py-6': !isScrolled && transparent,
        }
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center">
          <a href="#" className="text-2xl font-semibold">
            <span className="gradient-text">Carvy</span>
          </a>
        </div>

        {!isMobile ? (
          <div className="flex space-x-10">
            <a 
              onClick={() => scrollToSection('home')} 
              className="nav-link cursor-pointer"
            >
              Home
            </a>
            <a 
              onClick={() => scrollToSection('features')} 
              className="nav-link cursor-pointer"
            >
              Features
            </a>
            <a 
              onClick={() => scrollToSection('showcase')} 
              className="nav-link cursor-pointer"
            >
              Showcase
            </a>
            <a 
              onClick={() => scrollToSection('contact')} 
              className="nav-link cursor-pointer"
            >
              Contact
            </a>
          </div>
        ) : (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="focus:outline-none"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-800" />
            ) : (
              <Menu className="w-6 h-6 text-gray-800" />
            )}
          </button>
        )}

        {!isMobile && (
          <AnimatedButton 
            variant="primary" 
            size="sm"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Get Started
          </AnimatedButton>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div className="container mx-auto px-6 pt-5 pb-8 glass-nav mt-4 flex flex-col space-y-5 animate-slide-down">
          <a 
            onClick={() => scrollToSection('home')} 
            className="nav-link cursor-pointer"
          >
            Home
          </a>
          <a 
            onClick={() => scrollToSection('features')} 
            className="nav-link cursor-pointer"
          >
            Features
          </a>
          <a 
            onClick={() => scrollToSection('showcase')} 
            className="nav-link cursor-pointer"
          >
            Showcase
          </a>
          <a 
            onClick={() => scrollToSection('contact')} 
            className="nav-link cursor-pointer"
          >
            Contact
          </a>
          <AnimatedButton 
            variant="primary" 
            size="sm"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="mt-4"
          >
            Get Started
          </AnimatedButton>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
