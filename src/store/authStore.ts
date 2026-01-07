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
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      reset: () => {
        console.log('🔴 [AuthStore] Resetleniyor - Tüm veriler siliniyor');
        set({ user: null, profile: null, session: null, loading: false });
        
        // LocalStorage temizliği (Sadece auth ile ilgili olanlar)
        try {
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('sb-jlwsapdvizzriomadhxj-auth-token');
        } catch (e) {
          console.error('LocalStorage temizlenirken hata:', e);
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
