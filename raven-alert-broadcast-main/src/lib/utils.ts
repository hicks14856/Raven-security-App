
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates if a string is a valid international phone number format
 * Basic validation for E.164 format or similar
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Basic regex for international phone format
  // Allows + followed by digits, minimum 8 digits including country code
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
}

/**
 * Parse alert errors into a user-friendly message
 */
export function parseAlertErrors(results: any[]): string {
  if (!results || !Array.isArray(results)) return '';
  
  const failedResults = results.filter(r => !r.success);
  
  // Check for testing mode errors
  const testingModeErrors = failedResults.filter(r => r.error === 'TESTING_MODE');
  if (testingModeErrors.length > 0) {
    return 'Some alerts could not be sent because you are using the free tier of our email service. In testing mode, emails can only be sent to verified addresses. In a real emergency, all contacts would be notified.';
  }
  
  // Check for missing emails
  const noEmailErrors = failedResults.filter(r => r.error === 'NO_EMAIL');
  if (noEmailErrors.length > 0) {
    return `${noEmailErrors.length} contact(s) have no email address configured.`;
  }
  
  // Generic error if none of the above
  if (failedResults.length > 0) {
    return `Failed to send ${failedResults.length} alert(s) due to technical issues.`;
  }
  
  return '';
}
