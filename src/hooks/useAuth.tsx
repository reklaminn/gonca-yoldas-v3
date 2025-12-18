import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Profile } from '@/store/authStore';

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
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchUserAndProfile = async (supabaseUser: SupabaseUser | null): Promise<{ userData: User | null, profileData: Profile | null }> => {
    if (!supabaseUser) return { userData: null, profileData: null };

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      const userData = {
        id: supabaseUser.id,
        email: supabaseUser.email ?? null,
        role: profile?.role || 'user',
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null,
      };

      return { userData, profileData: profile as Profile };
    } catch (e) {
      return {
        userData: {
          id: supabaseUser.id,
          email: supabaseUser.email ?? null,
          role: 'user',
          full_name: null,
          avatar_url: null,
        },
        profileData: null
      };
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { userData, profileData } = await fetchUserAndProfile(session?.user ?? null);
        setUser(userData);
        setProfile(profileData);
        setLoading(false);
        setInitialized(true);
      } catch (error) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const { userData, profileData } = await fetchUserAndProfile(session?.user ?? null);
        setUser(userData);
        setProfile(profileData);
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
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
