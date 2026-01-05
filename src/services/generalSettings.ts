import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export interface GeneralSettings {
  id: string;
  site_name: string;
  site_url: string;
  site_description: string;
  contact_email: string;
  support_email: string;
  address: string; // Yeni eklenen alan
  phone: string;   // Yeni eklenen alan
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
 * Get all general settings (single row) - DIRECT FETCH VERSION
 */
export async function getGeneralSettings(): Promise<GeneralSettings | null> {
  try {
    // console.log('🔵 [GeneralSettings] Fetching general settings with direct fetch...');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const url = `${supabaseUrl}/rest/v1/general_settings?limit=1`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pgrst.object+json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [GeneralSettings] HTTP Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('❌ [GeneralSettings] Failed to fetch general settings:', error);
    // toast.error('Genel ayarlar yüklenemedi'); // Kullanıcıyı her sayfada rahatsız etmemek için kapattım
    return null;
  }
}

/**
 * Update general settings - DIRECT FETCH VERSION
 */
export async function updateGeneralSettings(
  id: string,
  updates: Partial<Omit<GeneralSettings, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  try {
    console.log('🔵 [GeneralSettings] Updating general settings:', id);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const session = useAuthStore.getState().session;
    const accessToken = session?.access_token;
    
    const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${supabaseKey}`;
    
    const url = `${supabaseUrl}/rest/v1/general_settings?id=eq.${id}`;
    
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [GeneralSettings] Update error:', response.status, errorText);
      toast.error(`Güncelleme hatası: ${response.status}`);
      return false;
    }

    toast.success('Genel ayarlar güncellendi');
    return true;
  } catch (error: any) {
    console.error('❌ [GeneralSettings] Failed to update general settings:', error);
    toast.error(`Genel ayarlar güncellenemedi: ${error.message || 'Bilinmeyen hata'}`);
    return false;
  }
}

// Helper functions remain the same
export async function isCouponEnabled(): Promise<boolean> {
  try {
    const settings = await getGeneralSettings();
    return settings?.coupon_enabled ?? true;
  } catch (error: any) {
    return true;
  }
}

export async function isInvoiceEnabled(): Promise<boolean> {
  try {
    const settings = await getGeneralSettings();
    return settings?.invoice_enabled ?? true;
  } catch (error: any) {
    return true;
  }
}

export async function shouldShowPricesWithVAT(): Promise<boolean> {
  try {
    const settings = await getGeneralSettings();
    return settings?.show_prices_with_vat ?? true;
  } catch (error: any) {
    return true;
  }
}
