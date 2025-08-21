/**
 * Format timestamp untuk display chat
 * Menggunakan timezone lokal browser/device
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use local timezone
  }).format(date);
}

/**
 * Format timestamp dengan AM/PM untuk sidebar
 */
export function formatTimeWithAMPM(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use local timezone
  }).format(date);
}

/**
 * Membuat timestamp ISO string yang tepat untuk pesan baru
 */
export function createMessageTimestamp(): string {
  return new Date().toISOString();
}
