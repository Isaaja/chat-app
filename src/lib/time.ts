export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}


