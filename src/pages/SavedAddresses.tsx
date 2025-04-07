
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useSavedAddresses, SavedAddress } from '../hooks/useSavedAddresses';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AddressCard } from '../components/addresses/AddressCard';
import { EmptyAddressList } from '../components/addresses/EmptyAddressList';
import { AddAddressDialog, EditAddressDialog, DeleteAddressDialog } from '../components/addresses/AddressDialogs';
import { supabase } from '../lib/supabase';

// Define types for city and area names for display purposes
interface CityData {
  id: string;
  name: string;
}

interface AreaData {
  id: string;
  name: string;
}

export default function SavedAddresses() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addresses, loading, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useSavedAddresses();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<SavedAddress | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    street_address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
    is_default: false
  });
  
  // Store city and area data for display purposes
  const [citiesMap, setCitiesMap] = useState<Record<string, string>>({});
  const [areasMap, setAreasMap] = useState<Record<string, string>>({});
  
  // Fetch cities and areas for display names
  useEffect(() => {
    const fetchLocationData = async () => {
      // Fetch cities
      const { data: cities } = await supabase
        .from('cities')
        .select('id, name');
      
      if (cities) {
        const cityMap: Record<string, string> = {};
        cities.forEach((city: CityData) => {
          cityMap[city.id] = city.name;
        });
        setCitiesMap(cityMap);
      }
      
      // Fetch areas
      const { data: areas } = await supabase
        .from('areas')
        .select('id, name');
      
      if (areas) {
        const areaMap: Record<string, string> = {};
        areas.forEach((area: AreaData) => {
          areaMap[area.id] = area.name;
        });
        setAreasMap(areaMap);
      }
    };
    
    fetchLocationData();
  }, []);

  // Check if the user is logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const resetForm = () => {
    setFormData({
      name: '',
      street_address: '',
      apartment: '',
      city: '',
      state: '',
      zip_code: '',
      is_default: false
    });
  };

  const handleAddDialogOpen = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditDialogOpen = (address: SavedAddress) => {
    setCurrentAddress(address);
    setFormData({
      name: address.name,
      street_address: address.street_address,
      apartment: address.apartment || '',
      city: address.city,
      state: address.state || '',
      zip_code: address.zip_code || '',
      is_default: address.is_default
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteDialogOpen = (address: SavedAddress) => {
    setCurrentAddress(address);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // If city changes, reset the area/state
    if (field === 'city') {
      setFormData(prev => ({
        ...prev,
        state: ''
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_default: checked
    }));
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addAddress(formData);
    if (result) {
      toast.success(t('addressSaved'));
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAddress) return;
    
    const result = await updateAddress(currentAddress.id, formData);
    if (result) {
      toast.success(t('addressSaved'));
      setIsEditDialogOpen(false);
      setCurrentAddress(null);
    }
  };

  const handleDeleteAddress = async () => {
    if (!currentAddress) return;
    
    const result = await deleteAddress(currentAddress.id);
    if (result) {
      toast.success(t('addressDeleted'));
      setIsDeleteDialogOpen(false);
      setCurrentAddress(null);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const result = await setDefaultAddress(addressId);
    if (result) {
      toast.success(t('defaultAddressChanged'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const isRtl = language === 'ar';

  // Helper function to get display names from maps
  const getDisplayAddress = (address: SavedAddress) => {
    const cityName = citiesMap[address.city] || address.city;
    const areaName = areasMap[address.state] || address.state;
    
    return {
      ...address,
      cityDisplay: cityName,
      areaDisplay: areaName
    };
  };

  return (
    <div className={`min-h-screen bg-gray-50 py-12 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{t('savedAddresses')}</h1>
          <Button onClick={handleAddDialogOpen} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            {t('addNewAddress')}
          </Button>
        </div>

        {addresses.length === 0 ? (
          <EmptyAddressList onAddAddress={handleAddDialogOpen} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <AddressCard 
                key={address.id}
                address={getDisplayAddress(address)}
                onEdit={handleEditDialogOpen}
                onDelete={handleDeleteDialogOpen}
                onSetDefault={handleSetDefaultAddress}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddAddressDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onCheckboxChange={handleCheckboxChange}
        onSubmit={handleAddAddress}
      />

      <EditAddressDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onCheckboxChange={handleCheckboxChange}
        onSubmit={handleUpdateAddress}
        isDefaultAddress={currentAddress?.is_default || false}
      />

      <DeleteAddressDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        address={currentAddress}
        onDelete={handleDeleteAddress}
      />
    </div>
  );
}
