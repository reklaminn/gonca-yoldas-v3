<boltAction type="file" filePath="supabase/functions/send-purchase-event/index.ts">import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// SendPulse Event API URL
const SENDPULSE_API_URL = 'https://events.sendpulse.com/events/name/purchase';

// Supabase Edge Function to handle server-side SendPulse API call
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

    // 1. Call the external SendPulse API
    const sendPulseResponse = await fetch(SENDPULSE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // NOTE: If SendPulse requires an Authorization header (which caused the 401), 
        // you must add it here using Deno.env.get('YOUR_SENDPULSE_SECRET')
      },
      body: JSON.stringify(payload),
    });

    const responseStatus = sendPulseResponse.status;
    const responseText = await sendPulseResponse.text();
    
    console.log(`SendPulse API Status: ${responseStatus}`);
    console.log(`SendPulse API Response: ${responseText}`);

    if (!sendPulseResponse.ok) {
      // Log the failure but return a structured error response to the client
      console.error('SendPulse external API call failed:', responseStatus, responseText);
      
      // Return status 200 to the client fetch, but indicate internal failure
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

    // 2. Success response from SendPulse
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
