
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Sun, Moon, Home, LogOut, MapPin, Mic, CalendarClock, Bell, Clock, History, UserCircle, Settings, Users } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      if (!user && location.pathname !== "/login") {
        navigate("/login");
      } else if (user) {
        // Add a loading animation before showing the dashboard
        const timer = setTimeout(() => {
          setShowDashboard(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    };
    
    checkAuth();
  }, [user, navigate, location]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  const handleNavigation = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const menuItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "My Location", path: "/my-location", icon: MapPin },
    { label: "Recordings", path: "/recordings", icon: Mic },
    { label: "Scheduled Alerts", path: "/scheduled-alerts", icon: CalendarClock },
    { label: "Alert History", path: "/alert-history", icon: History },
    { label: "Emergency Contacts", path: "/emergency-contacts", icon: Users },
    { label: "Profile", path: "/profile", icon: UserCircle },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  if (!user) {
    return null;
  }

  if (!showDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <Bell className="h-16 w-16 text-raven-blue mx-auto" />
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold text-raven-dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Raven Security
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Secure solutions at the palm of your hand
          </motion.p>
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="w-8 h-8 rounded-full border-4 border-raven-blue border-t-transparent animate-spin"></div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] bg-white dark:bg-raven-dark">
              <SheetHeader>
                <SheetTitle className="text-raven-dark dark:text-white">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-4">
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    className={cn(
                      "justify-start",
                      location.pathname === item.path && "bg-raven-blue hover:bg-raven-navy"
                    )}
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    {item.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => handleNavigation("/profile")}
            >
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-raven-lavender">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
};

export default DashboardLayout;
