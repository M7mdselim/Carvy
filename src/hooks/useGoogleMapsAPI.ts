
import { useState, useEffect } from 'react';

interface GoogleMapsAPIHook {
  isLoaded: boolean;
  loadError: string | null;
}

export function useGoogleMapsAPI(): GoogleMapsAPIHook {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }
    
    // Check if the script is already being loaded
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      // Wait for the existing script to load
      const handleScriptLoad = () => setIsLoaded(true);
      const handleScriptError = () => setLoadError('Failed to load Google Maps API');
      
      existingScript.addEventListener('load', handleScriptLoad);
      existingScript.addEventListener('error', handleScriptError);
      
      return () => {
        existingScript.removeEventListener('load', handleScriptLoad);
        existingScript.removeEventListener('error', handleScriptError);
      };
    }
    
    // If not loaded and not loading, create a script tag and load it
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setLoadError('Failed to load Google Maps API');
    
    document.head.appendChild(script);
    
    return () => {
      // We don't remove the script on unmount as other components might need it
      if (script) {
        script.removeEventListener('load', () => setIsLoaded(true));
        script.removeEventListener('error', () => setLoadError('Failed to load Google Maps API'));
      }
    };
  }, []);
  
  return { isLoaded, loadError };
}
