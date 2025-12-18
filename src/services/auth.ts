import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { linkGuestOrdersToUser } from './orders';

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
    // 1. Create user in Supabase Auth
    console.log('🔵 [2/5] Calling supabase.auth.signUp...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: undefined,
        data: {
          full_name: data.fullName,
        },
      },
    });

    console.log('🔵 [3/5] signUp response received');

    if (signUpError) {
      console.error('❌ Supabase signUp error:', signUpError);
      toast.error(`Kayıt hatası: ${signUpError.message}`);
      return null;
    }

    if (!signUpData?.user) {
      console.error('❌ No user returned from signUp');
      toast.error('Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.');
      return null;
    }

    const userId = signUpData.user.id;
    console.log('✅ User created in auth:', userId);

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
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([profileData]);

    if (profileError) {
      console.error('❌ Profile insert failed:', profileError);
      toast.error(`Profil hatası: ${profileError.message}`);
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Supabase signIn error:', error);
      toast.error(`Giriş hatası: ${error.message}`);
      return null;
    }

    if (!data.user) {
      console.error('❌ No user returned from signIn');
      toast.error('Kullanıcı bulunamadı.');
      return null;
    }

    console.log('✅ User signed in:', data.user.id);
    
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
 * Sign out current user
 */
export async function signOutUser(): Promise<boolean> {
  try {
    console.log('🔵 signOutUser: Signing out');
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Supabase signOut error:', error);
      toast.error(`Çıkış hatası: ${error.message}`);
      return false;
    }

    console.log('✅ User signed out');
    toast.success('Çıkış yapıldı');
    return true;
  } catch (error: any) {
    console.error('❌ Unexpected error during signOutUser:', error);
    toast.error(`Beklenmeyen hata: ${error?.message || 'Bilinmeyen hata'}`);
    return false;
  }
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('❌ Unexpected error getting current user:', error);
    return null;
  }
}
