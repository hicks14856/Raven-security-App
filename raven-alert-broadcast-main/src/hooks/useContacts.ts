
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  notifyBy: "sms" | "email" | "both";
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { toast } = useToast();

  const fetchContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      // Map the database fields to the Contact interface
      const mappedContacts = data?.map(contact => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email || "",
        notifyBy: (contact.notify_by as "sms" | "email" | "both") || "both"
      })) || [];
      
      setContacts(mappedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch emergency contacts.",
        variant: "destructive",
      });
    }
  };

  const addContact = async (name: string, phone: string, email: string, notifyBy: "sms" | "email" | "both") => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      if (contacts.length >= 5) {
        toast({
          title: "Maximum contacts reached",
          description: "You can only add up to 5 emergency contacts.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from('contacts').insert({
        name,
        phone,
        email,
        notify_by: notifyBy,
        user_id: user.id,
      });

      if (error) throw error;

      await fetchContacts();
      toast({
        title: "Contact added",
        description: "Emergency contact has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add emergency contact.",
        variant: "destructive",
      });
    }
  };

  const updateContact = async (id: string, name: string, phone: string, email: string, notifyBy: "sms" | "email" | "both") => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          name,
          phone,
          email,
          notify_by: notifyBy
        })
        .eq('id', id);

      if (error) throw error;

      await fetchContacts();
      toast({
        title: "Contact updated",
        description: "Emergency contact has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update emergency contact.",
        variant: "destructive",
      });
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchContacts();
      toast({
        title: "Contact removed",
        description: "Emergency contact has been removed.",
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to remove emergency contact.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    addContact,
    updateContact,
    deleteContact,
  };
}
