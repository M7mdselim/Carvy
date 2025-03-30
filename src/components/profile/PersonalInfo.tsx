import { useState } from 'react';
import { Input } from '../../components/ui/input';
import { PhoneIcon, PencilIcon } from '@heroicons/react/24/outline';
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
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.auth.updateUser({
        data: { phone_number: phoneNumber, first_name: firstName, last_name: lastName }
      });
      
      if (error) throw error;
      
      toast.success(t('profileUpdated'));
      setIsEditingPhone(false);
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profileUpdateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setIsEditingPhone(false);
    setIsEditingName(false);
    setPhoneNumber(profile?.phoneNumber || '');
    setFirstName(profile?.firstName || '');
    setLastName(profile?.lastName || '');
  };

  return (
    <div className="py-4">
      <h2 className="text-lg font-medium text-gray-900">{t('personalInformation')}</h2>
      <div className="mt-4 space-y-3">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">{t('firstName')}</p>
            {isEditingName ? (
              <Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            ) : (
              <p className="mt-1 text-md text-gray-900">{profile?.firstName || t('notProvided')}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{t('lastName')}</p>
            {isEditingName ? (
              <Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            ) : (
              <p className="mt-1 text-md text-gray-900">{profile?.lastName || t('notProvided')}</p>
            )}
          </div>
        </div>
        {!isEditingName && (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center mt-2"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            {t('updateName')}
          </button>
        )}

        {/* Email */}
        <div>
          <p className="text-sm font-medium text-gray-500">{t('emailAddress')}</p>
          <p className="mt-1 text-md text-gray-900">{user.email}</p>
        </div>

        {/* Phone Number */}
        <div>
          <p className="text-sm font-medium text-gray-500">{t('phoneNumber')}</p>
          {isEditingPhone ? (
            <Input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          ) : (
            <p className="mt-1 text-md text-gray-900">{profile?.phoneNumber || t('notProvided')}</p>
          )}
          {!isEditingPhone && (
            <button
              onClick={() => setIsEditingPhone(true)}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center mt-2"
            >
              <PhoneIcon className="h-4 w-4 mr-1" />
              {t('updatePhoneNumber')}
            </button>
          )}
        </div>

        {/* Save / Cancel Buttons */}
        {(isEditingPhone || isEditingName) && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleUpdateProfile}
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
        )}
      </div>
    </div>
  );
}