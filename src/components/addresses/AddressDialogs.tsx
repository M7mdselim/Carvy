
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { AddressForm } from './AddressForm';
import { SavedAddress } from '../../hooks/useSavedAddresses';

interface AddressFormData {
  name: string;
  street_address: string;
  apartment: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

interface AddAddressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AddressFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (field: string, value: string) => void;
  onCheckboxChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddAddressDialog({
  isOpen,
  onOpenChange,
  formData,
  onInputChange,
  onSelectChange,
  onCheckboxChange,
  onSubmit
}: AddAddressDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{t('addNewAddress')}</DialogTitle>
            <DialogDescription>
              {t('enterAddressDetails')}
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            formData={formData}
            onChange={onInputChange}
            onSelectChange={onSelectChange}
            onCheckboxChange={onCheckboxChange}
          />
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit">{t('save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditAddressDialogProps extends AddAddressDialogProps {
  isDefaultAddress: boolean;
}

export function EditAddressDialog({
  isOpen,
  onOpenChange,
  formData,
  onInputChange,
  onSelectChange,
  onCheckboxChange,
  onSubmit,
  isDefaultAddress
}: EditAddressDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{t('editAddress')}</DialogTitle>
            <DialogDescription>
              {t('updateAddressDetails')}
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            formData={formData}
            onChange={onInputChange}
            onSelectChange={onSelectChange}
            onCheckboxChange={onCheckboxChange}
            isEditMode={true}
            isDefaultDisabled={isDefaultAddress}
          />
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit">{t('save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteAddressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  address: SavedAddress | null;
  onDelete: () => void;
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('deleteAddress')}</DialogTitle>
          <DialogDescription>
            {t('confirmDeleteAddress')}
          </DialogDescription>
        </DialogHeader>
        <Alert variant="destructive">
          <AlertDescription>
            {address.is_default ? t('cannotDeleteDefaultAddress') : t('deletionIsPermanent')}
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('no')}
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={address.is_default}>
            {t('yes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
