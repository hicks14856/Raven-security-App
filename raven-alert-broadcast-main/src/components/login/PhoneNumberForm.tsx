
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const phoneFormSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .refine((val) => /^[+]?[0-9\s\-()]+$/.test(val), {
      message: "Please enter a valid phone number",
    }),
});

interface PhoneNumberFormProps {
  isLoading: boolean;
  onSubmit: (phoneNumber: string) => Promise<void>;
}

const PhoneNumberForm = ({ isLoading, onSubmit }: PhoneNumberFormProps) => {
  const form = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof phoneFormSchema>) => {
    await onSubmit(values.phoneNumber);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">Add Your Phone Number</h3>
          <p className="text-sm text-muted-foreground">
            For added security, please add your phone number for two-factor authentication.
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Continue with verification"}
        </Button>
      </form>
    </Form>
  );
};

export default PhoneNumberForm;
