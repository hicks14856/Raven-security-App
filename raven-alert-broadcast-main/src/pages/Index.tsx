
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, MapPin, User, Clock } from "lucide-react";
import EmergencyButton from "@/components/EmergencyButton";
import ScheduledAlertButton from "@/components/ScheduledAlertButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AlertsChart from "@/components/dashboard/AlertsChart";
import { useEmergencyRecording } from "@/hooks/useEmergencyRecording";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useLocationTracking();
  const { startRecording, recordingStatus, recordingTimeLeft } = useEmergencyRecording();
  const [userData, setUserData] = useState<any>(null);
  const [contactsCount, setContactsCount] = useState(0);
  const [alertsData, setAlertsData] = useState<any[]>([]);
  const [scheduledAlertsCount, setScheduledAlertsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch user data
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          
          setUserData(profileData);
          
          // Fetch contacts count
          const { data: contactsData, error: contactsError } = await supabase
            .from("contacts")
            .select("*", { count: "exact" })
            .eq("user_id", user.id);
          
          if (!contactsError) {
            setContactsCount(contactsData?.length || 0);
          }
          
          // Fetch emergency alerts
          const { data: alertsData, error: alertsError } = await supabase
            .from("emergency_alerts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          
          if (!alertsError) {
            setAlertsData(alertsData || []);
          }
          
          // Fetch scheduled alerts count
          const { data: scheduledData, error: scheduledError } = await supabase
            .from("scheduled_alerts")
            .select("*", { count: "exact" })
            .eq("user_id", user.id)
            .eq("status", "pending");
          
          if (!scheduledError) {
            setScheduledAlertsCount(scheduledData?.length || 0);
          }
          
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Set up a subscription for real-time updates
    const contacts = supabase
      .channel('contacts-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, 
        payload => {
          // Properly type check if payload.new exists and has user_id property
          if (payload.new && user && typeof payload.new === 'object' && 'user_id' in payload.new && payload.new.user_id === user.id) {
            // Refresh contacts count
            supabase
              .from("contacts")
              .select("*", { count: "exact" })
              .eq("user_id", user.id)
              .then(({ data }) => {
                setContactsCount(data?.length || 0);
              });
          }
        }
      )
      .subscribe();
      
    const alerts = supabase
      .channel('alerts-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_alerts' }, 
        payload => {
          // Properly type check if payload.new exists and has user_id property
          if (payload.new && user && typeof payload.new === 'object' && 'user_id' in payload.new && payload.new.user_id === user.id) {
            // Refresh alerts data
            supabase
              .from("emergency_alerts")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .then(({ data }) => {
                setAlertsData(data || []);
              });
          }
        }
      )
      .subscribe();
      
    const scheduledAlerts = supabase
      .channel('scheduled-alerts-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scheduled_alerts' }, 
        payload => {
          // Properly type check if payload.new exists and has user_id property
          if (payload.new && user && typeof payload.new === 'object' && 'user_id' in payload.new && payload.new.user_id === user.id) {
            // Refresh scheduled alerts count
            supabase
              .from("scheduled_alerts")
              .select("*", { count: "exact" })
              .eq("user_id", user.id)
              .eq("status", "pending")
              .then(({ data }) => {
                setScheduledAlertsCount(data?.length || 0);
              });
          }
        }
      )
      .subscribe();
    
    return () => {
      contacts.unsubscribe();
      alerts.unsubscribe();
      scheduledAlerts.unsubscribe();
    };
  }, [user]);
  
  const handleEmergencyActivate = async () => {
    const result = await startRecording();
    
    // Properly handle the result based on the discriminated union type
    if (!result.success && 'error' in result) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 pb-8">
      {/* SOS Button - Centered at the top */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-8 pt-4"
      >
        <EmergencyButton 
          onActivate={handleEmergencyActivate} 
          isLoading={recordingStatus === "loading" || recordingStatus === "sending"} 
          recordingCountdown={recordingStatus === "recording" ? recordingTimeLeft : null}
        />
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
        {/* Scheduled Alert Button - Spans 4 columns on large screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="md:col-span-6 lg:col-span-4"
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Schedule Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduledAlertButton className="w-full" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergency Contacts - Spans 4 columns on large screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="md:col-span-3 lg:col-span-4"
        >
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-raven-blue h-full">
            <CardHeader className="pb-2">
              <CardDescription>Emergency Contacts</CardDescription>
              <CardTitle className="text-3xl">{contactsCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center">
                <User className="mr-1 h-4 w-4 text-raven-blue" />
                {contactsCount === 0 ? "No contacts added" : 
                  contactsCount === 1 ? "1 person to alert" : 
                  `${contactsCount} people to alert`}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts Sent - Spans 4 columns on large screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="md:col-span-3 lg:col-span-4"
        >
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-raven-lavender h-full">
            <CardHeader className="pb-2">
              <CardDescription>Alerts Sent</CardDescription>
              <CardTitle className="text-3xl">{alertsData.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center">
                <Bell className="mr-1 h-4 w-4 text-raven-lavender" />
                {alertsData.length === 0 ? "No alerts triggered" : 
                  alertsData.length === 1 ? "1 emergency alert sent" : 
                  `${alertsData.length} emergency alerts sent`}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Scheduled Alerts - Spans 6 columns on large screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="md:col-span-3 lg:col-span-6"
        >
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-raven-dark h-full">
            <CardHeader className="pb-2">
              <CardDescription>Scheduled Alerts</CardDescription>
              <CardTitle className="text-3xl">{scheduledAlertsCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center">
                <Clock className="mr-1 h-4 w-4 text-raven-dark" />
                {scheduledAlertsCount === 0 ? "No pending alerts" : 
                  scheduledAlertsCount === 1 ? "1 alert scheduled" : 
                  `${scheduledAlertsCount} alerts scheduled`}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Last Location - Spans 6 columns on large screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="md:col-span-3 lg:col-span-6"
        >
          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-raven-navy h-full">
            <CardHeader className="pb-2">
              <CardDescription>Last Location</CardDescription>
              <CardTitle className="text-xl truncate">
                {userData?.last_known_location || "Not available"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground flex items-center">
                <MapPin className="mr-1 h-4 w-4 text-raven-navy" />
                Last updated location
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chart - Reduced size for desktop */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="col-span-full lg:col-span-8 lg:col-start-3"
        >
          <AlertsChart alerts={alertsData} />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
