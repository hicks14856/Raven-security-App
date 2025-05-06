import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useContacts } from "./useContacts";
import { parseAlertErrors } from "@/lib/utils";
import type { AlertResult, RecordingStatus } from "@/types/emergency";
import { startMediaRecording, stopMediaRecording } from "@/services/recordingService";
import { uploadEmergencyRecording } from "@/services/storageService";
import { saveEmergencyAlert, sendEmergencyAlert } from "@/services/alertService";

export type { AlertResult } from "@/types/emergency";

export const useEmergencyRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("idle");
  const [recordingTimeLeft, setRecordingTimeLeft] = useState<number>(10);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { contacts } = useContacts();
  const audioChunksRef = useRef<BlobPart[]>([]);
  
  useEffect(() => {
    if (isRecording) {
      setRecordingTimeLeft(10);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTimeLeft(prev => {
          if (prev <= 1) {
            if (mediaRecorder && isRecording) {
              stopRecording();
              clearInterval(timerRef.current!);
              
              // Wait until recording is fully stopped before sending the alert
              setTimeout(() => {
                sendAlert();
              }, 500);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording, mediaRecorder]);
  
  const startRecording = async (): Promise<AlertResult> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to record audio.",
      });
      return { success: false, error: "Authentication required" };
    }
    
    if (contacts.length === 0) {
      toast({
        variant: "destructive",
        title: "No emergency contacts",
        description: "Please add at least one emergency contact first.",
      });
      return { success: false, error: "No emergency contacts" };
    }
    
    setRecordingStatus("loading");
    
    try {
      const { recorder, stream, audioChunks } = await startMediaRecording();
      audioChunksRef.current = audioChunks;
      
      recorder.addEventListener("stop", () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setIsRecording(false);
        setRecordingStatus("stopping");
      });
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingStatus("recording");
      
      toast({
        title: "Recording started",
        description: "Your emergency audio is now being recorded (10 seconds).",
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      setRecordingStatus("idle");
      
      toast({
        variant: "destructive",
        title: "Recording Failed",
        description: error instanceof Error ? error.message : "Could not access microphone.",
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Could not access microphone" 
      };
    }
  };
  
  const stopRecording = () => {
    stopMediaRecording(mediaRecorder);
    
    toast({
      title: "Recording stopped",
      description: "Your emergency audio recording has been saved.",
    });
  };
  
  const sendAlert = async (): Promise<AlertResult> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to send an emergency alert.",
      });
      return { success: false, error: "Authentication required" };
    }
    
    try {
      setRecordingStatus("sending");
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      const now = new Date();
      const time = now.toLocaleTimeString();
      const date = now.toLocaleDateString();
      
      const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      
      let audioUrl = null;
      if (audioBlob) {
        console.log("Uploading audio recording...");
        audioUrl = await uploadEmergencyRecording(audioBlob, user.id);
        console.log("Audio upload result:", audioUrl);
      }
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone_number')
        .eq('id', user.id)
        .maybeSingle();
      
      const userName = profileData?.full_name || user.email?.split('@')[0] || 'User';
      
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);
      
      if (contactsError || !contactsData || contactsData.length === 0) {
        throw new Error('No emergency contacts found');
      }
      
      const data = await sendEmergencyAlert(
        contactsData,
        { latitude, longitude },
        time,
        date,
        mapsLink,
        userName,
        audioUrl,
        profileData?.phone_number
      );
      
      setRecordingStatus("sent");
      
      // Save the alert and recording records
      await saveEmergencyAlert(
        user.id,
        latitude,
        longitude,
        audioUrl,
        userName,
        mapsLink
      );
      
      // Show success message when alerts are sent successfully
      if (data.successful > 0) {
        toast({
          title: "Emergency Alert Sent",
          description: `Successfully sent alerts to ${data.successful} emergency contact${data.successful > 1 ? 's' : ''}.`,
          variant: "default",
        });
        
        // Handle testing mode specifically
        if (data.testingMode && data.testingMode > 0) {
          toast({
            variant: "default",
            title: "Testing Mode Notice",
            description: "Some contacts could not be notified because the app is in testing mode. In a real emergency, all contacts would be notified.",
          });
          
          return { 
            success: true, 
            warning: "App is in testing mode. In production, all contacts would be notified.",
            results: data.results 
          };
        }
        
        if (data.failed > 0) {
          const warningMessage = parseAlertErrors(data.results);
          
          toast({
            variant: "destructive",
            title: "Some Alerts Failed",
            description: warningMessage || `${data.failed} notification(s) failed to deliver.`,
          });
          
          return { 
            success: true, 
            warning: warningMessage || `Alert sent but ${data.failed} notification(s) failed to deliver.`,
            results: data.results 
          };
        }
        
        return { success: true, results: data.results };
      } else {
        toast({
          variant: "destructive",
          title: "Alert Failed",
          description: "Failed to send emergency alerts to your contacts.",
        });
        
        return { 
          success: false, 
          error: "Failed to send alerts to any contacts.",
          results: data.results
        };
      }
      
    } catch (error) {
      console.error("Error sending emergency alert:", error);
      
      setRecordingStatus("idle");
      
      toast({
        variant: "destructive",
        title: "Alert Failed",
        description: error instanceof Error ? error.message : "Failed to send emergency alert.",
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to send emergency alert." 
      };
    }
  };
  
  return {
    isRecording,
    recordingStatus,
    recordingTimeLeft,
    startRecording,
    stopRecording,
    sendEmergencyAlert: sendAlert,
  };
};
