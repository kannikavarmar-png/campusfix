/**
 * Generates a unique, human-readable Rathinam Technical Campus complaint ID.
 * Format: RTC-YYYY-XXXXX (e.g., RTC-2026-84K2M)
 */
export function generateComplaintId() {
  const year = new Date().getFullYear();
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let suffix = '';
  const bytes = new Uint8Array(5);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    for (let i = 0; i < 5; i += 1) {
      suffix += alphabet[bytes[i] % alphabet.length];
    }
  } else {
    for (let i = 0; i < 5; i += 1) {
      suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  return `RTC-${year}-${suffix}`;
}
