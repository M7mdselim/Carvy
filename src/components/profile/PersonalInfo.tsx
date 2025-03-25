
import { useState } from 'react';
import { Input } from '../../components/ui/input';
import { PhoneIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';
import { ProfileData } from '../../types';

interface PersonalInfoProps {
  user: User;
  profile: ProfileData;
}

export function PersonalInfo({ user, profile }: PersonalInfoProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdatePhoneNumber = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.auth.updateUser({
        data: { phone_number: phoneNumber }
      });
      
      if (error) throw error;
      
      toast.success(t('phoneUpdated'));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating phone number:', error);
      toast.error(t('phoneUpdateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setPhoneNumber(profile?.phoneNumber || '');
  };

  return (
    <div className="py-4">
      <h2 className="text-lg font-medium text-gray-900">{t('personalInformation')}</h2>
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">{t('firstName')}</p>
            <p className="mt-1 text-md text-gray-900">{profile?.firstName || t('notProvided')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t('lastName')}</p>
            <p className="mt-1 text-md text-gray-900">{profile?.lastName || t('notProvided')}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{t('emailAddress')}</p>
          <p className="mt-1 text-md text-gray-900">{user.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{t('phoneNumber')}</p>
          {isEditing ? (
            <div className="mt-2 flex items-end gap-2">
              <div className="flex-1">
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <button
                onClick={handleUpdatePhoneNumber}
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? '...' : t('saveChanges')}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                {t('cancel')}
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between">
              <p className="text-md text-gray-900">{profile?.phoneNumber || t('notProvided')}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <PhoneIcon className="h-4 w-4 mr-1" />
                {t('updatePhoneNumber')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
