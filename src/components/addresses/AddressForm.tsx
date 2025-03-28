
import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useLanguage } from '../../contexts/LanguageContext';

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

interface AddressFormProps {
  formData: AddressFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
  isEditMode?: boolean;
  isDefaultDisabled?: boolean;
}

export function AddressForm({ 
  formData, 
  onChange, 
  onCheckboxChange, 
  isEditMode = false,
  isDefaultDisabled = false
}: AddressFormProps) {
  const { t } = useLanguage();
  const prefix = isEditMode ? 'edit_' : '';

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
          <Input
            id={`${prefix}city`}
            name="city"
            value={formData.city}
            onChange={onChange}
            placeholder={t('city')}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}state`}>{t('state')}</Label>
          <Input
            id={`${prefix}state`}
            name="state"
            value={formData.state}
            onChange={onChange}
            placeholder={t('state')}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
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
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}country`}>{t('country')}</Label>
          <Input
            id={`${prefix}country`}
            name="country"
            value={formData.country}
            onChange={onChange}
            placeholder={t('country')}
            required
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${prefix}phone_number`}>{t('phoneNumber')}</Label>
        <Input
          id={`${prefix}phone_number`}
          name="phone_number"
          value={formData.phone_number}
          onChange={onChange}
          placeholder={t('phoneNumber')}
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
