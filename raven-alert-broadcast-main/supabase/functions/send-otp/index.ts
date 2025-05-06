
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOTP = async (phoneNumber: string, otp: string) => {
  // Store OTP in database with expiration (e.g., 10 minutes)
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // First delete any existing OTPs for this phone number
  await supabase
    .from("phone_verification")
    .delete()
    .eq("phone_number", phoneNumber);
  
  // Insert new OTP
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes from now
  
  const { error } = await supabase
    .from("phone_verification")
    .insert({
      phone_number: phoneNumber,
      otp: otp,
      expires_at: expiresAt.toISOString(),
    });
  
  if (error) {
    console.error("Error storing OTP:", error);
    throw new Error("Failed to store verification code");
  }
};

const sendSMS = async (phoneNumber: string, otp: string) => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.error("Twilio credentials not set");
    throw new Error("SMS service is not configured");
  }

  const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append("To", phoneNumber);
  formData.append("From", TWILIO_PHONE_NUMBER);
  formData.append("Body", `Your Raven E-Alert verification code is: ${otp}`);
  
  try {
    const response = await fetch(twilioEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      },
      body: formData.toString(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Twilio API error:", data);
      throw new Error(data.message || "Failed to send SMS");
    }
    
    return data;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { phoneNumber } = await req.json();
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Generate a 6-digit OTP
    const otp = generateOTP();
    
    // Store the OTP in the database
    await storeOTP(phoneNumber, otp);
    
    // Send the OTP via SMS
    await sendSMS(phoneNumber, otp);
    
    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in send-otp function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
