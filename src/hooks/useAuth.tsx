import React, { createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore, Profile } from '@/store/authStore';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string | null;
  role: string;
  full_name: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // App.tsx zaten auth state'ini yönetiyor (initAuth, onAuthStateChange).
  // Burada sadece store'dan verileri alıp Context'e aktarıyoruz.
  // Bu sayede "double initialization" ve "race condition" sorunları çözülür.
  const { user, profile, session, loading, reset } = useAuthStore();

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      reset();
      // Local storage temizliği
      try {
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('sb-jlwsapdvizzriomadhxj-auth-token');
      } catch (e) {}
    }
  };

  // Store'daki user objesini Context'in beklediği formata çevir
  const contextUser: User | null = user ? {
    id: user.id,
    email: user.email || null,
    role: profile?.role || 'user',
    full_name: profile?.full_name || null,
    avatar_url: profile?.avatar_url || null,
  } : null;

  return (
    <AuthContext.Provider value={{ user: contextUser, profile, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
