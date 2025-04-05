/**
 * Animation utility functions for handling scroll-based animations
 */

export const observeElements = () => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15,
  };

  const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        
        // For staggered animations, add specific class
        if (entry.target.classList.contains('staggered-fade-in')) {
          entry.target.classList.add('visible');
        }
        
        // Don't unobserve items with .keep-observing class
        if (!entry.target.classList.contains('keep-observing')) {
          observer.unobserve(entry.target);
        }
      }
    });
  };

  // Only create observer if IntersectionObserver is available (browser environment)
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    // Observe elements with reveal-on-scroll class
    const elementsToReveal = document.querySelectorAll('.reveal-on-scroll');
    elementsToReveal.forEach((element) => {
      observer.observe(element);
    });
    
    // Observe staggered elements
    const staggeredElements = document.querySelectorAll('.staggered-fade-in');
    staggeredElements.forEach((element) => {
      observer.observe(element);
    });
    
    return observer;
  }
  
  return null;
};

export const parallaxEffect = (element: HTMLElement, speed: number = 0.5) => {
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const offset = scrollPosition * speed;
    element.style.transform = `translateY(${offset}px)`;
  };
  
  window.addEventListener('scroll', handleScroll);
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

export const smoothScrollTo = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export const createFloatingAnimation = (element: HTMLElement, amplitude: number = 10, duration: number = 3000) => {
  let start: number | null = null;
  let animationFrameId: number;
  
  const animate = (timestamp: number) => {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    
    const position = amplitude * Math.sin((elapsed / duration) * (2 * Math.PI));
    element.style.transform = `translateY(${position}px)`;
    
    if (elapsed >= duration) {
      start = timestamp;
    }
    
    animationFrameId = requestAnimationFrame(animate);
  };
  
  animationFrameId = requestAnimationFrame(animate);
  
  return () => {
    cancelAnimationFrame(animationFrameId);
  };
};
