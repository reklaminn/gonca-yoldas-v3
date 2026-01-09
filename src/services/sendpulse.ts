import { supabase } from '@/lib/supabaseClient';

interface SendPulseOrderData {
  email: string;
  phone: string;
  fullName?: string;
  paymentMethod: string;
  paymentStatus: string;
  orderId?: string;
}

interface SendPulseProgramData {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  sendpulse_id?: string;        // SendPulse sistemindeki asıl ID
  sendpulse_upsell_id?: string; // Programın varsayılan upsell ID'si
}

export const formatOrderForSendPulse = (
  orderData: SendPulseOrderData,
  programData: SendPulseProgramData,
  totalAmount: number,
  selectedUpsellIds?: string
) => {
  // 1. Ana Kurs ID'si
  const courseId = programData.sendpulse_id && programData.sendpulse_id.trim() !== '' 
    ? programData.sendpulse_id 
    : programData.id;

  // 2. Upsell ID'si
  // Eğer sepette seçilmiş özel upsell'ler varsa onları kullan, yoksa programın varsayılanını kullan
  const upsellId = selectedUpsellIds && selectedUpsellIds.trim() !== ''
    ? selectedUpsellIds
    : (programData.sendpulse_upsell_id || '');

  console.log('📦 [SendPulse] Veri Hazırlanıyor:', { 
    courseId, 
    upsellId, 
    rawUpsellId: programData.sendpulse_upsell_id,
    selectedUpsellIds 
  });

  return {
    email: orderData.email,
    phone: orderData.phone,
    event_date: new Date().toISOString().split('T')[0],
    variables: {
      program_title: programData.title,
      program_date: new Date().toISOString(),
      order_id: orderData.orderId || '',
      amount: totalAmount,
      payment_method: orderData.paymentMethod,
      full_name: orderData.fullName || orderData.email,
      course_id: courseId,          
      upsell_course_id: upsellId
    }
  };
};

export const sendPurchaseEvent = async (eventData: any, orderId: string) => {
  try {
    console.log('📤 [SendPulse] Gönderiliyor:', JSON.stringify(eventData, null, 2));

    // URL'i .env'den veya varsayılan yapıdan oluştur
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Edge Function URL'ini manuel oluştur (invoke yerine fetch kullanmak CORS sorunlarını azaltır)
    // Örn: https://xyz.supabase.co/functions/v1/send-purchase-event
    const functionUrl = `${supabaseUrl}/functions/v1/send-purchase-event`;

    console.log('🔗 [SendPulse] Hedef URL:', functionUrl);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        // 'apikey' header'ı bazı durumlarda gereklidir
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify(eventData)
    });

    let data;
    const responseText = await response.text();
    
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    if (!response.ok) {
      throw new Error(`Function Error (${response.status}): ${data.error || data.message || response.statusText}`);
    }

    console.log('✅ [SendPulse] Başarılı:', data);

    // Başarılı gönderimi veritabanına işle
    await supabase
      .from('orders')
      .update({ 
        sendpulse_sent: true,
        sendpulse_sent_at: new Date().toISOString()
      })
      .eq('id', orderId);

    return { success: true, data };

  } catch (error: any) {
    console.error('❌ [SendPulse] Hata:', error);
    
    // Hatayı veritabanına işle
    await supabase
      .from('orders')
      .update({ 
        sendpulse_error: error.message || 'Unknown error'
      })
      .eq('id', orderId);

    return { success: false, error: error.message };
  }
};

export const sendContactEvent = async (contactData: any, submissionId: string) => {
  try {
    console.log('📤 [SendPulse] Contact Event Gönderiliyor:', JSON.stringify(contactData, null, 2));

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const functionUrl = `${supabaseUrl}/functions/v1/send-contact-event`;

    console.log('🔗 [SendPulse] Hedef URL:', functionUrl);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({ ...contactData, submission_id: submissionId })
    });

    let data;
    const responseText = await response.text();
    
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    if (!response.ok) {
      throw new Error(`Function Error (${response.status}): ${data.error || data.message || response.statusText}`);
    }

    console.log('✅ [SendPulse] Contact Event Başarılı:', data);
    return { success: true, data };

  } catch (error: any) {
    console.error('❌ [SendPulse] Contact Event Hatası:', error);
    return { success: false, error: error.message };
  }
};
