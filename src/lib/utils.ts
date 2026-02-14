import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface TimestampLike {
  toDate(): Date;
}

function isTimestamp(val: unknown): val is TimestampLike {
  return (
    typeof val === "object" &&
    val !== null &&
    "toDate" in val &&
    typeof (val as TimestampLike).toDate === "function"
  );
}

export function formatDate(date: unknown) {
  if (!date) return "-";

  let d: Date;

  if (isTimestamp(date)) {
    // Di sini 'date' sudah otomatis dianggap sebagai TimestampLike oleh TS
    d = date.toDate();
  } else if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string" || typeof date === "number") {
    d = new Date(date);
  } else {
    // Fallback jika tipe data tidak dikenali
    return "-";
  }

  // Validasi apakah Date object-nya valid (bukan "Invalid Date")
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}