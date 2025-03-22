
import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

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
  getUserProfile: () => { firstName: string; lastName: string; phoneNumber: string } | null;
  cleanup?: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    set({ user: data.user, session: data.session })
  },
  signUp: async (email: string, password: string, options = {}) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options.data
      }
    })
    if (error) throw error
    set({ user: data.user, session: data.session })
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, session: null })
  },
  initialize: async () => {
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_, session) => {
          set({ user: session?.user || null, session })
        }
      )
  
      const { data: { session } } = await supabase.auth.getSession()
      set({ user: session?.user || null, session })
      
      // Store the cleanup function separately instead of returning it
      set({ cleanup: () => subscription.unsubscribe() })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      set({ loading: false })
    }
  },
  getUserProfile: () => {
    const user = get().user
    if (!user?.user_metadata) return null

    return {
      firstName: user.user_metadata.first_name || '',
      lastName: user.user_metadata.last_name || '',
      phoneNumber: user.user_metadata.phone_number || ''
    }
  }
}))
