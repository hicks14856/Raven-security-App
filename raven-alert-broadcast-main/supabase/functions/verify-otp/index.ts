
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { phoneNumber, otp } = await req.json();
    
    if (!phoneNumber || !otp) {
      return new Response(
        JSON.stringify({ error: "Phone number and OTP are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if OTP exists and is valid
    const { data, error } = await supabase
      .from("phone_verification")
      .select("*")
      .eq("phone_number", phoneNumber)
      .eq("otp", otp)
      .single();
    
    if (error || !data) {
      console.error("Error verifying OTP:", error);
      return new Response(
        JSON.stringify({ verified: false, error: "Invalid verification code" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Check if OTP has expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ verified: false, error: "Verification code has expired" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Mark user as verified in profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ phone_verified: true })
      .eq("phone_number", phoneNumber);
    
    if (updateError) {
      console.error("Error updating profile:", updateError);
    }
    
    // Delete the used OTP
    await supabase
      .from("phone_verification")
      .delete()
      .eq("phone_number", phoneNumber);
    
    return new Response(
      JSON.stringify({ verified: true, message: "Phone number verified successfully" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in verify-otp function:", error);
    
    return new Response(
      JSON.stringify({ 
        verified: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
