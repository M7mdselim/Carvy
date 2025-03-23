
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Facebook, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithSocial } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Get the redirect path from state or use '/' as default
  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialSignIn(provider: 'google' | 'facebook') {
    setSocialLoading(provider);
    try {
      await signInWithSocial(provider);
      // The redirect will be handled by Supabase
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to sign in with ${provider}`);
      }
      setSocialLoading(null);
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
          {t('Sign in Your Account')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('Dont Have Account')}{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            {t('Create Account')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center text-gray-700 bg-white hover:bg-gray-50"
              disabled={!!socialLoading}
              onClick={() => handleSocialSignIn('google')}
            >
              <svg className="h-5 w-5 mr-2 social-icon" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0353 3.12C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21528 6.86002 8.87028 4.75 12.0003 4.75Z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                  fill="#34A853"
                />
              </svg>
              {socialLoading === 'google' ? t('signingInWithGoogle') : t('Sign in With Google')}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full justify-center text-gray-700 bg-white hover:bg-gray-50"
              disabled={!!socialLoading}
              onClick={() => handleSocialSignIn('facebook')}
            >
              <Facebook className="h-5 w-5 mr-2 text-blue-600 social-icon" />
              {socialLoading === 'facebook' ? t('signingInWithFacebook') : t('Sign in With Facebook')}
            </Button>
          </div>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('orContinueWith')}</span>
            </div>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('emailAddress')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm auth-input-group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none auth-input-icon">
                  <Mail className="h-5 w-5 text-gray-400 auth-icon" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 auth-input"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm auth-input-group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none auth-input-icon">
                  <Lock className="h-5 w-5 text-gray-400 auth-icon" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 auth-input"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  {t('Forgot Password ?')}
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('signingIn') : t('Sign in')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
