
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface PhoneVerificationProps {
  phoneNumber: string;
  onVerified?: () => void;
}

const PhoneVerification = ({ phoneNumber, onVerified }: PhoneVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { verifyPhone, sendVerificationOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "Please enter a 6-digit verification code.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const verified = await verifyPhone(phoneNumber, otp);
      if (verified) {
        if (onVerified) {
          onVerified();
        } else {
          navigate("/");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await sendVerificationOtp(phoneNumber);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">Verify your phone number</h3>
        <p className="text-sm text-muted-foreground">
          We've sent a verification code to {phoneNumber}
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button 
        onClick={handleVerify} 
        className="w-full" 
        disabled={isSubmitting || otp.length !== 6}
      >
        {isSubmitting ? "Verifying..." : "Verify Phone Number"}
      </Button>

      <div className="text-center">
        <Button 
          variant="link" 
          onClick={handleResendCode}
          disabled={isResending}
        >
          {isResending ? "Sending..." : "Resend Code"}
        </Button>
      </div>
    </div>
  );
};

export default PhoneVerification;
