import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';

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

export const signUpUser = async (userData: SignUpData) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        full_name: userData.fullName,
      }
    }
  });

  if (authError || !authData.user) {
    console.error('Signup auth error:', authError);
    return null;
  }

  // Create Profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: authData.user.id,
        full_name: userData.fullName,
        phone: userData.phone,
        city: userData.city,
        district: userData.district,
        tax_office: userData.taxOffice,
        tax_number: userData.taxNumber,
        email: userData.email
      }
    ]);

  if (profileError) {
    console.error('Signup profile error:', profileError);
    return null;
  }

  return authData.user.id;
};

export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    console.error('Signin error:', error);
    return null;
  }
  return data.user.id;
};

export const signOutUser = async () => {
  try {

    
    // 1. Önce yerel store'u temizle (UI hemen tepki versin)
    // Bu işlem, Supabase ağ isteği takılsa bile kullanıcının çıkış yapmış gibi hissetmesini sağlar.
    useAuthStore.getState().reset();

    // 2. Supabase'den çıkış yap (Arka planda)
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('⚠️ [AuthService] Supabase çıkış hatası (önemsiz):', error);
    } else {

    }

    // 3. LocalStorage temizliği (Garanti olsun)
    localStorage.removeItem('sb-jlwsapdvizzriomadhxj-auth-token'); // Proje ID'ye özel token key
    
    return true;
  } catch (error) {
    console.error('❌ [AuthService] Kritik çıkış hatası:', error);
    // Hata olsa bile store temizlendiği için true dönüyoruz
    return true;
  }
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
