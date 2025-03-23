
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useSavedAddresses, SavedAddress } from '../hooks/useSavedAddresses';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../components/ui/dialog';
import { MapPin, Plus, Pencil, Trash2, Check, Home } from 'lucide-react';
import { toast } from 'sonner';

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
    country: 'Egypt',
    phone_number: '',
    is_default: false
  });

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
      country: 'Egypt',
      phone_number: '',
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
      country: address.country,
      phone_number: address.phone_number || '',
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

  return (
    <div className={`min-h-screen bg-gray-50 py-12 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('savedAddresses')}</h1>
          <Button onClick={handleAddDialogOpen} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('addNewAddress')}
          </Button>
        </div>

        {addresses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noSavedAddresses')}</h3>
              <p className="text-gray-500 mb-6">{t('addYourFirstAddress')}</p>
              <Button onClick={handleAddDialogOpen}>
                {t('addNewAddress')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <Card key={address.id} className={`overflow-hidden ${address.is_default ? 'border-indigo-500 border-2' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{address.name}</CardTitle>
                      {address.is_default && (
                        <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {t('defaultAddress')}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditDialogOpen(address)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDialogOpen(address)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-1 text-sm text-gray-700">
                    <p className="font-medium">{address.street_address}</p>
                    {address.apartment && <p>{address.apartment}</p>}
                    <p>{address.city}{address.state && `, ${address.state}`}{address.zip_code && ` ${address.zip_code}`}</p>
                    <p>{address.country}</p>
                    {address.phone_number && <p className="pt-1">{address.phone_number}</p>}
                  </div>
                </CardContent>
                {!address.is_default && (
                  <CardFooter className="pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefaultAddress(address.id)}
                      className="w-full"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      {t('makeDefaultAddress')}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addNewAddress')}</DialogTitle>
            <DialogDescription>
              {t('addYourFirstAddress')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAddress}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('addressName')}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('addressName')}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="street_address">{t('streetAddress')}</Label>
                <Input
                  id="street_address"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleInputChange}
                  placeholder={t('streetAddress')}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apartment">{t('apartment')}</Label>
                <Input
                  id="apartment"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  placeholder={t('apartment')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">{t('city')}</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder={t('city')}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">{t('state')}</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder={t('state')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="zip_code">{t('zipCode')}</Label>
                  <Input
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    placeholder={t('zipCode')}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">{t('country')}</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder={t('country')}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone_number">{t('phoneNumber')}</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder={t('phoneNumber')}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_default: checked === true }))
                  }
                />
                <label
                  htmlFor="is_default"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('makeDefaultAddress')}
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit">{t('save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('editAddress')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateAddress}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_name">{t('addressName')}</Label>
                <Input
                  id="edit_name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('addressName')}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_street_address">{t('streetAddress')}</Label>
                <Input
                  id="edit_street_address"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleInputChange}
                  placeholder={t('streetAddress')}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_apartment">{t('apartment')}</Label>
                <Input
                  id="edit_apartment"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  placeholder={t('apartment')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_city">{t('city')}</Label>
                  <Input
                    id="edit_city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder={t('city')}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_state">{t('state')}</Label>
                  <Input
                    id="edit_state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder={t('state')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_zip_code">{t('zipCode')}</Label>
                  <Input
                    id="edit_zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    placeholder={t('zipCode')}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_country">{t('country')}</Label>
                  <Input
                    id="edit_country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder={t('country')}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_phone_number">{t('phoneNumber')}</Label>
                <Input
                  id="edit_phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder={t('phoneNumber')}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="edit_is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_default: checked === true }))
                  }
                  disabled={currentAddress?.is_default}
                />
                <label
                  htmlFor="edit_is_default"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('makeDefaultAddress')}
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit">{t('save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('deleteAddress')}</DialogTitle>
            <DialogDescription>
              {t('confirmDeleteAddress')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentAddress && (
              <div className="text-sm text-gray-700 border rounded-md p-3 bg-gray-50">
                <p className="font-medium">{currentAddress.name}</p>
                <p>{currentAddress.street_address}</p>
                {currentAddress.apartment && <p>{currentAddress.apartment}</p>}
                <p>
                  {currentAddress.city}
                  {currentAddress.state && `, ${currentAddress.state}`}
                  {currentAddress.zip_code && ` ${currentAddress.zip_code}`}
                </p>
                <p>{currentAddress.country}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('no')}
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteAddress}
            >
              {t('yes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
