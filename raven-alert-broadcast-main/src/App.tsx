
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AlertHistory from "./pages/AlertHistory";
import EmergencyContacts from "./pages/EmergencyContacts";
import MyLocation from "./pages/MyLocation";
import Recordings from "./pages/Recordings";
import ScheduledAlerts from "./pages/ScheduledAlerts";
import VerifyPhone from "./pages/VerifyPhone";

// Create QueryClient outside of the component to avoid React hooks issues
const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-phone" element={<VerifyPhone />} />
                <Route
                  path="/"
                  element={
                    <DashboardLayout>
                      <Index />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <DashboardLayout>
                      <Profile />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/alert-history"
                  element={
                    <DashboardLayout>
                      <AlertHistory />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/emergency-contacts"
                  element={
                    <DashboardLayout>
                      <EmergencyContacts />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/my-location"
                  element={
                    <DashboardLayout>
                      <MyLocation />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/recordings"
                  element={
                    <DashboardLayout>
                      <Recordings />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/scheduled-alerts"
                  element={
                    <DashboardLayout>
                      <ScheduledAlerts />
                    </DashboardLayout>
                  }
                />
              </Routes>
            </AuthProvider>
          </QueryClientProvider>
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
