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
      loading: true, // Başlangıçta her zaman true olmalı
      setUser: (user) => {
        set({ user });
      },
      setProfile: (profile) => {
        set({ profile });
      },
      setSession: (session) => {
        set({ session });
      },
      setLoading: (loading) => {
        set({ loading });
      },
      reset: () => {
        console.log('🔵 [Zustand] reset called - clearing all auth state');
        set({ user: null, profile: null, session: null, loading: false });
        // LocalStorage'ı da temizle
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('sb-jlwsapdvizzriomadhxj-auth-token');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        profile: state.profile,
        session: state.session,
        // loading state'ini ASLA kaydetme, her yenilemede true başlamalı
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔵 [Zustand] Rehydrated');
        // DİKKAT: Burada loading'i false YAPMIYORUZ.
        // Loading'i kapatma yetkisi sadece App.tsx'teki initAuth fonksiyonunda olmalı.
        // Bu sayede Supabase kontrolü bitene kadar loading true kalır.
      },
    }
  )
);
