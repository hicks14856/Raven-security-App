
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO, isPast, set, parse } from "date-fns";
import { CalendarIcon, Clock, MapPin, Plus, Trash, User, Filter, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduledAlert {
  id: string;
  location: string;
  companions: string;
  notes: string;
  scheduled_for: string;
  created_at: string;
  status: "pending" | "triggered" | "cancelled";
  user_id: string;
}

const formSchema = z.object({
  location: z.string().min(2, "Please enter a location"),
  companions: z.string().min(2, "Please enter who you'll be with"),
  scheduled_date: z.date({
    required_error: "Please select a date",
  }),
  scheduled_time: z.string({
    required_error: "Please select a time",
  }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time in 24-hour format (HH:MM)"),
  notes: z.string().optional(),
});

const ScheduledAlerts = () => {
  const [alerts, setAlerts] = useState<ScheduledAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      companions: "",
      notes: "",
      scheduled_date: new Date(),
      scheduled_time: format(new Date(), "HH:mm"),
    },
  });

  const fetchAlerts = async () => {
    if (!user) return;
    
    try {
      setIsLoadingAlerts(true);
      const { data, error } = await supabase
        .from("scheduled_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      
      const typedAlerts: ScheduledAlert[] = data?.map(alert => ({
        ...alert,
        status: alert.status as "pending" | "triggered" | "cancelled"
      })) || [];
      
      setAlerts(typedAlerts);
    } catch (error) {
      console.error("Error fetching scheduled alerts:", error);
      toast({
        title: "Error",
        description: "Failed to load scheduled alerts.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create scheduled alerts.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Combine date and time into a single Date object
      const timeComponents = values.scheduled_time.split(':');
      const hours = parseInt(timeComponents[0], 10);
      const minutes = parseInt(timeComponents[1], 10);
      
      const combinedDateTime = set(values.scheduled_date, {
        hours: hours,
        minutes: minutes,
        seconds: 0,
        milliseconds: 0
      });
      
      // Check if the date is in the past
      if (isPast(combinedDateTime)) {
        toast({
          title: "Invalid date/time",
          description: "The scheduled time cannot be in the past.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("scheduled_alerts").insert({
        user_id: user.id,
        location: values.location,
        companions: values.companions,
        notes: values.notes || "",
        scheduled_for: combinedDateTime.toISOString(),
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Alert scheduled",
        description: "Your alert has been scheduled successfully.",
      });

      form.reset();
      setIsDialogOpen(false);
      fetchAlerts();
    } catch (error) {
      console.error("Error scheduling alert:", error);
      toast({
        title: "Error",
        description: "Failed to schedule alert.",
        variant: "destructive",
      });
    }
  };

  const cancelAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_alerts")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Alert cancelled",
        description: "Your scheduled alert has been cancelled.",
      });

      fetchAlerts();
    } catch (error) {
      console.error("Error cancelling alert:", error);
      toast({
        title: "Error",
        description: "Failed to cancel alert.",
        variant: "destructive",
      });
    }
  };

  const filteredAlerts = () => {
    if (statusFilter === "all") return alerts;
    return alerts.filter(alert => alert.status === statusFilter);
  };

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <motion.h1 
          className="text-3xl font-bold text-raven-dark"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Scheduled Alerts
        </motion.h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-raven-dark">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="triggered">Triggered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap bg-raven-blue hover:bg-raven-navy">
                <Plus className="mr-2 h-4 w-4" />
                Schedule New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-raven-dark">
              <DialogHeader>
                <DialogTitle>Schedule Safety Alert</DialogTitle>
                <DialogDescription>
                  Set up an alert for when you're going somewhere and want someone to check on you.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Where are you going?</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Who will you be with?</FormLabel>
                        <FormControl>
                          <Input placeholder="Name(s) of companion(s)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="scheduled_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={(date) => {
                                  // Disable dates in the past
                                  return date < new Date(new Date().setHours(0, 0, 0, 0));
                                }}
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduled_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional information that might be helpful" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormDescription>
                    If you don't check in by this time, we'll send alerts to your emergency contacts.
                  </FormDescription>

                  <DialogFooter>
                    <Button type="submit" className="bg-raven-blue hover:bg-raven-navy">Schedule Alert</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingAlerts ? (
          <motion.p 
            className="text-center col-span-full py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 rounded-full border-4 border-raven-blue border-t-transparent animate-spin mx-auto mb-4"></div>
            Loading scheduled alerts...
          </motion.p>
        ) : filteredAlerts().length > 0 ? (
          filteredAlerts().map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={cn(
                "shadow-sm hover:shadow-md transition-shadow",
                alert.status === "cancelled" && "opacity-60 bg-muted/20",
                isPast(new Date(alert.scheduled_for)) && alert.status === "pending" && "border-amber-300 bg-amber-50 dark:bg-amber-950/20",
                "border-l-4",
                alert.status === "pending" ? "border-l-raven-blue" : 
                alert.status === "triggered" ? "border-l-raven-navy" : "border-l-raven-lavender"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {format(new Date(alert.scheduled_for), "PPP")}
                    </CardTitle>
                    <div className="flex gap-1">
                      {alert.status === "pending" && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => cancelAlert(alert.id)}
                          title="Cancel Alert"
                        >
                          <Ban className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(alert.scheduled_for), "p")}
                    {alert.status !== "pending" && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-raven-lavender text-raven-dark">
                        {alert.status === "cancelled" ? "Cancelled" : "Triggered"}
                      </span>
                    )}
                    {isPast(new Date(alert.scheduled_for)) && alert.status === "pending" && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        Overdue
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <span>{alert.location}</span>
                  </div>
                  <div className="flex items-start">
                    <User className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <span>{alert.companions}</span>
                  </div>
                  {alert.notes && (
                    <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
                      {alert.notes}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  {alert.status === "pending" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => cancelAlert(alert.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Cancel Alert
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <Clock className="mx-auto h-10 w-10 text-raven-lavender" />
            <h3 className="mt-4 text-lg font-medium">No {statusFilter !== "all" ? statusFilter : ""} scheduled alerts</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Schedule an alert when you're going somewhere and want someone to check on you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledAlerts;
