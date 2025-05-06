
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Mic, MapPin, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Theme schema only requires the theme field
const themeSchema = z.object({
  theme: z.enum(["light", "dark", "system"])
});

// Password schema is separate
const passwordSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [permissionStatus, setPermissionStatus] = useState({
    location: "unknown",
    notifications: "unknown",
    microphone: "unknown",
  });
  
  // Theme form
  const themeForm = useForm<z.infer<typeof themeSchema>>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      theme: theme as "light" | "dark" | "system",
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Check permission statuses on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      // Check location permission
      try {
        const locationStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setPermissionStatus(prev => ({ ...prev, location: locationStatus.state }));
        
        locationStatus.addEventListener('change', () => {
          setPermissionStatus(prev => ({ ...prev, location: locationStatus.state }));
        });
      } catch (error) {
        console.error("Error checking location permission:", error);
      }
      
      // Check notification permission
      if ('Notification' in window) {
        const notificationStatus = Notification.permission;
        setPermissionStatus(prev => ({ ...prev, notifications: notificationStatus }));
      }
      
      // Check microphone permission
      try {
        const microphoneStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionStatus(prev => ({ ...prev, microphone: microphoneStatus.state }));
        
        microphoneStatus.addEventListener('change', () => {
          setPermissionStatus(prev => ({ ...prev, microphone: microphoneStatus.state }));
        });
      } catch (error) {
        console.error("Error checking microphone permission:", error);
      }
    };
    
    checkPermissions();
  }, []);

  const onThemeSubmit = (data: z.infer<typeof themeSchema>) => {
    setTheme(data.theme);
    toast({
      title: "Theme updated",
      description: "Your theme preference has been saved.",
    });
  };

  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    // Password update logic would go here
    console.log("Password update data:", data);
    
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
    
    // Reset form after successful submission
    passwordForm.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const requestPermission = async (type: 'location' | 'notifications' | 'microphone') => {
    try {
      if (type === 'location') {
        await navigator.geolocation.getCurrentPosition(
          () => {
            setPermissionStatus(prev => ({ ...prev, location: 'granted' }));
            toast({
              title: "Location access granted",
              description: "You've allowed the app to access your location."
            });
          },
          () => {
            setPermissionStatus(prev => ({ ...prev, location: 'denied' }));
            toast({
              title: "Location access denied",
              description: "You've denied the app access to your location.",
              variant: "destructive"
            });
          }
        );
      } else if (type === 'notifications' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        setPermissionStatus(prev => ({ ...prev, notifications: permission }));
        
        if (permission === 'granted') {
          toast({
            title: "Notifications enabled",
            description: "You'll now receive notifications from the app."
          });
        } else {
          toast({
            title: "Notifications disabled",
            description: "You won't receive notifications from the app.",
            variant: "destructive"
          });
        }
      } else if (type === 'microphone') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop()); // Stop the stream
          setPermissionStatus(prev => ({ ...prev, microphone: 'granted' }));
          toast({
            title: "Microphone access granted",
            description: "You've allowed the app to access your microphone."
          });
        } catch (error) {
          console.error("Error requesting microphone permission:", error);
          setPermissionStatus(prev => ({ ...prev, microphone: 'denied' }));
          toast({
            title: "Microphone access denied",
            description: "You've denied the app access to your microphone.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      toast({
        title: "Permission error",
        description: `Could not request ${type} permission. Please check your browser settings.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your app experience and security preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Notification Permission</CardTitle>
              <CardDescription>
                Allow notifications for alert updates and reminders
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current status: <span className="capitalize">{permissionStatus.notifications}</span></p>
            </div>
            <Button 
              variant={permissionStatus.notifications === "granted" ? "outline" : "default"}
              onClick={() => requestPermission('notifications')}
              disabled={permissionStatus.notifications === "granted"}
            >
              {permissionStatus.notifications === "granted" ? "Enabled" : "Request Permission"}
            </Button>
          </div>
          {permissionStatus.notifications === "denied" && (
            <Alert className="mt-4 bg-amber-50 text-amber-800 border-amber-200">
              <AlertDescription>
                Permission denied. Please enable notifications in your browser settings to receive alerts.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Microphone Permission</CardTitle>
              <CardDescription>
                Required for recording emergency audio messages
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current status: <span className="capitalize">{permissionStatus.microphone}</span></p>
            </div>
            <Button 
              variant={permissionStatus.microphone === "granted" ? "outline" : "default"}
              onClick={() => requestPermission('microphone')}
              disabled={permissionStatus.microphone === "granted"}
            >
              {permissionStatus.microphone === "granted" ? "Enabled" : "Request Permission"}
            </Button>
          </div>
          {permissionStatus.microphone === "denied" && (
            <Alert className="mt-4 bg-amber-50 text-amber-800 border-amber-200">
              <AlertDescription>
                Permission denied. Please enable microphone access in your browser settings to record emergency messages.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Location Permission</CardTitle>
              <CardDescription>
                Required for sending your location during emergencies
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current status: <span className="capitalize">{permissionStatus.location}</span></p>
            </div>
            <Button 
              variant={permissionStatus.location === "granted" ? "outline" : "default"}
              onClick={() => requestPermission('location')}
              disabled={permissionStatus.location === "granted"}
            >
              {permissionStatus.location === "granted" ? "Enabled" : "Request Permission"}
            </Button>
          </div>
          {permissionStatus.location === "denied" && (
            <Alert className="mt-4 bg-amber-50 text-amber-800 border-amber-200">
              <AlertDescription>
                Permission denied. Please enable location access in your browser settings for emergency features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <div className="h-5 w-5 flex items-center justify-center text-primary">
                🎨
              </div>
            </div>
            <CardTitle>Theme Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...themeForm}>
            <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-4">
              <FormField
                control={themeForm.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save Theme</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Change Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Update Password</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
