
import { useEffect } from "react";
import { useContacts } from "@/hooks/useContacts";
import ContactCard from "@/components/ContactCard";
import AddContactDialog from "@/components/AddContactDialog";
import { useToast } from "@/components/ui/use-toast";

const EmergencyContacts = () => {
  const { contacts, addContact, updateContact, deleteContact } = useContacts();
  const { toast } = useToast();

  const handleAddContact = (
    name: string, 
    phone: string, 
    email: string, 
    notifyBy: "sms" | "email" | "both"
  ) => {
    if (contacts.length >= 5) {
      toast({
        title: "Maximum contacts reached",
        description: "You can only add up to 5 emergency contacts.",
        variant: "destructive",
      });
      return;
    }

    addContact(name, phone, email, notifyBy);
  };

  const handleUpdateContact = (
    id: string,
    name: string,
    phone: string,
    email: string,
    notifyBy: "sms" | "email" | "both"
  ) => {
    updateContact(id, name, phone, email, notifyBy);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Emergency Contacts</h2>
        <span className="text-sm text-muted-foreground">
          {contacts.length}/5 contacts
        </span>
      </div>

      <div className="grid gap-4">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            name={contact.name}
            phone={contact.phone}
            email={contact.email || "No email provided"}
            notifyBy={contact.notifyBy}
            onDelete={() => deleteContact(contact.id)}
            onUpdate={(name, phone, email, notifyBy) => 
              handleUpdateContact(contact.id, name, phone, email, notifyBy)}
          />
        ))}
        {contacts.length < 5 && (
          <AddContactDialog onAdd={handleAddContact} />
        )}
      </div>
    </div>
  );
};

export default EmergencyContacts;
