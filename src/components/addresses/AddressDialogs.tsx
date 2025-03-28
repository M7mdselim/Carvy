
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { SavedAddress } from '../../hooks/useSavedAddresses';
import { AddressForm } from './AddressForm';
import { useLanguage } from '../../contexts/LanguageContext';
import { ScrollArea } from '../ui/scroll-area';

interface AddressFormData {
  name: string;
  street_address: string;
  apartment: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
}

interface AddAddressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AddressFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function AddAddressDialog({
  isOpen,
  onOpenChange,
  formData,
  onInputChange,
  onCheckboxChange,
  onSubmit
}: AddAddressDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] bg-white">
        <DialogHeader>
          <DialogTitle>{t('addNewAddress')}</DialogTitle>
          <DialogDescription>
            {t('addYourFirstAddress')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <form onSubmit={onSubmit}>
            <AddressForm 
              formData={formData} 
              onChange={onInputChange} 
              onCheckboxChange={onCheckboxChange} 
            />
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {t('save')}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface EditAddressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AddressFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isDefaultAddress: boolean;
}

export function EditAddressDialog({
  isOpen,
  onOpenChange,
  formData,
  onInputChange,
  onCheckboxChange,
  onSubmit,
  isDefaultAddress
}: EditAddressDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] bg-white">
        <DialogHeader>
          <DialogTitle>{t('editAddress')}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <form onSubmit={onSubmit}>
            <AddressForm 
              formData={formData} 
              onChange={onInputChange} 
              onCheckboxChange={onCheckboxChange} 
              isEditMode={true}
              isDefaultDisabled={isDefaultAddress}
            />
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {t('save')}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteAddressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  address: SavedAddress | null;
  onDelete: () => Promise<void>;
}

export function DeleteAddressDialog({
  isOpen,
  onOpenChange,
  address,
  onDelete
}: DeleteAddressDialogProps) {
  const { t } = useLanguage();

  if (!address) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>{t('deleteAddress')}</DialogTitle>
          <DialogDescription>
            {t('confirmDeleteAddress')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="text-sm text-gray-700 border rounded-md p-3 bg-gray-50">
            <p className="font-medium">{address.name}</p>
            <p>{address.street_address}</p>
            {address.apartment && <p>{address.apartment}</p>}
            <p>
              {address.city}
              {address.state && `, ${address.state}`}
              {address.zip_code && ` ${address.zip_code}`}
            </p>
            <p>{address.country}</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('no')}
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onDelete}
          >
            {t('yes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
