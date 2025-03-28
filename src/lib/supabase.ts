
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

// Use environment variables with fallbacks to the project-specific values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://gcejhxrwyftlzbztngug.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZWpoeHJ3eWZ0bHpienRuZ3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MDM3NTksImV4cCI6MjA1NDk3OTc1OX0.dTPrJembkfcqPWyByD08JrCotwee_cgLTzo18k2buLg";

// Create a single Supabase client instance with proper auth configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'carvy-auth-storage',
  },
  global: {
    fetch: (url, options) => {
      return fetch(url, options);
    },
    headers: {
      'X-Client-Info': 'carvy-web-client'
    }
  },
  // Add some retrying capability
  db: {
    schema: 'public'
  }
});

// Export functions to work with auth
export async function initializeAuth() {
  let retries = 3;
  while (retries > 0) {
    try {
      // First check for existing session
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      // Log for debugging purposes
      console.log("Auth initialization result:", data.session ? "Session found" : "No session found");
      
      return data.session;
    } catch (error) {
      console.error(`Error initializing auth (${retries} retries left):`, error);
      retries--;
      
      if (retries === 0) {
        console.error('Failed to initialize auth after multiple attempts');
        return null;
      }
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

// Helper function to handle Supabase errors consistently
export function handleSupabaseError(error: any): string {
  console.error('Supabase error:', error);
  
  if (typeof error === 'object' && error !== null) {
    if (error.message === 'Failed to fetch') {
      return 'Network connection issue. Please check your internet connection.';
    }
    return error.message || 'An unexpected error occurred';
  }
  
  return 'An unexpected error occurred';
}

// Add password reset functionality
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/Carvy/reset-password',
    });
    
    if (error) throw error;
    return { success: true, message: 'Password reset link sent to your email' };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return { success: false, message: error.message || 'Failed to send reset link' };
  }
}

// Social sign-in functions
export async function signInWithProvider(provider: 'google' | 'facebook') {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/Carvy/',
      },
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error(`${provider} sign-in error:`, error);
    return { success: false, message: error.message || `Failed to sign in with ${provider}` };
  }
}
