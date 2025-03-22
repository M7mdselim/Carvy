
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/input'
import { UserIcon, ShoppingBagIcon, CreditCardIcon, ArrowRightIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '../contexts/LanguageContext'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, getUserProfile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!user && !isLoading) {
      navigate('/login');
    }
    
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [user, navigate, isLoading]);
  
  useEffect(() => {
    if (user) {
      const profile = getUserProfile();
      if (profile) {
        setPhoneNumber(profile.phoneNumber || '');
      }
    }
  }, [user, getUserProfile]);
  
  const userProfile = getUserProfile();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-indigo-600 px-6 py-8">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-indigo-300 flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-indigo-700" />
              </div>
              <div className="ml-6 text-white">
                <h1 className="text-2xl font-bold">
                  {userProfile?.firstName} {userProfile?.lastName}
                </h1>
                <p className="text-indigo-100">{user.email}</p>
                <p className="text-indigo-100 mt-1">{userProfile?.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Profile Sections */}
          <div className="p-6 divide-y divide-gray-200">
            <div className="py-4">
              <h2 className="text-lg font-medium text-gray-900">{t('personalInformation')}</h2>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('firstName')}</p>
                    <p className="mt-1 text-md text-gray-900">{userProfile?.firstName || t('notProvided')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('lastName')}</p>
                    <p className="mt-1 text-md text-gray-900">{userProfile?.lastName || t('notProvided')}</p>
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
                        onClick={() => {
                          setIsEditing(false);
                          const profile = getUserProfile();
                          if (profile) {
                            setPhoneNumber(profile.phoneNumber || '');
                          }
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-md text-gray-900">{userProfile?.phoneNumber || t('notProvided')}</p>
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

            <div className="py-4">
              <h2 className="text-lg font-medium text-gray-900">{t('quickActions')}</h2>
              <div className="mt-4 space-y-2">
                <button 
                  onClick={() => navigate('/cart')}
                  className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition"
                >
                  <div className="flex items-center">
                    <ShoppingBagIcon className="h-5 w-5 text-gray-500" />
                    <span className="ml-3 text-gray-900">{t('myCart')}</span>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </button>
                
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition"
                >
                  <div className="flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-gray-500" />
                    <span className="ml-3 text-gray-900">{t('checkout')}</span>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="py-4 flex justify-end">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
