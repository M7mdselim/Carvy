
import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useLanguage } from '../../contexts/LanguageContext';

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
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      // If not loaded, create a script tag and load it
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    }
    
    return () => {
      // Clean up marker and map instances if component unmounts
      if (marker) marker.setMap(null);
    };
  }, [mapRef.current]);
  
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
      const newMarker = new window.google.maps.Marker({
        position: initialLocation,
        map: mapInstance,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });
      
      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        onLocationSelect(position.lat(), position.lng());
      });
      
      setMarker(newMarker);
    }
    
    // Add click event to map
    mapInstance.addListener('click', (e: any) => {
      const clickedPosition = e.latLng;
      
      if (marker) {
        // Move existing marker
        marker.setPosition(clickedPosition);
      } else {
        // Create new marker
        const newMarker = new window.google.maps.Marker({
          position: clickedPosition,
          map: mapInstance,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });
        
        newMarker.addListener('dragend', () => {
          const position = newMarker.getPosition();
          onLocationSelect(position.lat(), position.lng());
        });
        
        setMarker(newMarker);
      }
      
      onLocationSelect(clickedPosition.lat(), clickedPosition.lng());
    });
  };
  
  // Handle search
  const handleSearch = () => {
    if (!map || !searchValue) return;
    
    const service = new window.google.maps.places.PlacesService(map);
    service.textSearch({ query: searchValue }, (results: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setSearchResults(results.slice(0, 5));  // Limit to 5 results
      }
    });
  };
  
  const selectSearchResult = (place: any) => {
    map.setCenter(place.geometry.location);
    
    if (marker) {
      marker.setPosition(place.geometry.location);
    } else {
      const newMarker = new window.google.maps.Marker({
        position: place.geometry.location,
        map: map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });
      
      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        onLocationSelect(position.lat(), position.lng());
      });
      
      setMarker(newMarker);
    }
    
    onLocationSelect(
      place.geometry.location.lat(),
      place.geometry.location.lng()
    );
    
    setSearchResults([]);
    setSearchValue('');
  };
  
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          map.setCenter(pos);
          
          if (marker) {
            marker.setPosition(pos);
          } else {
            const newMarker = new window.google.maps.Marker({
              position: pos,
              map: map,
              draggable: true,
              animation: window.google.maps.Animation.DROP,
            });
            
            newMarker.addListener('dragend', () => {
              const markerPos = newMarker.getPosition();
              onLocationSelect(markerPos.lat(), markerPos.lng());
            });
            
            setMarker(newMarker);
          }
          
          onLocationSelect(pos.lat, pos.lng);
        },
        () => {
          alert('Error: The Geolocation service failed.');
        }
      );
    } else {
      alert('Error: Your browser does not support geolocation.');
    }
  };
  
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
          
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md max-h-48 overflow-y-auto">
              {searchResults.map((result, i) => (
                <div
                  key={i}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => selectSearchResult(result)}
                >
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm text-gray-600">{result.formatted_address}</div>
                </div>
              ))}
            </div>
          )}
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
