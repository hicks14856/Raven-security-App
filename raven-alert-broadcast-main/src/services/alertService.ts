
import { supabase } from "@/integrations/supabase/client";
import { AlertResult } from "@/types/emergency";

export const saveEmergencyAlert = async (
  userId: string,
  latitude: number,
  longitude: number,
  audioUrl: string | null,
  userName: string,
  mapsLink: string
): Promise<void> => {
  try {
    const { error: alertError } = await supabase.from('emergency_alerts').insert({
      user_id: userId,
      location_lat: latitude,
      location_lng: longitude,
      audio_recording_url: audioUrl,
      status: audioUrl ? 'sent' : 'failed',
      user_name: userName,
      google_maps_link: mapsLink
    });
    
    if (alertError) {
      console.error("Error saving alert record:", alertError);
    }
    
    // Also save to emergency_recordings table for the recordings page
    if (audioUrl) {
      const { error: recordingError } = await supabase.from('emergency_recordings').insert({
        user_id: userId,
        audio_url: audioUrl,
        status: 'sent'
      });
      
      if (recordingError) {
        console.error("Error saving recording record:", recordingError);
      }
    }
  } catch (error) {
    console.error("Error saving emergency alert:", error);
  }
};

export const sendEmergencyAlert = async (
  contacts: any[],
  location: { latitude: number; longitude: number },
  time: string,
  date: string,
  mapsLink: string,
  userName: string,
  audioUrl: string | null,
  userPhone: string | null
): Promise<any> => {
  if (!contacts || contacts.length === 0) {
    throw new Error('No emergency contacts found');
  }
  
  console.log("Sending emergency alert with contacts:", contacts);
  
  const { data, error } = await supabase.functions.invoke(
    "send-emergency-alert",
    {
      body: {
        contacts, // Pass the entire contacts array
        location,
        time,
        date,
        mapsLink,
        userName,
        audioUrl,
        userPhone
      },
    }
  );
  
  if (error) throw error;
  
  console.log("Alert sending result:", data);
  return data;
};
