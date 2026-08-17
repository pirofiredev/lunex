export function isFutureDate(iso: string): boolean {
  return new Date(iso).getTime() > Date.now();
}

export function isWithinPastDays(dateStr: string, days: number = 30): boolean {
  let formatted = dateStr;
  if (formatted && !formatted.includes('T')) {
    formatted = formatted.replace(' ', 'T') + 'Z';
  }
  const date = new Date(formatted);
  if (isNaN(date.getTime())) return false;
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= cutoff && date <= now;
}

