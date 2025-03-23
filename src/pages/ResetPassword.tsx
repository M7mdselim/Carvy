
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle } from "@/components/ui/alert";
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  // Check if we have a hash parameter in the URL
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      // No recovery token found, redirect to forgot password
      navigate('/forgot-password');
      toast.error(t('invalidOrExpiredResetLink'));
    }
  }, [navigate, t]);

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) {
      return 'weak';
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
    
    if (strength < 3) return 'weak';
    if (strength === 3) return 'medium';
    return 'strong';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      setPasswordStrength(checkPasswordStrength(newPassword));
    } else {
      setPasswordStrength(null);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      return;
    }
    
    if (password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }
    
    if (passwordStrength === 'weak') {
      setError(t('passwordTooWeak'));
      return;
    }
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast.success(t('passwordResetSuccess'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || t('passwordResetFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 auth-page">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex items-center justify-center mb-4">
          <svg width="50" height="50" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 brand-icon">
            <rect width="40" height="40" rx="8" fill="url(#paint0_linear)" />
            <path d="M10 25C10 22.2386 12.2386 20 15 20H25C27.7614 20 30 22.2386 30 25V28C30 29.1046 29.1046 30 28 30H12C10.8954 30 10 29.1046 10 28V25Z" fill="white"/>
            <circle cx="15" cy="25" r="2" fill="#3B82F6"/>
            <circle cx="25" cy="25" r="2" fill="#3B82F6"/>
            <path d="M11 18L15 10H25L29 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6"/>
                <stop offset="1" stopColor="#1E40AF"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-4xl font-extrabold leading-tight py-1 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            {t('brandName')}
          </span>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
          {t('createNewPassword')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('enterNewPasswordBelow')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('newPassword')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 auth-input"
              />
              
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center">
                    <span className="text-xs mr-2">{t('passwordStrength')}:</span>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden password-strength-meter">
                      <div 
                        className={`h-full ${
                          passwordStrength === 'weak' ? 'w-1/3 bg-red-500' : 
                          passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' : 
                          'w-full bg-green-500'
                        }`}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">
                      {passwordStrength === 'weak' ? t('weak') : 
                      passwordStrength === 'medium' ? t('medium') : 
                      t('strong')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('confirmNewPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 auth-input"
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('updating') : t('resetPassword')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
