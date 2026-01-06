import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// SendPulse Event API URL
const SENDPULSE_API_URL = 'https://events.sendpulse.com/events/name/purchase';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();
    console.log('Function received payload:', payload);

    // Payload'ı SendPulse formatına uygun hale getir
    // Eğer client zaten doğru formatta gönderiyorsa direkt kullanabiliriz
    // Ancak burada bir güvenlik katmanı veya veri doğrulama eklenebilir
    
    const sendPulseBody = {
      email: payload.email,
      phone: payload.phone,
      event_date: new Date().toISOString().split('T')[0],
      variables: {
        program_title: payload.variables?.program_title || '',
        program_date: payload.variables?.program_date || '', // Tarih bilgisi
        order_id: payload.variables?.order_id || '',
        amount: payload.variables?.amount || 0,
        payment_method: payload.variables?.payment_method || '',
        full_name: payload.variables?.full_name || ''
      }
    };

    const sendPulseResponse = await fetch(SENDPULSE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendPulseBody),
    });

    const responseStatus = sendPulseResponse.status;
    const responseText = await sendPulseResponse.text();
    
    console.log(`SendPulse API Status: ${responseStatus}`);

    if (!sendPulseResponse.ok) {
      console.error('SendPulse external API call failed:', responseStatus, responseText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `SendPulse API returned status ${responseStatus}`,
          details: responseText
        }),
        {
          status: 200, 
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Event sent successfully', data: JSON.parse(responseText) }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Internal function error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error processing request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
