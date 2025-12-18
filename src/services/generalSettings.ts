import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export interface GeneralSettings {
  id: string;
  site_name: string;
  site_url: string;
  site_description: string;
  contact_email: string;
  support_email: string;
  timezone: string;
  language: string;
  maintenance_mode_active: boolean;
  coupon_enabled: boolean;
  invoice_enabled: boolean;
  show_prices_with_vat: boolean;
  courses_external_url: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all general settings (single row)
 */
export async function getGeneralSettings(): Promise<GeneralSettings | null> {
  try {
    console.log('🔵 Fetching general settings...');

    const { data, error } = await supabase
      .from('general_settings')
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error fetching general settings:', error);
      throw error;
    }

    console.log('✅ General settings fetched:', data);
    return data;
    return data;
  } catch (error: unknown) {
    console.error('❌ Failed to fetch general settings:', error);
    toast.error('Genel ayarlar yüklenemedi');
    return null;
  }
}

/**
 * Update general settings
 */
export async function updateGeneralSettings(
  id: string,
  updates: Partial<Omit<GeneralSettings, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  try {
    console.log('🔵 Updating general settings:', id);
    console.log('📝 Updates to apply:', updates);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ User error or not authenticated:', userError);
      toast.error('Oturum açmanız gerekiyor');
      return false;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      console.error('❌ User is not admin:', profile?.role);
      toast.error('Bu işlem için yetkiniz yok');
      return false;
    }

    console.log('🔄 Attempting database update...');
    const { data, error } = await supabase
      .from('general_settings')
      .update(updates)
      .eq('id', id)
      .select();

    console.log('📊 Update response:', { data, error });

    if (error) {
      console.error('❌ Error updating general settings:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      toast.error(`Güncelleme hatası: ${error.message}`);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error('❌ No data returned from update');
      toast.error('Güncelleme başarısız oldu');
      return false;
    }

    console.log('✅ General settings updated successfully');
    toast.success('Genel ayarlar güncellendi');
    return true;
    toast.success('Genel ayarlar güncellendi');
    return true;
  } catch (error: unknown) {
    console.error('❌ Failed to update general settings:', error);
    const dbError = error as { message?: string };
    toast.error(`Genel ayarlar güncellenemedi: ${dbError.message || 'Bilinmeyen hata'}`);
    return false;
  }
}

/**
 * Check if coupons are enabled (public function for checkout page)
 */
export async function isCouponEnabled(): Promise<boolean> {
  try {
    const settings = await getGeneralSettings();
    return settings?.coupon_enabled ?? true; // Default to true if not found
  } catch (error: unknown) {
    console.error('❌ Failed to check coupon status:', error);
    return true; // Default to enabled on error
  }
}

/**
 * Check if invoice fields are enabled (public function for checkout page)
 */
export async function isInvoiceEnabled(): Promise<boolean> {
  try {
    const settings = await getGeneralSettings();
    return settings?.invoice_enabled ?? true; // Default to true if not found
  } catch (error: unknown) {
    console.error('❌ Failed to check invoice status:', error);
    return true; // Default to enabled on error
  }
}

/**
 * Check if prices should be shown with VAT (public function for checkout and pricing pages)
 */
export async function shouldShowPricesWithVAT(): Promise<boolean> {
  try {
    const settings = await getGeneralSettings();
    return settings?.show_prices_with_vat ?? true; // Default to true (show with VAT) if not found
  } catch (error: unknown) {
    console.error('❌ Failed to check VAT display status:', error);
    return true; // Default to showing with VAT on error
  }
}
