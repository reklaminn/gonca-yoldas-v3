import { supabase } from '@/lib/supabaseClient';

export interface ContactEventData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

/**
 * Sends a contact event to SendPulse via Supabase Edge Function.
 * USES DIRECT FETCH FOR BETTER DEBUGGING LOGS
 */
export const sendContactEvent = async (data: ContactEventData, submissionId: string) => {
  const startTime = Date.now();
  console.group('🚀 SendPulse Debugger');
  console.log(`[${new Date().toISOString()}] Starting request...`);
  console.log('📦 Payload Submission ID:', submissionId);

  // 1. URL ve Key Hazırlığı
  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // URL'in sonuna /functions/v1/... ekliyoruz
  const functionUrl = `${projectUrl}/functions/v1/send-contact-event`;
  
  console.log('📍 Target URL:', functionUrl);

  // 2. Payload Hazırlığı
  const payload = {
    contactData: data,
    submissionId: submissionId,
    _debugUrl: import.meta.env.SENDPULSE_CONTACT_URL
  };

  try {
    // 3. Timeout Kontrolcüsü (15 Saniye)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('⏰ Timeout trigger fired at 15s');
      controller.abort();
    }, 15000);

    console.log('📡 Sending direct FETCH request...');
    
    // Supabase SDK yerine native fetch kullanıyoruz ki hatayı net görelim
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}` // Anon key ile yetkilendirme
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId); // İşlem biterse sayacı durdur

    const duration = Date.now() - startTime;
    console.log(`⏱️ Request finished in ${duration}ms`);
    console.log(`📊 HTTP Status: ${response.status} ${response.statusText}`);

    // 4. Hata Yanıtını Okuma
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server Error Body:', errorText);
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    // 5. Başarılı Yanıtı Okuma
    const responseData = await response.json();
    console.log('✅ Success Response Body:', responseData);
    console.groupEnd();
    return responseData;

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ Request FAILED after ${duration}ms`);
    
    if (error.name === 'AbortError') {
      console.error('💀 TIMEOUT ERROR: Request took longer than 15 seconds.');
      console.error('Possible Causes:');
      console.error('1. Edge Function Cold Start is extremely slow.');
      console.error('2. The Function is crashing silently before sending headers.');
      console.error('3. Network firewall/proxy is blocking the connection.');
    } else {
      console.error('💥 Network/Code Error:', error.message);
      console.error('Full Error Object:', error);
    }
    
    console.groupEnd();
    // Soft Fail: UI akışını bozmamak için null dönüyoruz
    return null;
  }
};
