import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SENDPULSE_URL = Deno.env.get('SENDPULSE_PURCHASE_URL');

    if (!SENDPULSE_URL) {
      console.error('❌ Missing SENDPULSE_PURCHASE_URL environment variable');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Server configuration error: Missing SendPulse URL' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const payload = await req.json();
    console.log('📦 Function received payload:', JSON.stringify(payload, null, 2));

    // Gelen veriyi ayrıştır (Client'tan gelen yapı: { eventData: {...}, orderId: "..." })
    // Eğer doğrudan düz veri gelirse (eski yapı veya manuel test), onu da destekle.
    const eventData = payload.eventData || payload;
    const orderId = payload.orderId || eventData.order_id || '';

    // Veri doğrulama
    if (!eventData || !eventData.email) {
      throw new Error('Invalid payload: Email is required');
    }

    // 3. Prepare SendPulse Body
    // SendPulse değişkenleri ile Client verilerini eşleştiriyoruz
    const sendPulseBody = {
      email: eventData.email,
      phone: eventData.phone,
      event_date: new Date().toISOString().split('T')[0],
      variables: {
        program_title: eventData.product_name || eventData.variables?.program_title || '',
        program_date: eventData.order_date || eventData.variables?.program_date || new Date().toISOString(),
        order_id: orderId,
        amount: eventData.amount || eventData.variables?.amount || 0,
        payment_method: eventData.payment_method || eventData.variables?.payment_method || '',
        full_name: eventData.name || eventData.variables?.full_name || '',
        course_id: eventData.product_id || eventData.variables?.course_id || '',
        upsell_course_id: eventData.upsell_course_id || eventData.variables?.upsell_course_id || ''
      }
    };

    console.log('🚀 Sending to SendPulse URL:', SENDPULSE_URL);
    console.log('📤 SendPulse Body:', JSON.stringify(sendPulseBody, null, 2));

    // 4. Send Request to SendPulse
    const response = await fetch(SENDPULSE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendPulseBody),
    });

    const responseText = await response.text();
    console.log(`📡 SendPulse Response (${response.status}):`, responseText);

    if (!response.ok) {
      throw new Error(`SendPulse API Error: ${response.status} - ${responseText}`);
    }

    let responseData = {};
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('🔥 Internal Function Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), // Client 'error' bekliyor
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
