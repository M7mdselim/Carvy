
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { MapPin, MapIcon, Navigation } from 'lucide-react';
import { Address, City, Area } from '../../types';
import { GoogleMap } from './GoogleMap';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';

interface AddressFormProps {
  onAddressSelect: (address: Address) => void;
  selectedAddress?: Address | null;
}

export function AddressForm({ onAddressSelect, selectedAddress }: AddressFormProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<Area[]>([]);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    recipient_name: '',
    street: '',
    building: '',
    floor: '',
    apartment: '',
    district: '',
    city: '',
    area: '',
    postal_code: '',
    phone: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Fetch user's addresses
  useEffect(() => {
    async function fetchAddresses() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });
        
        if (error) throw error;
        
        setAddresses(data || []);
        
        // Pre-select the default address if available and no address was previously selected
        if (data && data.length > 0 && !selectedAddress) {
          const defaultAddress = data.find(addr => addr.is_default) || data[0];
          setSelectedId(defaultAddress.id);
          onAddressSelect(defaultAddress);
        } else if (selectedAddress) {
          setSelectedId(selectedAddress.id);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchCitiesAndAreas() {
      try {
        // Fetch cities
        const { data: citiesData, error: citiesError } = await supabase
          .from('cities')
          .select('*')
          .order('name');
        
        if (citiesError) throw citiesError;
        setCities(citiesData || []);
        
        // Fetch all areas
        const { data: areasData, error: areasError } = await supabase
          .from('areas')
          .select('*')
          .order('name');
        
        if (areasError) throw areasError;
        setAreas(areasData || []);
      } catch (error) {
        console.error('Error fetching cities and areas:', error);
      }
    }
    
    fetchAddresses();
    fetchCitiesAndAreas();
  }, [user, selectedAddress]);

  // Filter areas based on selected city
  useEffect(() => {
    if (newAddress.city) {
      const selectedCity = cities.find(city => city.name === newAddress.city);
      if (selectedCity) {
        const cityAreas = areas.filter(area => area.city_id === selectedCity.id);
        setFilteredAreas(cityAreas);
      }
    } else {
      setFilteredAreas([]);
    }
  }, [newAddress.city, cities, areas]);

  const handleSelectAddress = (addressId: string) => {
    const selected = addresses.find(addr => addr.id === addressId);
    if (selected) {
      setSelectedId(addressId);
      onAddressSelect(selected);
    }
  };

  const handleNewAddressChange = (field: keyof Address, value: string) => {
    setNewAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleCityChange = (value: string) => {
    setNewAddress(prev => ({ ...prev, city: value, area: '' }));
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    
    setSavingAddress(true);
    
    try {
      // Validate required fields
      const requiredFields = ['recipient_name', 'phone', 'street', 'building', 'district', 'city'];
      const missingFields = requiredFields.filter(field => !newAddress[field as keyof Address]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }
      
      // Include location data if available
      const locationData = location ? {
        latitude: location.lat,
        longitude: location.lng
      } : {};
      
      const { data, error } = await supabase
        .from('addresses')
        .insert([
          {
            user_id: user.id,
            recipient_name: newAddress.recipient_name,
            street: newAddress.street,
            building: newAddress.building,
            floor: newAddress.floor || '',
            apartment: newAddress.apartment || '',
            district: newAddress.district,
            city: newAddress.city,
            area: newAddress.area || '',
            postal_code: newAddress.postal_code || '',
            phone: newAddress.phone,
            is_default: addresses.length === 0, // Make default if it's the first address
            ...locationData
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      setAddresses([...addresses, data]);
      setSelectedId(data.id);
      onAddressSelect(data);
      
      // Reset form
      setNewAddress({
        recipient_name: '',
        street: '',
        building: '',
        floor: '',
        apartment: '',
        district: '',
        city: '',
        area: '',
        postal_code: '',
        phone: '',
      });
      setAdditionalDetails('');
      setLocation(null);
      setShowMap(false);
    } catch (error) {
      console.error('Error saving address:', error);
      alert(error instanceof Error ? error.message : 'Error saving address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ lat, lng });
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div>;
  }

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Existing addresses */}
      {addresses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('savedAddresses')}</h3>
          <div className="grid grid-cols-1 gap-4">
            {addresses.map(address => (
              <div 
                key={address.id}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all duration-200
                  ${selectedId === address.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-gray-200 hover:bg-gray-50'}
                `}
                onClick={() => handleSelectAddress(address.id)}
              >
                <div className="flex justify-between">
                  <div className="font-medium">{address.recipient_name}</div>
                  {address.is_default && (
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                      {t('default')}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {address.building} {address.street}, {address.district}, {address.city}
                  {address.area && `, ${address.area}`}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {address.floor && `${t('floor')}: ${address.floor}, `}
                  {address.apartment && `${t('apartment')}: ${address.apartment}`}
                </div>
                <div className="text-sm text-gray-600 mt-1">{address.phone}</div>
                {address.latitude && address.longitude && (
                  <div className="flex items-center mt-2 text-xs text-green-600">
                    <MapPin className="h-3 w-3 mr-1" />
                    {t('locationSaved')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add new address form */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">{t('addNewAddress')}</h3>
        
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_name">{t('recipientName')} *</Label>
                <Input
                  id="recipient_name"
                  value={newAddress.recipient_name}
                  onChange={(e) => handleNewAddressChange('recipient_name', e.target.value)}
                  placeholder={t('fullName')}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{t('phoneNumber')} *</Label>
                <Input
                  id="phone"
                  value={newAddress.phone}
                  onChange={(e) => handleNewAddressChange('phone', e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="street">{t('streetName')} *</Label>
                <Input
                  id="street"
                  value={newAddress.street}
                  onChange={(e) => handleNewAddressChange('street', e.target.value)}
                  placeholder={t('streetNamePlaceholder')}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="building">{t('buildingNumber')} *</Label>
                <Input
                  id="building"
                  value={newAddress.building}
                  onChange={(e) => handleNewAddressChange('building', e.target.value)}
                  placeholder={t('buildingNumberPlaceholder')}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="floor">{t('floorNumber')}</Label>
                <Input
                  id="floor"
                  value={newAddress.floor}
                  onChange={(e) => handleNewAddressChange('floor', e.target.value)}
                  placeholder={t('floorNumberPlaceholder')}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apartment">{t('apartmentNumber')}</Label>
                <Input
                  id="apartment"
                  value={newAddress.apartment}
                  onChange={(e) => handleNewAddressChange('apartment', e.target.value)}
                  placeholder={t('apartmentNumberPlaceholder')}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="district">{t('district')} *</Label>
                <Input
                  id="district"
                  value={newAddress.district}
                  onChange={(e) => handleNewAddressChange('district', e.target.value)}
                  placeholder={t('districtPlaceholder')}
                  className="bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">{t('city')} *</Label>
                <Select
                  value={newAddress.city}
                  onValueChange={handleCityChange}
                >
                  <SelectTrigger id="city" className="bg-white">
                    <SelectValue placeholder={t('selectCity')} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="area">{t('area')}</Label>
                <Select
                  value={newAddress.area}
                  onValueChange={(value) => handleNewAddressChange('area', value)}
                  disabled={!newAddress.city}
                >
                  <SelectTrigger id="area" className="bg-white">
                    <SelectValue placeholder={t('selectArea')} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAreas.map(area => (
                      <SelectItem key={area.id} value={area.name}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="postal_code">{t('postalCode')} <span className="text-gray-400 text-xs">{t('optional')}</span></Label>
                <Input
                  id="postal_code"
                  value={newAddress.postal_code}
                  onChange={(e) => handleNewAddressChange('postal_code', e.target.value)}
                  placeholder={t('postalCodePlaceholder')}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="additional_details">{t('additionalDetails')} <span className="text-gray-400 text-xs">{t('optional')}</span></Label>
                <Textarea
                  id="additional_details"
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder={t('additionalDetailsPlaceholder')}
                  className="bg-white"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Map location picker */}
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2 w-full justify-center"
            onClick={() => setShowMap(!showMap)}
          >
            <MapPin className="h-4 w-4" />
            {showMap ? t('hideMap') : t('pickLocationOnMap')}
          </Button>
          
          {showMap && (
            <div className="mt-4 h-[400px] rounded-lg overflow-hidden border shadow-md">
              <GoogleMap onLocationSelect={handleLocationSelect} initialLocation={location} />
            </div>
          )}
          
          {location && (
            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <Navigation className="h-4 w-4" />
              {t('locationSelected')}
            </div>
          )}
        </div>
        
        <Button
          type="button"
          className="mt-6 w-full"
          onClick={handleSaveAddress}
          disabled={savingAddress}
        >
          {savingAddress ? t('saving') : t('saveAddress')}
        </Button>
      </div>
    </div>
  );
}
