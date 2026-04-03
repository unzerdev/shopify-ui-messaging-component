/**
 * Format currency amount for display
 * @param amount - Amount to format (string or number)
 * @param currency - Currency code (default: 'EUR')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: string | number, currency: string = 'EUR'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(num);
}
