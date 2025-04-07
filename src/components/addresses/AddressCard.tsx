
import { Edit, Trash2, MapPin, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { SavedAddress } from '../../hooks/useSavedAddresses';
import { useLanguage } from '../../contexts/LanguageContext';

interface EnhancedAddress extends SavedAddress {
  cityDisplay?: string;
  areaDisplay?: string;
}

interface AddressCardProps {
  address: EnhancedAddress;
  onEdit: (address: SavedAddress) => void;
  onDelete: (address: SavedAddress) => void;
  onSetDefault: (addressId: string) => void;
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const { t } = useLanguage();
  
  // Use display names if available, otherwise fall back to IDs
  const cityName = address.cityDisplay || address.city;
  const areaName = address.areaDisplay || address.state || '';

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${address.is_default ? 'border-indigo-500 shadow-md' : 'hover:shadow-md'}`}>
      <CardHeader className="py-3 px-4 bg-gray-50 flex flex-row justify-between items-center">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-indigo-600 mr-2" />
          <h3 className="font-medium text-gray-900">{address.name}</h3>
        </div>
        {address.is_default && (
          <Badge variant="default" className="bg-indigo-600">
            {t('defaultAddress')}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-700">{address.street_address}</p>
          {address.apartment && (
            <p className="text-sm text-gray-700">{t('apartment')}: {address.apartment}</p>
          )}
          <p className="text-sm text-gray-700">
            {areaName && `${areaName}, `}{cityName}
            {address.zip_code && `, ${address.zip_code}`}
          </p>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between">
        <div>
          {!address.is_default && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onSetDefault(address.id)}
              className="text-gray-600 hover:text-indigo-600"
            >
              <Check className="h-4 w-4 mr-1" />
              {t('setAsDefault')}
            </Button>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(address)}
            className="text-gray-600 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(address)}
            className="text-gray-600 hover:text-red-600"
            disabled={address.is_default}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
