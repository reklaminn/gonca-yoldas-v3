/*
  # Send Contact Event (CORRECTED for Contact Form)
  
  Bu fonksiyon ÖZEL OLARAK İletişim Formu içindir.
  1. 'contact_submissions' tablosunu günceller.
  2. 'contactData' ve 'submissionId' parametrelerini bekler.
  3. SendPulse için 'SENDPULSE_CONTACT_URL' ortam değişkenini kullanır.
     (Yedek olarak body içindeki _debugUrl'i de kabul eder)
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Parse Request Body
    const { contactData, submissionId, _debugUrl } = await req.json();
    
    if (!submissionId) {
      throw new Error('Submission ID is required');
    }

    console.log('📦 Processing contact event for submission:', submissionId);

    // 3. Get SendPulse URL
    // Önce sunucu ortam değişkenine bakar, yoksa client'tan gelene bakar.
    const sendPulseUrl = Deno.env.get('SENDPULSE_CONTACT_URL') || _debugUrl;
    
    if (!sendPulseUrl) {
      throw new Error('SENDPULSE_CONTACT_URL not configured in Supabase Secrets or provided in body');
    }

    // 4. Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // 5. Send to SendPulse
    console.log('📤 Sending payload to SendPulse Contact URL...');
    
    const sendPulseResponse = await fetch(sendPulseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
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

    // 6. Update Database (contact_submissions tablosu)
    console.log('💾 Updating contact_submissions table...');
    
    const { error: updateError } = await supabase
      .from('contact_submissions')
      .update({
        sendpulse_sent: sendPulseSuccess,
        sendpulse_sent_at: sendPulseSuccess ? new Date().toISOString() : null,
        sendpulse_error: sendPulseError
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('❌ Database update error:', updateError);
    } else {
      console.log('✅ Database updated successfully');
    }

    // 7. Return Response
    return new Response(JSON.stringify({
      success: true,
      sendpulse_sent: sendPulseSuccess,
      message: sendPulseSuccess ? 'Contact event sent successfully' : 'Saved but SendPulse failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    console.error('❌ Function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
