
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Provider } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phoneNumber: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPhoneNumber: (phoneNumber: string) => Promise<void>;
  verifyPhone: (phoneNumber: string, otp: string) => Promise<boolean>;
  sendVerificationOtp: (phoneNumber: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserPhoneNumber = async (phoneNumber: string) => {
    if (!user) throw new Error("No authenticated user");
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ phone_number: phoneNumber })
        .eq("id", user.id);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error updating phone number:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phoneNumber: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber
          },
        },
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    setLoading(true);
    try {
      // Get current origin
      const origin = window.location.origin;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      
      console.log("OAuth sign in initiated:", data);
      
      if (error) {
        console.error("OAuth error:", error);
        throw error;
      }
    } catch (error) {
      console.error("OAuth sign in failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add these new functions for phone verification
  const sendVerificationOtp = async (phoneNumber: string): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { phone: phoneNumber }
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      });
      return false;
    }
  };

  const verifyPhone = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone: phoneNumber, otp }
      });
      
      if (error) throw error;
      
      if (data?.verified) {
        // Update the user's profile to mark phone as verified
        await supabase
          .from('profiles')
          .update({ 
            phone_verified: true,
            phone_number: phoneNumber 
          })
          .eq('id', user?.id);
        
        toast({
          title: "Success",
          description: "Phone number verified successfully",
        });
        
        return true;
      } else {
        toast({
          title: "Error",
          description: "Invalid verification code",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error",
        description: "Failed to verify phone number",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      signInWithProvider,
      resetPassword,
      updateUserPhoneNumber,
      sendVerificationOtp,
      verifyPhone
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
