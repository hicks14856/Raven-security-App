import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { EmergencyAlertEmail } from '../../../src/emails/EmergencyAlertEmail.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resendClient = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, userName, time, date, mapsLink, audioUrl, location } = await req.json();

    if (!to || !userName || !time || !date || !mapsLink) {
      throw new Error('Missing required fields');
    }

    // Render the email template
    const emailHtml = render(
      EmergencyAlertEmail({
        userName,
        time,
        date,
        mapsLink,
        audioUrl,
        location
      })
    );

    // Send the email using Resend
    const { data, error } = await resendClient.emails.send({
      from: 'Raven E-Alert <alerts@resend.dev>',
      to,
      subject: `🚨 Emergency Alert from ${userName}`,
      html: emailHtml,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
}); 