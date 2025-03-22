
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../contexts/LanguageContext'
import { ProfileHeader } from '../components/profile/ProfileHeader'
import { PersonalInfo } from '../components/profile/PersonalInfo'
import { QuickActions } from '../components/profile/QuickActions'
import { LogoutButton } from '../components/profile/LogoutButton'

export default function Profile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, getUserProfile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!user && !isLoading) {
      navigate('/login');
    }
    
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [user, navigate, isLoading]);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ProfileHeader user={user} profile={getUserProfile()} />

          <div className="p-6 divide-y divide-gray-200">
            <PersonalInfo user={user} profile={getUserProfile()} />
            <QuickActions navigate={navigate} />
            <div className="py-4 flex justify-end">
              <LogoutButton onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
