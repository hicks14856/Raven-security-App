
import { Contact } from "@/hooks/useContacts";
import ContactCard from "@/components/ContactCard";
import AddContactDialog from "@/components/AddContactDialog";

interface ContactsListProps {
  contacts: Contact[];
  onAddContact: (name: string, phone: string, email: string, notifyBy: "sms" | "email" | "both") => void;
  onDeleteContact: (id: string) => void;
  onUpdateContact?: (id: string, name: string, phone: string, email: string, notifyBy: "sms" | "email" | "both") => void;
}

const ContactsList = ({ 
  contacts, 
  onAddContact, 
  onDeleteContact,
  onUpdateContact 
}: ContactsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Emergency Contacts</h2>
        <span className="text-sm text-neutral-500">
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
            onDelete={() => onDeleteContact(contact.id)}
            onUpdate={onUpdateContact ? 
              (name, phone, email, notifyBy) => onUpdateContact(contact.id, name, phone, email, notifyBy) : 
              undefined}
          />
        ))}
        {contacts.length < 5 && (
          <AddContactDialog onAdd={onAddContact} />
        )}
      </div>
    </div>
  );
};

export default ContactsList;
