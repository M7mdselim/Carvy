
import React, { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

// Define types for cities and areas
interface City {
  id: string;
  name: string;
}

interface Area {
  id: string;
  name: string;
  city_id: string;
}

interface AddressFormData {
  name: string;
  street_address: string;
  apartment: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

interface AddressFormProps {
  formData: AddressFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (field: string, value: string) => void;
  onCheckboxChange: (checked: boolean) => void;
  isEditMode?: boolean;
  isDefaultDisabled?: boolean;
}

export function AddressForm({ 
  formData, 
  onChange,
  onSelectChange,
  onCheckboxChange, 
  isEditMode = false,
  isDefaultDisabled = false
}: AddressFormProps) {
  const { t } = useLanguage();
  const prefix = isEditMode ? 'edit_' : '';
  
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch cities and areas
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      
      // Fetch cities
      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select('*')
        .order('name');
      
      if (citiesError) {
        console.error('Error fetching cities:', citiesError);
      } else {
        setCities(citiesData || []);
      }
      
      // Fetch areas
      const { data: areasData, error: areasError } = await supabase
        .from('areas')
        .select('*')
        .order('name');
      
      if (areasError) {
        console.error('Error fetching areas:', areasError);
      } else {
        setAreas(areasData || []);
      }
      
      setLoading(false);
    };
    
    fetchLocations();
  }, []);
  
  // Filter areas based on selected city
  useEffect(() => {
    if (formData.city) {
      const cityObj = cities.find(c => c.id === formData.city);
      if (cityObj) {
        const filtered = areas.filter(area => area.city_id === cityObj.id);
        setFilteredAreas(filtered);
      }
    } else {
      setFilteredAreas([]);
    }
  }, [formData.city, cities, areas]);

  // Handle value change with city name
  const handleCityChange = (value: string) => {
    onSelectChange('city', value);
  };

  // Handle area change
  const handleAreaChange = (value: string) => {
    onSelectChange('state', value);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}name`}>{t('addressName')}</Label>
        <Input
          id={`${prefix}name`}
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder={t('addressName')}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}street_address`}>{t('streetAddress')}</Label>
        <Input
          id={`${prefix}street_address`}
          name="street_address"
          value={formData.street_address}
          onChange={onChange}
          placeholder={t('streetAddress')}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}apartment`}>{t('apartment')}</Label>
        <Input
          id={`${prefix}apartment`}
          name="apartment"
          value={formData.apartment}
          onChange={onChange}
          placeholder={t('apartment')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}city`}>{t('city')}</Label>
          <Select
            value={formData.city}
            onValueChange={handleCityChange}
            disabled={loading}
          >
            <SelectTrigger id={`${prefix}city`}>
              <SelectValue placeholder={t('selectCity')} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}state`}>{t('area')}</Label>
          <Select
            value={formData.state}
            onValueChange={handleAreaChange}
            disabled={loading || !formData.city}
          >
            <SelectTrigger id={`${prefix}state`}>
              <SelectValue placeholder={t('selectArea')} />
            </SelectTrigger>
            <SelectContent>
              {filteredAreas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}zip_code`}>{t('zipCode')}</Label>
        <Input
          id={`${prefix}zip_code`}
          name="zip_code"
          value={formData.zip_code}
          onChange={onChange}
          placeholder={t('zipCode')}
        />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id={`${prefix}is_default`}
          name="is_default"
          checked={formData.is_default}
          onCheckedChange={(checked) => onCheckboxChange(checked === true)}
          disabled={isDefaultDisabled}
        />
        <label
          htmlFor={`${prefix}is_default`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t('makeDefaultAddress')}
        </label>
      </div>
    </div>
  );
}
