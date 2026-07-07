function toIso(val: unknown): string {
  if (val instanceof Date) return val.toISOString();
  return String(val ?? "");
}

export function formatDate(dateStr: unknown): string {
  const [y, m, d] = toIso(dateStr).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(timeStr: unknown): string {
  const iso = toIso(timeStr);
  // TIME columns: "08:00:00" — DATE/TIMESTAMP columns have "T" separator
  const part = iso.includes("T") ? iso.slice(11, 16) : iso.slice(0, 5);
  const [h, m] = part.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function toDateStr(val: unknown): string {
  return toIso(val).slice(0, 10);
}
