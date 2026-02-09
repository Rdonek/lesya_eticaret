/**
 * Validates an email address.
 * @param email - The email to validate
 * @returns boolean
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a Turkish phone number (e.g., 05xxxxxxxxx).
 * @param phone - The phone number to validate
 * @returns boolean
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^05\d{9}$/;
  return phoneRegex.test(phone);
}
