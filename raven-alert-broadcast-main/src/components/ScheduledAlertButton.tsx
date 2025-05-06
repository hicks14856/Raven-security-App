
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ScheduledAlertButtonProps {
  className?: string;
}

const ScheduledAlertButton = ({ className }: ScheduledAlertButtonProps) => {
  const navigate = useNavigate();

  const handleScheduleAlert = () => {
    navigate("/scheduled-alerts");
  };

  return (
    <Button 
      variant="outline" 
      className={`flex items-center gap-2 ${className || ''}`} 
      onClick={handleScheduleAlert}
    >
      <CalendarClock className="h-4 w-4" />
      Schedule an Alert
    </Button>
  );
};

export default ScheduledAlertButton;
