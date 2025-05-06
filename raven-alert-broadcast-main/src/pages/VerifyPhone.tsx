
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PhoneVerification from "@/components/PhoneVerification";

const VerifyPhone = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get phone number from location state or user profile
    if (location.state?.phoneNumber) {
      setPhoneNumber(location.state.phoneNumber);
    } else if (user?.user_metadata?.phone_number) {
      setPhoneNumber(user.user_metadata.phone_number);
    } else {
      // If no phone number, redirect to login
      navigate("/login");
    }
  }, [user, location.state, navigate]);

  const handleVerified = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
        {phoneNumber ? (
          <PhoneVerification 
            phoneNumber={phoneNumber} 
            onVerified={handleVerified} 
          />
        ) : (
          <div className="text-center">Loading...</div>
        )}
      </div>
    </div>
  );
};

export default VerifyPhone;
