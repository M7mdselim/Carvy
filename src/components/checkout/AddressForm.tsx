import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { MapPin, MapIcon, Navigation, Home, Building, Layers, DoorOpen, Map } from 'lucide-react';
import { Address, City, Area } from '../../types';
import { GoogleMap } from './GoogleMap';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/utils';

interface AddressFormProps {
  onAddressSelect: (address: Address) => void;
  selectedAddress?: Address | null;
  hidePhoneField?: boolean;
  onShippingCostChange?: (cost: number) => void;
}

export function AddressForm({ 
  onAddressSelect, 
  selectedAddress, 
  hidePhoneField = false,
  onShippingCostChange
}: AddressFormProps) {
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
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const getShippingCostForCity = async (cityName: string): Promise<number | null> => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('shipping_cost')
        .eq('name', cityName)
        .single();
      
      if (error) {
        console.error('Error fetching shipping cost:', error);
        return null;
      }
      
      return data?.shipping_cost ? Number(data.shipping_cost) : null;
    } catch (error) {
      console.error('Error fetching shipping cost:', error);
      return null;
    }
  };

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
        
        if (data && data.length > 0 && !selectedAddress) {
          const defaultAddress = data.find(addr => addr.is_default) || data[0];
          setSelectedId(defaultAddress.id);
          onAddressSelect(defaultAddress);
          if (defaultAddress.city && onShippingCostChange) {
            const cost = await getShippingCostForCity(defaultAddress.city);
            if (cost !== null) {
              onShippingCostChange(cost);
            }
          }
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
        const { data: citiesData, error: citiesError } = await supabase
          .from('cities')
          .select('*')
          .order('name');
        
        if (citiesError) throw citiesError;
        setCities(citiesData || []);
        
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
  }, [user, selectedAddress, onShippingCostChange]);

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

  const handleSelectAddress = async (addressId: string) => {
    const selected = addresses.find(addr => addr.id === addressId);
    if (selected) {
      setSelectedId(addressId);
      onAddressSelect(selected);
      if (selected.city && onShippingCostChange) {
        const cost = await getShippingCostForCity(selected.city);
        if (cost !== null) {
          onShippingCostChange(cost);
        }
      }
      setIsAddingNew(false);
    }
  };

  const handleNewAddressChange = (field: keyof Address, value: string) => {
    setNewAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleCityChange = async (value: string) => {
    setNewAddress(prev => ({ ...prev, city: value, area: '' }));
    
    if (onShippingCostChange) {
      const cost = await getShippingCostForCity(value);
      if (cost !== null) {
        onShippingCostChange(cost);
      }
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    
    setSavingAddress(true);
    
    try {
      const requiredFields = hidePhoneField 
        ? ['recipient_name', 'street', 'building', 'district', 'city']
        : ['recipient_name', 'phone', 'street', 'building', 'district', 'city'];
      
      const missingFields = requiredFields.filter(field => !newAddress[field as keyof Address]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }
      
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
            phone: newAddress.phone || '',
            is_default: addresses.length === 0,
            ...locationData
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      setAddresses([...addresses, data]);
      setSelectedId(data.id);
      onAddressSelect(data);
      
      if (data.city && onShippingCostChange) {
        const cost = await getShippingCostForCity(data.city);
        if (cost !== null) {
          onShippingCostChange(cost);
        }
      }
      
      toast.success(t('addressSaved'));
      
      resetNewAddressForm();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error instanceof Error ? error.message : 'Error saving address');
    } finally {
      setSavingAddress(false);
    }
  };

  const resetNewAddressForm = () => {
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
    setIsAddingNew(false);
  };

  const handleCancelAddingAddress = () => {
    resetNewAddressForm();
    
    if (selectedId && addresses.length > 0) {
      const selected = addresses.find(addr => addr.id === selectedId);
      if (selected && onShippingCostChange) {
        getShippingCostForCity(selected.city).then(cost => {
          if (cost !== null) {
            onShippingCostChange(cost);
          }
        });
      }
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ lat, lng });
    toast.success(t('locationSelected'));
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
      
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);
      
      if (error) throw error;
      
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === addressId
      })));
      
      toast.success(t('defaultAddressUpdated'));
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error(t('defaultAddressError'));
    }
  };

  const startAddingNewAddress = () => {
    setIsAddingNew(true);
  };

  const renderCityOptions = () => {
    return cities.map(city => (
      <SelectItem key={city.id} value={city.name}>
        {city.name}
      </SelectItem>
    ));
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div>;
  }

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl' : 'ltr'}`}>
      {addresses.length > 0 && !isAddingNew && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t('savedAddresses')}</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={startAddingNewAddress}
              className="text-sm"
            >
              {t('addNewAddress')}
            </Button>
          </div>
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
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={selectedId === address.id}
                      onChange={() => handleSelectAddress(address.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="font-medium">{address.recipient_name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {address.is_default && (
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                        {t('default')}
                      </span>
                    )}
                    {!address.is_default && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefaultAddress(address.id);
                        }}
                      >
                        {t('default')}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <Home className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span>
                      {address.building} {address.street}, {address.district}, {address.city}
                      {address.area && `, ${address.area}`}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span>
                      {address.floor && `${t('floor')}: ${address.floor}`}
                      {address.apartment && `, ${t('apartment')}: ${address.apartment}`}
                    </span>
                  </div>
                </div>
                
                {!hidePhoneField && address.phone && (
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{address.phone}</span>
                  </div>
                )}
                
                {address.latitude && address.longitude && (
                  <div className="flex items-center mt-2 text-xs text-green-600">
                    <Map className="h-3 w-3 mr-1" />
                    {t('locationSaved')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {(isAddingNew || addresses.length === 0) && (
        <div className={addresses.length > 0 ? "border-t pt-6" : ""}>
          <h3 className="text-lg font-medium mb-4">{addresses.length > 0 ? t('addNewAddress') : t('addAddress')}</h3>
          
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="recipient_name">{t('recipientName')} *</Label>
                  <Input
                    id="recipient_name"
                    value={newAddress.recipient_name}
                    onChange={(e) => handleNewAddressChange('recipient_name', e.target.value)}
                    placeholder={t('fullName')}
                    className="bg-white"
                    icon={<span className="text-gray-400">👤</span>}
                  />
                </div>
                
                {!hidePhoneField && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">{t('phoneNumber')}</Label>
                    <Input
                      id="phone"
                      value={newAddress.phone}
                      onChange={(e) => handleNewAddressChange('phone', e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="bg-white"
                      icon={<span className="text-gray-400">📞</span>}
                    />
                  </div>
                )}
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">{t('streetName')} *</Label>
                  <Input
                    id="street"
                    value={newAddress.street}
                    onChange={(e) => handleNewAddressChange('street', e.target.value)}
                    placeholder={t('streetNamePlaceholder')}
                    className="bg-white"
                    icon={<Home className="h-4 w-4 text-gray-400" />}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="district">{t('district')} *</Label>
                  <Input
                    id="district"
                    value={newAddress.district}
                    onChange={(e) => handleNewAddressChange('district', e.target.value)}
                    placeholder={t('districtPlaceholder')}
                    className="bg-white"
                    icon={<MapPin className="h-4 w-4 text-gray-400" />}
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
                    icon={<Building className="h-4 w-4 text-gray-400" />}
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
                    icon={<Layers className="h-4 w-4 text-gray-400" />}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apartment">{t('apartmentNumber')} <span className="text-gray-400 text-xs">{t('optional')}</span></Label>
                  <Input
                    id="apartment"
                    value={newAddress.apartment}
                    onChange={(e) => handleNewAddressChange('apartment', e.target.value)}
                    placeholder={t('apartmentNumberPlaceholder')}
                    className="bg-white"
                    icon={<DoorOpen className="h-4 w-4 text-gray-400" />}
                  />
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
                
                <div className="space-y-2">
                  <Label htmlFor="city">{t('city')} *</Label>
                  <Select
                    value={newAddress.city}
                    onValueChange={handleCityChange}
                  >
                    <SelectTrigger id="city" className="bg-white border-gray-300 hover:border-gray-400 shadow-sm">
                      <SelectValue placeholder={t('selectCity')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-lg">
                      {renderCityOptions()}
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
                    <SelectTrigger id="area" className="bg-white border-gray-300 hover:border-gray-400 shadow-sm">
                      <SelectValue placeholder={t('selectArea')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-lg">
                      {filteredAreas.map(area => (
                        <SelectItem key={area.id} value={area.name}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          
          <div className="mt-6 flex gap-4">
            {addresses.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancelAddingAddress}
              >
                {t('cancel')}
              </Button>
            )}
            <Button
              type="button"
              className={addresses.length > 0 ? "flex-1" : "w-full"}
              onClick={handleSaveAddress}
              disabled={savingAddress}
            >
              {savingAddress ? t('saving') : t('saveAddress')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
