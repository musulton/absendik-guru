const ISO_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/;

const ID_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Ekstrak YYYY-MM-DD dari string ISO / datetime / Date. */
export function normalizeIsoDate(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const match = trimmed.match(ISO_DATE_PREFIX);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return dateToIso(parsed);
  }

  return null;
}

/** Tanggal hari ini menurut IANA timezone sekolah. */
export function todayInTimezone(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const y = parts.find((part) => part.type === "year")?.value;
    const m = parts.find((part) => part.type === "month")?.value;
    const d = parts.find((part) => part.type === "day")?.value;
    if (y && m && d) return `${y}-${m}-${d}`;
  } catch {
    /* fallback below */
  }

  const utcMs = Date.now() + new Date().getTimezoneOffset() * 60_000;
  const wib = new Date(utcMs + 7 * 60 * 60_000);
  return dateToIso(wib);
}

/** Tanggal hari ini zona Asia/Jakarta (YYYY-MM-DD). */
export function todayJakarta(): string {
  return todayInTimezone("Asia/Jakarta");
}

/** Tanggal lokal perangkat (workspace offline/lokal). */
export function todayLocalDevice(): string {
  return dateToIso(new Date());
}

/** Bulan berjalan Asia/Jakarta (YYYY-MM). */
export function currentMonthJakarta(): string {
  return todayJakarta().slice(0, 7);
}

/** Bulan berjalan menurut timezone sekolah. */
export function currentMonthInTimezone(timezone: string): string {
  return todayInTimezone(timezone).slice(0, 7);
}

/** Geser bulan YYYY-MM (delta bisa negatif). */
export function addMonthsYyyymm(yyyymm: string, delta: number): string {
  const normalized = normalizeIsoDate(`${yyyymm}-01`);
  const [y, m] = (normalized ?? todayJakarta()).split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

/** Geser tanggal ISO (YYYY-MM-DD) sejumlah hari. */
export function addDaysIso(isoDate: string, days: number): string {
  const base = normalizeIsoDate(isoDate) ?? todayJakarta();
  const d = new Date(`${base}T12:00:00`);
  d.setDate(d.getDate() + days);
  return dateToIso(d);
}

export function formatDateId(isoDate: string | null | undefined): string {
  const normalized = normalizeIsoDate(isoDate);
  if (!normalized) return "—";
  const [y, m, d] = normalized.split("-").map(Number);
  if (!y || !m || !d) return "—";
  return `${d} ${ID_MONTHS[m - 1] ?? "—"} ${y}`;
}

export function formatDateDisplay(
  isoDate: string | null | undefined,
  locale: "id" | "en" = "id",
): string {
  const normalized = normalizeIsoDate(isoDate);
  if (!normalized) return "—";
  const [y, m, d] = normalized.split("-").map(Number);
  if (!y || !m || !d) return "—";
  if (locale === "en") {
    return `${EN_MONTHS[m - 1] ?? "—"} ${d}, ${y}`;
  }
  return formatDateId(normalized);
}

export function isoToDate(isoDate: string): Date {
  const normalized = normalizeIsoDate(isoDate) ?? todayJakarta();
  const [y, m, d] = normalized.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function dateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isFutureIsoDate(isoDate: string, today = todayJakarta()): boolean {
  const normalized = normalizeIsoDate(isoDate);
  if (!normalized) return false;
  return normalized > today;
}

/** dd/mm untuk header rekap nilai. */
export function formatIsoDateShort(isoDate: string | null | undefined): string {
  const normalized = normalizeIsoDate(isoDate);
  if (!normalized) return "—";
  const [, month, day] = normalized.split("-");
  return `${day}/${month}`;
}
