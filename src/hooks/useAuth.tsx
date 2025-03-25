
import { create } from 'zustand';
import { supabase, initializeAuth, resetPassword, signInWithProvider } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { ProfileData } from '../types';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, options?: { 
    data?: {
      first_name?: string;
      last_name?: string;
      phone_number?: string;
    }
  }) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  getUserProfile: () => ProfileData | null;
  cleanup: () => void;
  forgotPassword: (email: string) => Promise<{success: boolean; message: string}>;
  signInWithSocial: (provider: 'google' | 'facebook') => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  
  signIn: async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      set({ 
        user: data.user, 
        session: data.session 
      });
      
      console.log("Sign in successful:", data.user?.id);
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  },
  
  signUp: async (email: string, password: string, options = {}) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options.data
        }
      });
      
      if (error) throw error;
      
      set({ 
        user: data.user, 
        session: data.session 
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to sign up');
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({ 
        user: null, 
        session: null 
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
      throw error;
    }
  },
  
  initialize: async () => {
    try {
      set({ loading: true });
      
      // Use the centralized initialization function with retry mechanism
      const session = await initializeAuth();
      
      // If we have a session, set the user and session
      if (session) {
        console.log("Session found during initialization:", session.user.id);
        set({ 
          user: session.user, 
          session: session 
        });
      } else {
        console.log("No session found during initialization");
        set({ 
          user: null, 
          session: null 
        });
      }
      
      // Then set up the auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log("Auth state changed:", event, session?.user?.id);
          set({ 
            user: session?.user || null, 
            session: session 
          });
        }
      );
      
      // Store the cleanup function
      set({
        cleanup: () => {
          subscription.unsubscribe();
        },
        loading: false
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      toast.error('Error initializing authentication. Some features might not work correctly.');
      set({ loading: false });
    }
  },
  
  getUserProfile: () => {
    const user = get().user;
    if (!user) return null;

    // First try to get data from user metadata
    const metadataProfile = {
      id: user.id,
      firstName: user.user_metadata?.first_name || '',
      lastName: user.user_metadata?.last_name || '',
      phoneNumber: user.user_metadata?.phone_number || '',
      balanceCredits: 0, // Default to 0 until we get actual data
      isAdmin: false,
      ownerId: null
    };

    return metadataProfile;
  },
  
  forgotPassword: async (email: string) => {
    const result = await resetPassword(email);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    return result;
  },
  
  signInWithSocial: async (provider: 'google' | 'facebook') => {
    try {
      const result = await signInWithProvider(provider);
      if (!result.success && result.message) {
        toast.error(result.message);
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error(`Sign in with ${provider} error:`, error);
      toast.error(error.message || `Failed to sign in with ${provider}`);
      throw error;
    }
  },
  
  cleanup: () => {
    // This will be replaced with the actual cleanup function when initialize() is called
    console.log("Default cleanup function called before initialization");
  }
}));

// Initialize authentication state when the hook is first imported
useAuth.getState().initialize();
