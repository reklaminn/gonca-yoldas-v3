import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabaseClient';

export interface PaymentMethod {
  id: string;
  payment_method: 'credit_card' | 'bank_transfer' | 'iyzilink';
  is_active: boolean;
  display_order: number;
  config: CreditCardConfig | BankTransferConfig | IyzilinkConfig;
  created_at: string;
  updated_at: string;
}

export interface CreditCardConfig {
  provider: 'iyzico';
  api_key: string;
  secret_key: string;
  base_url: string;
}

export interface BankTransferConfig {
  bank_name: string;
  account_holder: string;
  iban: string;
  instructions: string;
}

export interface IyzilinkConfig {
  instructions: string;
}

// --- TOKEN YÖNETİMİ (MANUEL REFRESH) ---

const STORAGE_KEY = 'sb-jlwsapdvizzriomadhxj-auth-token';

function getStoredSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('❌ [PaymentSettings] LocalStorage read error:', e);
  }
  return null;
}

async function refreshAuthTokenManual() {
  console.log('🔄 [PaymentSettings] Token yenileniyor...');
  const session = getStoredSession();
  
  if (!session || !session.refresh_token) {
    throw new Error('No refresh token available');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  console.log('✅ [PaymentSettings] Token yenilendi!');

  // LocalStorage güncelle
  const newSession = {
    ...session,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  
  // Store'u güncelle
  useAuthStore.getState().setSession(newSession);

  return data.access_token;
}

async function getAuthTokenSafely() {
  // 1. Önce Store'dan bak
  const storeSession = useAuthStore.getState().session;
  if (storeSession?.access_token) {
    return storeSession.access_token;
  }

  // 2. LocalStorage'dan bak
  const session = getStoredSession();
  if (session?.access_token) {
    return session.access_token;
  }

  return null;
}

/**
 * Get all payment methods (admin only) - WITH RETRY LOGIC
 */
export async function getAllPaymentMethods(retryCount = 0): Promise<PaymentMethod[]> {
  try {
    console.log(`🔵 [PaymentSettings] Fetching all payment methods (Attempt: ${retryCount + 1})...`);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    let accessToken = await getAuthTokenSafely();

    // Token yoksa ve ilk denemeyse, yenilemeyi dene
    if (!accessToken && retryCount === 0) {
      try {
        accessToken = await refreshAuthTokenManual();
      } catch (e) {
        console.warn('⚠️ [PaymentSettings] Initial refresh failed, continuing with anon key');
      }
    }

    const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${supabaseKey}`;
    // display_order'a göre sırala
    const url = `${supabaseUrl}/rest/v1/payment_settings?order=display_order.asc`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      }
    });

    // 401 Hatası ve Retry Hakkı Varsa -> Token Yenile ve Tekrar Dene
    if (response.status === 401 && retryCount < 1) {
      console.warn('⚠️ [PaymentSettings] 401 Unauthorized. Refreshing token and retrying...');
      try {
        await refreshAuthTokenManual();
        return getAllPaymentMethods(retryCount + 1);
      } catch (refreshError) {
        console.error('❌ [PaymentSettings] Retry failed:', refreshError);
        toast.error('Oturum süreniz doldu. Lütfen sayfayı yenileyin.');
        return [];
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [PaymentSettings] HTTP Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [PaymentSettings] Payment methods fetched:', data?.length || 0);
    
    return data || [];
  } catch (error: any) {
    console.error('❌ [PaymentSettings] Failed to fetch payment methods:', error);
    toast.error('Ödeme yöntemleri yüklenemedi');
    return [];
  }
}

/**
 * Get active payment methods (public - for checkout page)
 */
export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  try {
    console.log('🔵 [PaymentSettings] Fetching active payment methods...');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // display_order'a göre sırala
    const url = `${supabaseUrl}/rest/v1/payment_settings?is_active=eq.true&order=display_order.asc`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [PaymentSettings] HTTP Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error: any) {
    console.error('❌ [PaymentSettings] Failed to fetch active payment methods:', error);
    return [];
  }
}

/**
 * Update payment method configuration
 */
export async function updatePaymentMethod(
  id: string,
  updates: {
    is_active?: boolean;
    config?: CreditCardConfig | BankTransferConfig | IyzilinkConfig;
  },
  retryCount = 0
): Promise<boolean> {
  try {
    console.log(`🔵 [PaymentSettings] Updating payment method: ${id} (Attempt: ${retryCount + 1})`);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    let accessToken = await getAuthTokenSafely();
    
    if (!accessToken && retryCount === 0) {
      try {
        accessToken = await refreshAuthTokenManual();
      } catch (e) {
        console.warn('⚠️ [PaymentSettings] Initial refresh failed');
      }
    }
    
    const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${supabaseKey}`;
    const url = `${supabaseUrl}/rest/v1/payment_settings?id=eq.${id}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    });

    if (response.status === 401 && retryCount < 1) {
      console.warn('⚠️ [PaymentSettings] 401 Unauthorized during update. Refreshing token...');
      try {
        await refreshAuthTokenManual();
        return updatePaymentMethod(id, updates, retryCount + 1);
      } catch (refreshError) {
        console.error('❌ [PaymentSettings] Retry failed:', refreshError);
        toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
        return false;
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [PaymentSettings] Update error:', response.status, errorText);
      toast.error(`Güncelleme hatası: ${response.status}`);
      return false;
    }

    toast.success('Ödeme yöntemi güncellendi');
    return true;
  } catch (error: any) {
    console.error('❌ [PaymentSettings] Failed to update payment method:', error);
    toast.error(`Ödeme yöntemi güncellenemedi: ${error.message || 'Bilinmeyen hata'}`);
    return false;
  }
}

/**
 * Update payment methods order
 * IMPORTANT: Must include all required fields (like payment_method) to avoid NOT NULL constraints during upsert
 */
export async function updatePaymentMethodsOrder(
  items: Partial<PaymentMethod>[],
  retryCount = 0
): Promise<boolean> {
  try {
    console.log(`🔵 [PaymentSettings] Updating payment methods order (Attempt: ${retryCount + 1})`);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    let accessToken = await getAuthTokenSafely();
    
    if (!accessToken && retryCount === 0) {
      try {
        accessToken = await refreshAuthTokenManual();
      } catch (e) {
        console.warn('⚠️ [PaymentSettings] Initial refresh failed');
      }
    }
    
    const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${supabaseKey}`;
    // on_conflict=id parametresi ekleyerek explicit upsert yapıyoruz
    const url = `${supabaseUrl}/rest/v1/payment_settings?on_conflict=id`;
    
    // Supabase upsert kullanarak toplu güncelleme
    const response = await fetch(url, {
      method: 'POST', // Upsert için POST kullanılır
      headers: {
        'apikey': supabaseKey,
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates' // Çakışan ID'leri güncelle
      },
      body: JSON.stringify(items)
    });

    if (response.status === 401 && retryCount < 1) {
      try {
        await refreshAuthTokenManual();
        return updatePaymentMethodsOrder(items, retryCount + 1);
      } catch (refreshError) {
        toast.error('Oturum süreniz doldu.');
        return false;
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [PaymentSettings] Order update error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    toast.success('Sıralama güncellendi');
    return true;
  } catch (error: any) {
    console.error('❌ [PaymentSettings] Failed to update order:', error);
    toast.error('Sıralama güncellenemedi');
    return false;
  }
}
