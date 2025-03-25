
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../contexts/LanguageContext'
import { ProfileHeader } from '../components/profile/ProfileHeader'
import { PersonalInfo } from '../components/profile/PersonalInfo'
import { QuickActions } from '../components/profile/QuickActions'
import { LogoutButton } from '../components/profile/LogoutButton'
import { BalanceCredits } from '../components/profile/BalanceCredits'
import { CouponsList } from '../components/profile/CouponsList'
import { useProfileData } from '../hooks/useProfileData'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Profile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { 
    profile, 
    loading, 
    coupons, 
    couponsLoading, 
    fetchUserCoupons,
    refreshProfile
  } = useProfileData();
  const [isLoading, setIsLoading] = useState(true);
  
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
      fetchUserCoupons();
    }
  }, [user]);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!user || !profile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <ProfileHeader user={user} profile={profile} />

          <div className="p-6 space-y-6">
            {/* Balance Credits Card */}
            <BalanceCredits balance={profile.balanceCredits} onRefresh={refreshProfile} />
            
            {/* Personal Information */}
            <PersonalInfo user={user} profile={profile} />
            
            {/* Quick Actions */}
            <QuickActions navigate={navigate} />
            
            {/* Logout Button */}
            <div className="py-4 flex justify-end">
              <LogoutButton onLogout={handleLogout} />
            </div>
          </div>
        </div>
        
        {/* Only show the coupons section if the user has coupons */}
        {coupons.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('coupons')}</h2>
            <CouponsList coupons={coupons} loading={couponsLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
