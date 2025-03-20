import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, options?: { 
    data?: {
      first_name?: string
      last_name?: string
      phone_number?: string
    }
  }) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    set({ user: data.user })
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
    set({ user: data.user })
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null })
  },
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ user: session?.user || null })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      set({ loading: false })
    }
  },
}))