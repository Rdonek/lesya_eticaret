/**
 * Format a number as Turkish Lira (TL)
 */
export function formatPrice(price: number): string {
  if (price === undefined || price === null) return '0.00 TL';
  
  // Reliable formatting without Intl dependency issues on some environments
  const formatted = Number(price).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  return `${formatted} TL`;
}

/**
 * Format date to relative time (e.g., "5 dakika önce", "2 saat önce")
 */
export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Şimdi';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}