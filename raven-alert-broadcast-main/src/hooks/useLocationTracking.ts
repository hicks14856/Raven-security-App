
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export const useLocationTracking = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  const updateLocation = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
    const newLocation = { 
      lat: latitude, 
      lng: longitude,
      accuracy,
      altitude,
      heading,
      speed,
      timestamp: position.timestamp
    };
    
    setLocation(newLocation);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    console.error('Error getting location:', error);
    setIsLoading(false);
    setIsRefreshing(false);
    
    toast({
      title: "Location Error",
      description: `Failed to get your current location: ${error.message}. Please check your permissions.`,
      variant: "destructive",
    });
  }, [toast]);

  const startWatchingLocation = useCallback(() => {
    if (navigator.geolocation) {
      // Stop any existing watch
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      
      // Start a new watch with high accuracy enabled
      const id = navigator.geolocation.watchPosition(
        updateLocation,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
      
      setWatchId(id);
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
    }
  }, [watchId, updateLocation, handleError, toast]);

  const refreshLocation = () => {
    setIsRefreshing(true);
    
    navigator.geolocation.getCurrentPosition(
      updateLocation,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    startWatchingLocation();
    
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [startWatchingLocation]);

  return {
    location,
    isLoading,
    isRefreshing,
    refreshLocation
  };
};
