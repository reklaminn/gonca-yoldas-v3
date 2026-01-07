import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  phone: string | null;
  city: string | null;
  district: string | null;
  tax_office: string | null;
  tax_number: string | null;
  billing_type: 'individual' | 'corporate';
  tc_number: string | null;
  company_name: string | null;
  full_address: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      session: null,
      loading: true,
      setUser: (user) => {
        console.log('🔵 [Zustand] setUser called:', user?.email);
        set({ user });
      },
      setProfile: (profile) => {
        console.log('🔵 [Zustand] setProfile called:', profile?.role);
        set({ profile });
      },
      setSession: (session) => {
        console.log('🔵 [Zustand] setSession called, has token:', !!session?.access_token);
        set({ session });
      },
      setLoading: (loading) => {
        console.log('🔵 [Zustand] setLoading called:', loading);
        set({ loading });
      },
      reset: () => {
        console.log('🔵 [Zustand] reset called - clearing all auth state');
        set({ user: null, profile: null, session: null, loading: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        profile: state.profile,
        session: state.session,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔵 [Zustand] Rehydrated from localStorage:', {
          hasUser: !!state?.user,
          hasProfile: !!state?.profile,
          hasSession: !!state?.session,
          hasToken: !!state?.session?.access_token,
          role: state?.profile?.role
        });
        if (state) {
          state.loading = false;
        }
      },
    }
  )
);
