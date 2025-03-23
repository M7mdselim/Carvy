
import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGoogleMapsAPI } from '../../hooks/useGoogleMapsAPI';
import { SearchResults } from './MapSearchResults';

interface GoogleMapProps {
  initialLocation: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function GoogleMap({ initialLocation, onLocationSelect }: GoogleMapProps) {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Use custom hook to load and manage Google Maps API
  const { isLoaded, loadError } = useGoogleMapsAPI();
  
  // Initialize map when component mounts and API is loaded
  useEffect(() => {
    if (!mapRef.current || !isLoaded || loadError) return;
    initializeMap();
  }, [mapRef.current, isLoaded, loadError]);
  
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;
    
    // Default to Cairo, Egypt if no initial location
    const center = initialLocation || { lat: 30.0444, lng: 31.2357 };
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      streetViewControl: false,
    });
    
    setMap(mapInstance);
    
    // Create marker if we have an initial location
    if (initialLocation) {
      createOrUpdateMarker(initialLocation, mapInstance);
    }
    
    // Add click event to map
    mapInstance.addListener('click', (e: any) => {
      const clickedPosition = e.latLng;
      createOrUpdateMarker(
        { lat: clickedPosition.lat(), lng: clickedPosition.lng() }, 
        mapInstance
      );
      onLocationSelect(clickedPosition.lat(), clickedPosition.lng());
    });
  };
  
  const createOrUpdateMarker = (position: { lat: number, lng: number }, mapInstance: any) => {
    if (marker) {
      // Move existing marker
      marker.setPosition(position);
    } else {
      // Create new marker
      const newMarker = new window.google.maps.Marker({
        position,
        map: mapInstance,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });
      
      newMarker.addListener('dragend', () => {
        const newPosition = newMarker.getPosition();
        onLocationSelect(newPosition.lat(), newPosition.lng());
      });
      
      setMarker(newMarker);
    }
  };
  
  // Handle search
  const handleSearch = () => {
    if (!map || !searchValue || !window.google) return;
    
    const service = new window.google.maps.places.PlacesService(map);
    service.textSearch({ query: searchValue }, (results: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setSearchResults(results.slice(0, 5));  // Limit to 5 results
      }
    });
  };
  
  const selectSearchResult = (place: any) => {
    if (!map || !window.google) return;
    
    map.setCenter(place.geometry.location);
    createOrUpdateMarker(
      {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      },
      map
    );
    
    onLocationSelect(
      place.geometry.location.lat(),
      place.geometry.location.lng()
    );
    
    setSearchResults([]);
    setSearchValue('');
  };
  
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation || !map) return;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        map.setCenter(pos);
        createOrUpdateMarker(pos, map);
        onLocationSelect(pos.lat, pos.lng);
      },
      () => {
        alert('Error: The Geolocation service failed.');
      }
    );
  };
  
  // Show error if Google Maps failed to load
  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">{t('googleMapsError')}</p>
          <p className="text-sm text-gray-600">{loadError}</p>
        </div>
      </div>
    );
  }
  
  // Show loading state while Maps API loads
  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 left-2 right-2 z-10 flex gap-2">
        <div className="relative flex-1">
          <Input
            className="pr-10"
            placeholder={t('searchLocation')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
          </button>
          
          <SearchResults 
            results={searchResults} 
            onSelect={selectSearchResult} 
          />
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleUseCurrentLocation}
          title={t('useMyLocation')}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
      
      <div ref={mapRef} className={`w-full h-full ${isRtl ? 'rtl' : 'ltr'}`} />
      
      <div className="absolute bottom-2 left-2 right-2 z-10 flex justify-center">
        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {t('clickOnMapOrDragMarker')}
        </div>
      </div>
    </div>
  );
}
