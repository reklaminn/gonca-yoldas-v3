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
 * Get all general settings (single row) - DIRECT FETCH VERSION
 */
export async function getGeneralSettings(): Promise<GeneralSettings | null> {
  try {
    console.log('🔵 [GeneralSettings] Fetching general settings with direct fetch...');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const url = `${supabaseUrl}/rest/v1/general_settings?limit=1`;
    
    console.log('🔵 [GeneralSettings] Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pgrst.object+json' // Request single object instead of array
      }
    });

    console.log('🔵 [GeneralSettings] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [GeneralSettings] HTTP Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [GeneralSettings] General settings fetched:', data);
    
    return data;
  } catch (error: any) {
    console.error('❌ [GeneralSettings] Failed to fetch general settings:', error);
    toast.error('Genel ayarlar yüklenemedi');
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
    console.log('📝 [GeneralSettings] Updates to apply:', updates);

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
          console.log('🔵 [GeneralSettings] Using user access token');
        }
      } catch (e) {
        console.warn('⚠️ [GeneralSettings] Could not parse auth storage');
      }
    }

    const url = `${supabaseUrl}/rest/v1/general_settings?id=eq.${id}`;
    
    console.log('🔵 [GeneralSettings] Updating at:', url);

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

    console.log('🔵 [GeneralSettings] Update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [GeneralSettings] Update error:', response.status, errorText);
      toast.error(`Güncelleme hatası: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ [GeneralSettings] General settings updated:', data);
    
    toast.success('Genel ayarlar güncellendi');
    return true;
  } catch (error: any) {
    console.error('❌ [GeneralSettings] Failed to update general settings:', error);
    toast.error(`Genel ayarlar güncellenemedi: ${error.message || 'Bilinmeyen hata'}`);
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
  } catch (error: any) {
    console.error('❌ [GeneralSettings] Failed to check coupon status:', error);
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
  } catch (error: any) {
    console.error('❌ [GeneralSettings] Failed to check invoice status:', error);
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
  } catch (error: any) {
    console.error('❌ [GeneralSettings] Failed to check VAT display status:', error);
    return true; // Default to showing with VAT on error
  }
}
