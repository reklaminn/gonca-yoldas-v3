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
        console.log('🔵 [AuthStore] setUser called:', user?.id);
        set({ user });
      },
      setProfile: (profile) => {
        console.log('🔵 [AuthStore] setProfile called:', profile?.id, profile?.role);
        set({ profile });
      },
      setSession: (session) => {
        console.log('🔵 [AuthStore] setSession called:', session?.user?.id);
        set({ session });
      },
      setLoading: (loading) => {
        console.log('🔵 [AuthStore] setLoading called:', loading);
        set({ loading });
      },
      reset: () => {
        console.log('🔵 [AuthStore] reset called - clearing all auth data');
        set({ user: null, profile: null, session: null, loading: false });
        
        // LocalStorage temizliği (Sadece auth ile ilgili olanlar)
        try {
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('sb-jlwsapdvizzriomadhxj-auth-token');
          console.log('✅ [AuthStore] Local storage cleaned');
        } catch (e) {
          console.error('❌ [AuthStore] Local storage cleanup error:', e);
        }
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
    }
  )
);
