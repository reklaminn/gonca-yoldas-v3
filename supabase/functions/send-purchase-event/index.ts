/*
  # Use Specific SendPulse Event URL and Raw Payload
  1. Use the specific, pre-authenticated URL provided by SendPulse (stored in SENDPULSE_PURCHASE_URL).
  2. Send the raw orderData directly as the payload, as the URL handles authentication.
  3. Removed dependency on SENDPULSE_EVENT_ID and SECRET.
*/
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    // Parse request body
    const { orderData, orderId } = await req.json();
    
    // --- SendPulse URL Retrieval and Payload Simplification ---
    const sendPulseUrl = Deno.env.get('SENDPULSE_PURCHASE_URL');

    if (!sendPulseUrl) {
        throw new Error('SendPulse URL (SENDPULSE_PURCHASE_URL) not configured in Deno environment.');
    }

    // Use orderData directly as the payload, as per SendPulse instructions for the specific URL
    const sendPulsePayload = orderData; 
    // ---------------------------------------------------------

    console.log('📦 Processing purchase event for order:', orderId);
    console.log('📧 Customer email:', orderData.email);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Send to SendPulse
    console.log('📤 Sending raw payload to SendPulse specific endpoint:', sendPulseUrl);
    const sendPulseResponse = await fetch(sendPulseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendPulsePayload) // Send the raw order data
    });

    const sendPulseSuccess = sendPulseResponse.ok;
    let sendPulseError = null;

    if (!sendPulseSuccess) {
      const errorText = await sendPulseResponse.text();
      sendPulseError = `SendPulse API error: ${sendPulseResponse.status} - ${errorText}`;
      console.error('❌ SendPulse error:', sendPulseError);
    } else {
      console.log('✅ SendPulse event sent successfully');
    }

    // Update order in database
    console.log('💾 Updating order status in database...');
    const { error: updateError } = await supabase.from('orders').update({
      sendpulse_sent: sendPulseSuccess,
      sendpulse_sent_at: sendPulseSuccess ? new Date().toISOString() : null,
      sendpulse_error: sendPulseError
    }).eq('id', orderId);

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log('✅ Order status updated in database');

    // Return response
    return new Response(JSON.stringify({
      success: true,
      sendpulse_sent: sendPulseSuccess,
      message: sendPulseSuccess ? 'Purchase event sent successfully' : 'Order created but SendPulse failed'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
      'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
