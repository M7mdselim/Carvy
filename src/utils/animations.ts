
/**
 * Animation utility functions for handling scroll-based animations
 */

export const observeElements = () => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  };

  const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(handleIntersect, observerOptions);
  
  const elementsToReveal = document.querySelectorAll('.reveal-on-scroll');
  const staggeredElements = document.querySelectorAll('.staggered-fade-in');
  
  elementsToReveal.forEach((element) => {
    observer.observe(element);
  });
  
  staggeredElements.forEach((element) => {
    observer.observe(element);
  });
  
  return observer;
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
