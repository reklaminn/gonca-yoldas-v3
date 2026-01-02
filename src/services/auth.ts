import { toast } from 'sonner';
import { linkGuestOrdersToUser } from './orders';
import { useAuthStore } from '@/store/authStore';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  taxOffice?: string;
  taxNumber?: string;
}

/**
 * Register a new user with Supabase Auth and create profile
 */
export async function signUpUser(data: SignUpData): Promise<string | null> {
  console.log('🔵 [1/5] signUpUser: Starting registration for:', data.email);

  try {
    // 1. Create user in Supabase Auth via REST API
    console.log('🔵 [2/5] Calling Supabase Auth signup...');
    
    const signUpResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        data: {
          full_name: data.fullName,
        },
      }),
    });

    console.log('🔵 [3/5] signUp response received');

    if (!signUpResponse.ok) {
      const error = await signUpResponse.json();
      console.error('❌ Supabase signUp error:', error);
      toast.error(`Kayıt hatası: ${error.msg || error.message}`);
      return null;
    }

    const signUpData = await signUpResponse.json();

    if (!signUpData?.user || !signUpData?.session) {
      console.error('❌ No user or session returned from signUp');
      toast.error('Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.');
      return null;
    }

    const userId = signUpData.user.id;
    console.log('✅ User created in auth:', userId);
    console.log('✅ Session created:', !!signUpData.session.access_token);

    // ✅ Store session immediately
    const { setSession, setUser } = useAuthStore.getState();
    setSession(signUpData.session);
    setUser(signUpData.user);

    // 2. Insert user profile
    console.log('🔵 [4/5] Creating user profile...');
    
    const profileData = {
      id: userId,
      full_name: data.fullName,
      phone: data.phone,
      city: data.city,
      district: data.district,
      tax_office: data.taxOffice || '',
      tax_number: data.taxNumber || '',
      email: data.email,
      role: 'user',
    };
    
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${signUpData.session.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(profileData),
    });

    if (!profileResponse.ok) {
      const error = await profileResponse.json();
      console.error('❌ Profile insert failed:', error);
      toast.error(`Profil hatası: ${error.message}`);
      return null;
    }

    console.log('✅ Profile created successfully!');
    
    // 3. Link any guest orders
    console.log('🔵 [5/5] Checking for guest orders...');
    await linkGuestOrdersToUser(data.email, userId);
    
    toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
    return userId;
  } catch (error: any) {
    console.error('❌ Unexpected error during signUpUser:', error);
    toast.error(`Beklenmeyen hata: ${error?.message || 'Bilinmeyen hata'}`);
    return null;
  }
}

/**
 * Sign in user with email and password
 */
export async function signInUser(email: string, password: string): Promise<string | null> {
  console.log('🔵 signInUser: Attempting login for:', email);

  try {
    const signInResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!signInResponse.ok) {
      const error = await signInResponse.json();
      console.error('❌ Supabase signIn error:', error);
      toast.error(`Giriş hatası: ${error.error_description || error.message}`);
      return null;
    }

    const data = await signInResponse.json();

    if (!data.user || !data.access_token) {
      console.error('❌ No user or session returned from signIn');
      toast.error('Kullanıcı bulunamadı.');
      return null;
    }

    console.log('✅ User signed in:', data.user.id);
    console.log('✅ Session created:', !!data.access_token);
    
    // ✅ Store session immediately
    const { setSession, setUser } = useAuthStore.getState();
    setSession(data);
    setUser(data.user);
    
    // Link guest orders
    try {
      await linkGuestOrdersToUser(email, data.user.id);
    } catch (orderError) {
      console.error('⚠️ Error linking guest orders:', orderError);
    }
    
    toast.success('Giriş başarılı!');
    return data.user.id;
  } catch (error: any) {
    console.error('❌ Unexpected error during signInUser:', error);
    toast.error(`Beklenmeyen hata: ${error?.message || 'Bilinmeyen hata'}`);
    return null;
  }
}

/**
 * Sign out current user - Direct implementation without Supabase client
 */
export async function signOutUser(): Promise<boolean> {
  try {
    console.log('🔵 [signOutUser] Starting logout process...');
    
    const { session } = useAuthStore.getState();
    
    // If we have a session, try to revoke it via API
    if (session?.access_token) {
      console.log('🔵 [signOutUser] Revoking session via API...');
      
      try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.warn('⚠️ [signOutUser] API logout failed, continuing with local cleanup');
        } else {
          console.log('✅ [signOutUser] Session revoked via API');
        }
      } catch (apiError) {
        console.warn('⚠️ [signOutUser] API logout error, continuing with local cleanup:', apiError);
      }
    }

    // Always clear local state regardless of API call result
    console.log('🔵 [signOutUser] Clearing Zustand store...');
    const { reset } = useAuthStore.getState();
    reset();
    
    console.log('✅ [signOutUser] User signed out successfully');
    toast.success('Çıkış yapıldı');
    return true;
  } catch (error: any) {
    console.error('❌ [signOutUser] Unexpected error:', error);
    
    // Even on error, try to clear local state
    try {
      const { reset } = useAuthStore.getState();
      reset();
      console.log('✅ [signOutUser] Local state cleared despite error');
    } catch (resetError) {
      console.error('❌ [signOutUser] Failed to clear local state:', resetError);
    }
    
    toast.error(`Çıkış hatası: ${error?.message || 'Bilinmeyen hata'}`);
    return false;
  }
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
  try {
    const { session } = useAuthStore.getState();
    
    if (!session?.access_token) {
      console.log('ℹ️ [getCurrentUser] No session available');
      return null;
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      console.error('❌ [getCurrentUser] Error getting current user:', response.status);
      return null;
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('❌ [getCurrentUser] Unexpected error:', error);
    return null;
  }
}
