
import { Compass, MapPin, Navigation, Clock, Globe, Info } from "lucide-react";
import { Location } from '@/hooks/useLocationTracking';
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface LocationDetailsProps {
  location: Location;
}

interface GeocodingResult {
  address?: string;
  loading: boolean;
}

const LocationDetails = ({ location }: LocationDetailsProps) => {
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult>({
    address: undefined,
    loading: false,
  });

  // Reverse geocoding to get address from coordinates
  useEffect(() => {
    const fetchAddress = async () => {
      setGeocodingResult(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`,
          { headers: { "Accept-Language": navigator.language } }
        );
        
        if (response.ok) {
          const data = await response.json();
          setGeocodingResult({
            address: data.display_name,
            loading: false,
          });
        } else {
          setGeocodingResult({ address: undefined, loading: false });
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        setGeocodingResult({ address: undefined, loading: false });
      }
    };

    if (location.lat && location.lng) {
      fetchAddress();
    }
  }, [location.lat, location.lng]);

  // Format the timestamp to a readable date and time
  const formattedTime = location.timestamp 
    ? new Date(location.timestamp).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : 'Unknown';

  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Location Details
        </h3>
        <Separator />
      </div>

      {/* Address information */}
      <div className="bg-muted/30 rounded-lg p-4 shadow-sm border border-muted">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="font-medium">Address</p>
            {geocodingResult.loading ? (
              <Skeleton className="h-10 w-full" />
            ) : geocodingResult.address ? (
              <p className="text-muted-foreground text-sm">{geocodingResult.address}</p>
            ) : (
              <p className="text-muted-foreground text-sm italic">Address information unavailable</p>
            )}
          </div>
        </div>
      </div>

      {/* Primary location data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coordinates */}
        <div className="bg-muted/30 rounded-lg p-4 shadow-sm border border-muted">
          <div className="flex items-start gap-3">
            <Navigation className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium">Coordinates</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Latitude</p>
                  <p className="font-mono text-sm">{location.lat.toFixed(6)}°</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Longitude</p>
                  <p className="font-mono text-sm">{location.lng.toFixed(6)}°</p>
                </div>
              </div>
              
              {location.altitude !== undefined && (
                <div className="mt-1">
                  <p className="text-xs text-muted-foreground">Altitude</p>
                  <p className="font-mono text-sm">{location.altitude.toFixed(1)} meters</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accuracy & Time */}
        <div className="bg-muted/30 rounded-lg p-4 shadow-sm border border-muted">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium">Signal Information</p>
              <div>
                {location.accuracy && (
                  <div className="flex items-center mb-2">
                    <p className="text-xs text-muted-foreground mr-2">Accuracy</p>
                    <Badge variant={location.accuracy < 50 ? "default" : location.accuracy < 100 ? "outline" : "secondary"}>
                      ±{Math.round(location.accuracy)} meters
                    </Badge>
                  </div>
                )}
                
                {location.speed !== undefined && (
                  <div className="flex items-center mb-2">
                    <p className="text-xs text-muted-foreground mr-2">Speed</p>
                    <Badge variant="outline">
                      {(location.speed * 3.6).toFixed(1)} km/h
                    </Badge>
                  </div>
                )}

                {location.heading !== undefined && (
                  <div className="flex items-center mb-2">
                    <p className="text-xs text-muted-foreground mr-2">Heading</p>
                    <div className="flex items-center">
                      <Compass className="h-4 w-4 mr-1" />
                      <span className="text-sm">{Math.round(location.heading)}°</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <div className="bg-muted/30 rounded-lg p-4 shadow-sm border border-muted">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">Last Updated</p>
            <p className="text-sm text-muted-foreground">{formattedTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;
