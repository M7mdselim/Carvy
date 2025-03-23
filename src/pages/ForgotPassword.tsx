
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('invalidEmailAddress'));
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setIsSubmitted(true);
        toast.success(t('resetLinkSent'));
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(t('errorSendingResetLink'));
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
          {t('resetYourPassword')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('enterEmailInstructions')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600 no-flip" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">{t('checkYourEmail')}</h3>
              <p className="text-sm text-gray-600 mb-4">{t('resetLinkSent')}</p>
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t('backToLogin')} &rarr;
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('emailAddress')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 auth-input"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('sending') : t('sendResetLink')}
                </Button>
              </div>

              <div className="text-center mt-4">
                <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  &larr; {t('backToLogin')}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
