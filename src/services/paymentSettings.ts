import { supabase } from '@/lib/supabaseClient';
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
 * Get all payment methods (admin only)
 */
export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    console.log('🔵 Fetching all payment methods...');

    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .order('payment_method');

    if (error) {
      console.error('❌ Error fetching payment methods:', error);
      throw error;
    }

    console.log('✅ Payment methods fetched:', data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error('❌ Failed to fetch payment methods:', error);
    toast.error('Ödeme yöntemleri yüklenemedi');
    return [];
  }
}

/**
 * Get active payment methods (public - for checkout page)
 */
export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  try {
    console.log('🔵 Fetching active payment methods...');

    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('is_active', true)
      .order('payment_method');

    if (error) {
      console.error('❌ Error fetching active payment methods:', error);
      throw error;
    }

    console.log('✅ Active payment methods fetched:', data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error('❌ Failed to fetch active payment methods:', error);
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
  }
): Promise<boolean> {
  try {
    console.log('🔵 Updating payment method:', id);

    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      toast.error('Oturum açmanız gerekiyor');
      return false;
    }

    // Check user role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      toast.error('Bu işlem için yetkiniz yok');
      return false;
    }

    // Perform update
    const { data, error } = await supabase
      .from('payment_settings')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error updating payment method:', error);
      toast.error(`Güncelleme hatası: ${error.message}`);
      throw error;
    }

    toast.success('Ödeme yöntemi güncellendi');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to update payment method:', error);
    toast.error(`Ödeme yöntemi güncellenemedi: ${error.message || 'Bilinmeyen hata'}`);
    return false;
  }
}
