
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://gcejhxrwyftlzbztngug.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZWpoeHJ3eWZ0bHpienRuZ3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0MDM3NTksImV4cCI6MjA1NDk3OTc1OX0.dTPrJembkfcqPWyByD08JrCotwee_cgLTzo18k2buLg";

// Create the Supabase client with proper auth settings
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'carvy-auth-storage',
  }
});
