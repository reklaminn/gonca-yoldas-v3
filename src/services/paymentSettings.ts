import { toast } from 'sonner';

export interface PaymentMethod {
  id: string;
  payment_method: 'credit_card' | 'bank_transfer' | 'iyzilink';
  is_active: boolean;
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

/**
 * Get all payment methods (admin only) - DIRECT FETCH VERSION
 */
export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    console.log('🔵 [PaymentSettings] Fetching all payment methods with direct fetch...');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const url = `${supabaseUrl}/rest/v1/payment_settings?order=payment_method.asc`;
    
    console.log('🔵 [PaymentSettings] Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('🔵 [PaymentSettings] Response status:', response.status);

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
 * Get active payment methods (public - for checkout page) - DIRECT FETCH VERSION
 */
export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  try {
    console.log('🔵 [PaymentSettings] Fetching active payment methods with direct fetch...');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const url = `${supabaseUrl}/rest/v1/payment_settings?is_active=eq.true&order=payment_method.asc`;
    
    console.log('🔵 [PaymentSettings] Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('🔵 [PaymentSettings] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [PaymentSettings] HTTP Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [PaymentSettings] Active payment methods fetched:', data?.length || 0, data);
    
    return data || [];
  } catch (error: any) {
    console.error('❌ [PaymentSettings] Failed to fetch active payment methods:', error);
    return [];
  }
}

/**
 * Update payment method configuration - DIRECT FETCH VERSION
 */
export async function updatePaymentMethod(
  id: string,
  updates: {
    is_active?: boolean;
    config?: CreditCardConfig | BankTransferConfig | IyzilinkConfig;
  }
): Promise<boolean> {
  try {
    console.log('🔵 [PaymentSettings] Updating payment method:', id);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Get auth token from localStorage (Zustand persist)
    const authStorage = localStorage.getItem('auth-storage');
    let accessToken = supabaseKey; // fallback to anon key
    
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.user?.access_token) {
          accessToken = parsed.state.user.access_token;
          console.log('🔵 [PaymentSettings] Using user access token');
        }
      } catch (e) {
        console.warn('⚠️ [PaymentSettings] Could not parse auth storage');
      }
    }

    const url = `${supabaseUrl}/rest/v1/payment_settings?id=eq.${id}`;
    
    console.log('🔵 [PaymentSettings] Updating at:', url);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    });

    console.log('🔵 [PaymentSettings] Update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [PaymentSettings] Update error:', response.status, errorText);
      toast.error(`Güncelleme hatası: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ [PaymentSettings] Payment method updated:', data);
    
    toast.success('Ödeme yöntemi güncellendi');
    return true;
  } catch (error: any) {
    console.error('❌ [PaymentSettings] Failed to update payment method:', error);
    toast.error(`Ödeme yöntemi güncellenemedi: ${error.message || 'Bilinmeyen hata'}`);
    return false;
  }
}
