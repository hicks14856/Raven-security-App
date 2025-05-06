
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EmergencyButtonProps {
  onActivate: () => void;
  isLoading?: boolean;
  recordingCountdown: number | null;
}

const EmergencyButton = ({ onActivate, isLoading, recordingCountdown }: EmergencyButtonProps) => {
  const [ripples, setRipples] = useState<number[]>([]);
  const [isPressed, setIsPressed] = useState(false);

  // Add a ripple effect every second when in recording mode
  useEffect(() => {
    if (recordingCountdown !== null) {
      const interval = setInterval(() => {
        setRipples((prev) => [...prev, Date.now()]);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [recordingCountdown]);

  // Remove ripples after animation completes
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  const handlePress = () => {
    if (isLoading || recordingCountdown !== null) return;
    
    setIsPressed(true);
    // Add initial ripple effect
    setRipples([Date.now()]);
    
    // Call the activate function
    onActivate();
  };

  const handleRelease = () => {
    setIsPressed(false);
  };

  return (
    <div className="relative">
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((id) => (
          <motion.div
            key={id}
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-red-500"
          />
        ))}
      </AnimatePresence>

      {/* Countdown overlay */}
      {recordingCountdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-4xl font-bold text-white">{recordingCountdown}</span>
        </div>
      )}

      {/* Main button */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isPressed ? 0.95 : 1,
          boxShadow: isPressed 
            ? "0 0 0 0 rgba(220, 20, 60, 0)" 
            : "0 0 0 10px rgba(220, 20, 60, 0.3)",
        }}
        transition={{ duration: 0.3 }}
      >
        <Button
          type="button"
          className={cn(
            "h-32 w-32 rounded-full bg-emergency hover:bg-emergency/90 text-white font-bold text-2xl",
            "border-4 border-white shadow-lg",
            recordingCountdown !== null && "animate-pulse bg-red-600",
            isLoading && "opacity-80"
          )}
          disabled={isLoading || recordingCountdown !== null}
          onClick={handlePress}
          onMouseDown={handlePress}
          onMouseUp={handleRelease}
          onTouchStart={handlePress}
          onTouchEnd={handleRelease}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              SOS
            </span>
          ) : recordingCountdown !== null ? (
            <span className="sr-only">Recording {recordingCountdown}</span>
          ) : (
            "SOS"
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default EmergencyButton;
