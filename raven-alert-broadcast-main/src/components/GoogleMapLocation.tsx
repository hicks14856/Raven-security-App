
import { useEffect, useRef, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Location } from '@/hooks/useLocationTracking';

interface GoogleMapLocationProps {
  location: Location | null;
  apiKey: string;
}

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.5rem'
};

const GoogleMapLocation = ({ location, apiKey }: GoogleMapLocationProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  
  const center = location || { lat: 0, lng: 0 };

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (location) {
      const bounds = new window.google.maps.LatLngBounds(location);
      map.fitBounds(bounds);
      map.setZoom(15);
    }
  }, [location]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Create or update accuracy circle when location changes
  useEffect(() => {
    if (mapRef.current && location && location.accuracy) {
      // If a circle already exists, remove it first
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
      
      // Create a new circle
      circleRef.current = new google.maps.Circle({
        center: location,
        radius: location.accuracy,
        map: mapRef.current,
        fillColor: "#4f46e5",
        fillOpacity: 0.15,
        strokeColor: "#4f46e5",
        strokeOpacity: 0.3,
        strokeWeight: 1,
      });
    }
    
    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [location]);

  // Update map center when location changes
  useEffect(() => {
    if (mapRef.current && location) {
      mapRef.current.panTo({ lat: location.lat, lng: location.lng });
    }
  }, [location]);

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true
        }}
      >
        {location && (
          <Marker 
            position={location} 
            animation={google.maps.Animation.DROP}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4f46e5",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapLocation;
