
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

// Use consistent environment variables
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

// Export a function to initialize auth state in one place
export async function initializeAuth() {
  let retries = 3;
  while (retries > 0) {
    try {
      // First check for existing session
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
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
