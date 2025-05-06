
import { useState } from "react";
import { Contact } from "@/hooks/useContacts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MailIcon, PhoneIcon, Trash2Icon, UserIcon, AlertCircle } from "lucide-react";

interface ContactCardProps {
  name: string;
  phone: string;
  email: string;
  notifyBy: "sms" | "email" | "both";
  onDelete: () => void;
  onUpdate?: (name: string, phone: string, email: string, notifyBy: "sms" | "email" | "both") => void;
}

const ContactCard = ({ name, phone, email, notifyBy, onDelete, onUpdate }: ContactCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState(name);
  const [updatedPhone, setUpdatedPhone] = useState(phone);
  const [updatedEmail, setUpdatedEmail] = useState(email);
  const [updatedNotifyBy, setUpdatedNotifyBy] = useState<"sms" | "email" | "both">(notifyBy);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate(updatedName, updatedPhone, updatedEmail, updatedNotifyBy);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setUpdatedName(name);
    setUpdatedPhone(phone);
    setUpdatedEmail(email);
    setUpdatedNotifyBy(notifyBy);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
  };
  
  const showEmailWarning = updatedNotifyBy === "email" && !updatedEmail;
  
  return (
    <div className="border rounded-lg p-4 shadow-sm space-y-3 bg-white">
      {!isEditing ? (
        // View mode
        <div className="space-y-3">
          <div className="flex justify-between">
            <h3 className="font-semibold truncate">{name}</h3>
            <div className="flex space-x-2">
              {onUpdate && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Contact</DialogTitle>
                  </DialogHeader>
                  <p>Are you sure you want to delete {name}? This action cannot be undone.</p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{phone}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-gray-500" />
              <span className={`${!email ? "text-amber-600 italic" : "text-gray-600"}`}>
                {email || "No email provided - email alerts will not be sent"}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                Notified by: {notifyBy === "both" ? "email" : notifyBy}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Edit mode
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring">
                <UserIcon className="mx-2 h-4 w-4 text-gray-500" />
                <Input
                  id="name"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-transparent"
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
                  value={updatedPhone}
                  onChange={(e) => setUpdatedPhone(e.target.value)}
                  type="tel"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-transparent"
                  required
                />
              </div>
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
                  value={updatedEmail}
                  onChange={(e) => setUpdatedEmail(e.target.value)}
                  type="email"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notification Method</Label>
              <RadioGroup
                value={updatedNotifyBy}
                onValueChange={(value) => setUpdatedNotifyBy(value as "email" | "sms" | "both")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email-only" />
                  <Label htmlFor="email-only" className="cursor-pointer">Email only</Label>
                </div>
              </RadioGroup>
            </div>
            
            {showEmailWarning && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-500 mt-0.5" />
                <p>You've selected email notifications but haven't provided an email address.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={showEmailWarning}>
              Save
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ContactCard;
