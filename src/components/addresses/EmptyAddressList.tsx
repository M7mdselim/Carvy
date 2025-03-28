
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface EmptyAddressListProps {
  onAddAddress: () => void;
}

export function EmptyAddressList({ onAddAddress }: EmptyAddressListProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <MapPin className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noSavedAddresses')}</h3>
        <p className="text-gray-500 mb-6">{t('addYourFirstAddress')}</p>
        <Button onClick={onAddAddress} className="bg-indigo-600 hover:bg-indigo-700">
          {t('addNewAddress')}
        </Button>
      </CardContent>
    </Card>
  );
}
