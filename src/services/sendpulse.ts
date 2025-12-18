import { toast } from 'sonner';

interface SendPulseOrderData {
  email: string;
  phone: string;
  product_name: string;
  product_id: string;
  product_link: string;
  product_price: string;
  product_img_url: string;
  order_date: string;
  name: string;
  fatura_il: string;
  fatura_ilce: string;
  fatura_vergi_no?: string;
  fatura_vergi_daire?: string;
  kuponkodu?: string;
  odeme_durumu: string;
  odeme_sekli: string;
  odeme_taksit: string;
}

// Edge Function Endpoint
const SUPABASE_FUNCTION_URL = 'https://jlwsapdvizzriomadhxj.supabase.co/functions/v1/send-purchase-event';

// ✅ NEW: Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  backoffMultiplier: 2,
};

/**
 * ✅ NEW: Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  operationName: string,
  config = RETRY_CONFIG
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      console.log(`🔄 ${operationName} - Attempt ${attempt + 1}/${config.maxRetries + 1}`);
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`❌ ${operationName} - Attempt ${attempt + 1} failed:`, error);
      
      // Don't retry on last attempt
      if (attempt < config.maxRetries) {
        const delay = Math.min(
          config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * ✅ IMPROVED: Send purchase event to SendPulse (via Supabase Edge Function)
 * 
 * CRITICAL IMPROVEMENTS:
 * - Non-blocking: Checkout continues even if SendPulse fails
 * - Retry mechanism: 3 attempts with exponential backoff
 * - Comprehensive logging: All errors logged for debugging
 * - Graceful degradation: Order still created on SendPulse failure
 * 
 * @param orderData - Order data to send
 * @param orderId - The ID of the order created in the database
 * @returns Promise<{ success: boolean; error?: string }> - Result with error details
 */
export async function sendPurchaseEvent(
  orderData: SendPulseOrderData,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔵 ========================================');
    console.log('🔵 SENDING TO SENDPULSE VIA EDGE FUNCTION');
    console.log('🔵 ========================================');
    
    // 1. Create the wrapped payload expected by the Edge Function
    const payload = { orderData, orderId };

    console.log('📤 Function Endpoint:', SUPABASE_FUNCTION_URL);
    console.log('📤 Order ID:', orderId);
    console.log('📤 Email:', orderData.email);
    console.log('📤 Product:', orderData.product_name);

    // ✅ NEW: Retry mechanism with exponential backoff
    const responseData = await retryWithBackoff(
      async () => {
        const response = await fetch(SUPABASE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log('📥 Function Response Status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Supabase Function HTTP Error:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('📥 Function Response Data:', JSON.stringify(data, null, 2));

        if (data.success !== true) {
          console.error('❌ SendPulse Function reported failure:', data.message);
          console.error('❌ SendPulse Details:', data.details);
          throw new Error(data.message || 'SendPulse API error');
        }

        return data;
      },
      'SendPulse API Call'
    );
    
    console.log('✅ ========================================');
    console.log('✅ SENDPULSE EVENT SENT SUCCESSFULLY');
    console.log('✅ ========================================');
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ ========================================');
    console.error('❌ SENDPULSE API ERROR (ALL RETRIES FAILED)');
    console.error('❌ ========================================');
    console.error('❌ Error:', error);
    console.error('❌ Error Message:', error?.message);
    console.error('❌ Order ID:', orderId);
    console.error('❌ Email:', orderData.email);
    console.error('❌ ========================================');
    
    // ✅ NEW: Return error details instead of just false
    return {
      success: false,
      error: error?.message || 'Unknown error',
    };
  }
}

/**
 * Format order data for SendPulse API
 */
export function formatOrderForSendPulse(
  formData: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    district: string;
    taxOffice?: string;
    taxNumber?: string;
    couponCode?: string;
    installment: string;
    paymentMethod: string;
    paymentStatus: string;
  },
  program: {
    id: string;
    slug: string;
    title: string;
    price: number;
    image: string;
  },
  total: number
): SendPulseOrderData {
  // Format phone number (remove spaces and add + if needed)
  let formattedPhone = formData.phone.replace(/\D/g, '');
  
  // Add +90 if not present
  if (!formattedPhone.startsWith('90')) {
    formattedPhone = '90' + formattedPhone;
  }
  
  // Add + prefix
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+' + formattedPhone;
  }

  console.log('📞 Original Phone:', formData.phone);
  console.log('📞 Formatted Phone:', formattedPhone);

  // Format date as YYYY-MM-DD
  const orderDate = new Date().toISOString().split('T')[0];

  // Product link (full URL) - safe for frontend only
  const productLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/programs/${program.slug}`
      : `https://yourdomain.com/programs/${program.slug}`;

  // Payment method translation
  const paymentMethodText = formData.paymentMethod === 'credit_card' ? 'Kredi Kartı' : 'Havale/EFT';

  // Payment status translation
  const paymentStatusText = formData.paymentStatus === 'completed' ? 'Tamamlandı' : 'Beklemede';

  const sendPulseData = {
    email: formData.email,
    phone: formattedPhone,
    product_name: program.title,
    product_id: program.id,
    product_link: productLink,
    product_price: `${total.toFixed(2)} TRY`,
    product_img_url: program.image,
    order_date: orderDate,
    name: formData.fullName,
    fatura_il: formData.city,
    fatura_ilce: formData.district,
    fatura_vergi_no: formData.taxNumber || '',
    fatura_vergi_daire: formData.taxOffice || '',
    kuponkodu: formData.couponCode || '',
    odeme_durumu: paymentStatusText,
    odeme_sekli: paymentMethodText,
    odeme_taksit: formData.installment,
  };

  console.log('📦 Formatted SendPulse Data:', JSON.stringify(sendPulseData, null, 2));

  return sendPulseData;
}
