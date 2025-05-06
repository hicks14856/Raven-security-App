
import { supabase } from "@/integrations/supabase/client";

export const uploadEmergencyRecording = async (
  audioBlob: Blob,
  userId: string
): Promise<string | null> => {
  if (!audioBlob || !userId) return null;
  
  try {
    const fileName = `${Date.now()}.webm`;
    const folderPath = `${userId}`;
    const filePath = `${folderPath}/${fileName}`;
    
    console.log("Attempting to upload recording to emergency-recordings bucket");
    
    const { data, error } = await supabase.storage
      .from("emergency-recordings")
      .upload(filePath, audioBlob, {
        contentType: "audio/webm",
        cacheControl: "3600"
      });
    
    if (error) {
      console.error("Error uploading to storage:", error);
      throw error;
    }
    
    const { data: publicUrlData } = supabase.storage
      .from("emergency-recordings")
      .getPublicUrl(filePath);
    
    console.log("Recording uploaded successfully. Public URL:", publicUrlData.publicUrl);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading recording:", error);
    return null;
  }
};
