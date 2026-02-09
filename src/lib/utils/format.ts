/**
 * Formats a number as a currency string in TL.
 * @param amount - The amount to format
 * @returns Formatted price string (e.g., "100.00 TL")
 */
export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} TL`;
}

/**
 * Formats an ISO date string into a localized Turkish date format.
 * @param date - ISO date string
 * @returns Formatted date string
 */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}
