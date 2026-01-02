import React, { createContext, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useAuthStore, Profile } from '@/store/authStore';

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
  session: Session | null; // ✅ Session'ı context'e ekle
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile, session, loading, setUser, setProfile, setSession, setLoading, reset } = useAuthStore();

  const fetchUserAndProfile = async (supabaseUser: SupabaseUser | null, currentSession: Session | null): Promise<{ userData: User | null, profileData: Profile | null }> => {
    console.log('🔵 [useAuth] fetchUserAndProfile called for:', supabaseUser?.email);
    
    if (!supabaseUser) {
      console.log('❌ [useAuth] No supabase user provided');
      return { userData: null, profileData: null };
    }

    try {
      console.log('🔵 [useAuth] Fetching profile from database...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('❌ [useAuth] Profile fetch error:', profileError);
        
        const defaultUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email ?? null,
          role: 'user',
          full_name: supabaseUser.user_metadata?.full_name || null,
          avatar_url: null,
        };
        
        console.log('⚠️ [useAuth] Using default user data:', defaultUser);
        return { userData: defaultUser, profileData: null };
      }

      if (!profileData) {
        console.error('❌ [useAuth] No profile data returned');
        const defaultUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email ?? null,
          role: 'user',
          full_name: supabaseUser.user_metadata?.full_name || null,
          avatar_url: null,
        };
        return { userData: defaultUser, profileData: null };
      }

      console.log('✅ [useAuth] Profile fetched successfully:', {
        id: profileData.id,
        email: profileData.email,
        role: profileData.role,
        full_name: profileData.full_name
      });

      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email ?? null,
        role: profileData.role || 'user',
        full_name: profileData.full_name || null,
        avatar_url: profileData.avatar_url || null,
      };

      console.log('✅ [useAuth] User data created:', userData);
      return { userData, profileData: profileData as Profile };
      
    } catch (error) {
      console.error('❌ [useAuth] Unexpected error fetching profile:', error);
      
      const defaultUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email ?? null,
        role: 'user',
        full_name: supabaseUser.user_metadata?.full_name || null,
        avatar_url: null,
      };
      
      return { userData: defaultUser, profileData: null };
    }
  };

  useEffect(() => {
    console.log('🔵 [useAuth] Initializing auth...');
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        console.log('🔵 [useAuth] Getting session...');
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (sessionError) {
          console.error('❌ [useAuth] Session error:', sessionError);
          reset();
          return;
        }

        if (!currentSession?.user) {
          console.log('⚠️ [useAuth] No active session');
          reset();
          return;
        }

        console.log('✅ [useAuth] Session found for:', currentSession.user.email);
        console.log('✅ [useAuth] Access token available:', !!currentSession.access_token);
        
        const { userData, profileData } = await fetchUserAndProfile(currentSession.user, currentSession);
        
        if (!isMounted) return;
        
        console.log('🔵 [useAuth] Setting Zustand state:', {
          hasUser: !!userData,
          hasProfile: !!profileData,
          hasSession: !!currentSession,
          hasToken: !!currentSession.access_token,
          role: userData?.role
        });
        
        // ✅ Session'ı da kaydet
        setSession(currentSession);
        
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email || '',
            user_metadata: { full_name: userData.full_name },
          } as any);
        } else {
          setUser(null);
        }
        setProfile(profileData);
        setLoading(false);
        
        console.log('✅ [useAuth] Auth initialization complete');
      } catch (error) {
        console.error('❌ [useAuth] Init error:', error);
        if (isMounted) {
          reset();
        }
      }
    };

    initAuth();

    console.log('🔵 [useAuth] Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔵 [useAuth] Auth state changed:', event, 'Session:', !!currentSession);
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_OUT') {
        console.log('✅ [useAuth] User signed out - resetting Zustand store');
        reset();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('✅ [useAuth] User signed in/refreshed');
        console.log('✅ [useAuth] Access token available:', !!currentSession?.access_token);
        
        setLoading(true);
        
        // ✅ Session'ı kaydet
        setSession(currentSession);
        
        const { userData, profileData } = await fetchUserAndProfile(currentSession?.user ?? null, currentSession);
        
        if (!isMounted) return;
        
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email || '',
            user_metadata: { full_name: userData.full_name },
          } as any);
        } else {
          setUser(null);
        }
        setProfile(profileData);
        setLoading(false);
      } else if (event === 'USER_UPDATED') {
        console.log('✅ [useAuth] User updated');
        const { userData, profileData } = await fetchUserAndProfile(currentSession?.user ?? null, currentSession);
        
        if (!isMounted) return;
        
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email || '',
            user_metadata: { full_name: userData.full_name },
          } as any);
        }
        setProfile(profileData);
      } else if (event === 'INITIAL_SESSION') {
        console.log('✅ [useAuth] Initial session event - already handled in initAuth');
      }
    });

    return () => {
      console.log('🔵 [useAuth] Cleaning up auth listener');
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [setUser, setProfile, setSession, setLoading, reset]);

  const signOut = async () => {
    console.log('🔵 [useAuth] Signing out...');
    await supabase.auth.signOut();
    reset();
    console.log('✅ [useAuth] Sign out complete');
  };

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
