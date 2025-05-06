
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import GoogleMapLocation from "@/components/GoogleMapLocation";
import LocationDetails from "@/components/LocationDetails";
import LoadingIndicator from "@/components/LoadingIndicator";

const MyLocation = () => {
  const { location, isLoading, isRefreshing, refreshLocation } = useLocationTracking();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">My Location</h1>
          <Button 
            onClick={refreshLocation} 
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <GoogleMapLocation 
            location={location} 
            apiKey="YOUR_GOOGLE_MAPS_API_KEY"
          />
        )}
        
        {location && <LocationDetails location={location} />}
      </Card>
    </motion.div>
  );
};

export default MyLocation;
