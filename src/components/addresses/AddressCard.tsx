
import React from 'react';
import { SavedAddress } from '../../hooks/useSavedAddresses';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Pencil, Trash2, Home } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AddressCardProps {
  address: SavedAddress;
  onEdit: (address: SavedAddress) => void;
  onDelete: (address: SavedAddress) => void;
  onSetDefault: (addressId: string) => void;
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const { t } = useLanguage();

  return (
    <Card className={`overflow-hidden ${address.is_default ? 'border-indigo-500 border-2' : ''}`}>
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
              onClick={() => onEdit(address)}
              className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(address)}
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
            onClick={() => onSetDefault(address.id)}
            className="w-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300"
          >
            <Home className="h-4 w-4 mr-2" />
            {t('makeDefaultAddress')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
