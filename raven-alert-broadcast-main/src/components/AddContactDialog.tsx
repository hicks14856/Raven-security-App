
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusIcon, MailIcon, PhoneIcon, UserIcon, AlertCircle } from "lucide-react";
import { isValidPhoneNumber } from "@/lib/utils";

interface AddContactDialogProps {
  onAdd: (name: string, phone: string, email: string, notifyBy: "sms" | "email" | "both") => void;
}

const AddContactDialog = ({ onAdd }: AddContactDialogProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notifyBy, setNotifyBy] = useState<"sms" | "email" | "both">("email");
  const [open, setOpen] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  
  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setNotifyBy("email");
    setPhoneError("");
  };
  
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !phone) {
      return;
    }
    
    if (!isValidPhoneNumber(phone)) {
      setPhoneError("Please enter a valid phone number");
      return;
    }
    
    if (!email) {
      return; // Require email for notifications
    }
    
    onAdd(name, phone, email, notifyBy);
    setOpen(false);
    resetForm();
  };
  
  const handleCancel = () => {
    setOpen(false);
    resetForm();
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center space-y-2 h-[150px] hover:bg-slate-50 cursor-pointer">
          <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center">
            <PlusIcon className="h-5 w-5 text-neutral-600" />
          </div>
          <p className="text-sm text-neutral-600">Add emergency contact</p>
        </div>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Emergency Contact</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleAdd} className="space-y-4 py-2">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring">
                <UserIcon className="mx-2 h-4 w-4 text-gray-500" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-transparent"
                  placeholder="Contact name"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring">
                <PhoneIcon className="mx-2 h-4 w-4 text-gray-500" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError("");
                  }}
                  type="tel"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-transparent"
                  placeholder="+1234567890"
                  required
                />
              </div>
              {phoneError && (
                <div className="text-red-500 text-sm">{phoneError}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                Email 
                <span className="text-red-500">*</span>
                <span className="text-xs text-amber-600">(Required for alerts)</span>
              </Label>
              <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring">
                <MailIcon className="mx-2 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-transparent"
                  placeholder="contact@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notification Method</Label>
              <RadioGroup
                value={notifyBy}
                onValueChange={(value) => setNotifyBy(value as "email" | "sms" | "both")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="r1" />
                  <Label htmlFor="r1" className="cursor-pointer">Email only</Label>
                </div>
              </RadioGroup>
            </div>
            
            {!email && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-500 mt-0.5" />
                <p>Email address is required for emergency alerts. Please provide a valid email.</p>
              </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 border border-blue-100">
              <p className="font-medium">Important:</p>
              <p>This application uses email for emergency alerts. Make sure to provide a valid email address for each contact.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" onClick={handleCancel} variant="outline">Cancel</Button>
            <Button type="submit" disabled={!email}>Add Contact</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactDialog;
