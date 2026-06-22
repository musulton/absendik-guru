import type { Locale } from "@/lib/i18n/translations";
import type { GuruTeachingSlot, TeachingSlotDraft } from "@/lib/types";

/** ISO weekday: 1 = Senin … 7 = Minggu */
export const ISO_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

const DAY_SHORT_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;
const DAY_SHORT_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function isoWeekdayLabel(day: number, locale: Locale = "id"): string {
  const labels = locale === "en" ? DAY_SHORT_EN : DAY_SHORT_ID;
  return labels[day - 1] ?? String(day);
}

/** Expo Notifications weekday: 1 = Minggu … 7 = Sabtu */
export function isoToExpoWeekday(isoDay: number): number {
  return isoDay === 7 ? 1 : isoDay + 1;
}

export function parseTimeHm(value: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function formatTimeHm(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function dateToTimeHm(date: Date): string {
  return formatTimeHm(date.getHours(), date.getMinutes());
}

export function timeHmToDate(hm: string): Date {
  const parsed = parseTimeHm(hm);
  const d = new Date();
  d.setHours(parsed?.hour ?? 7, parsed?.minute ?? 0, 0, 0);
  return d;
}

export function subtractMinutesFromTime(
  hm: string,
  minutes: number,
): { hour: number; minute: number } | null {
  const parsed = parseTimeHm(hm);
  if (!parsed) return null;
  let total = parsed.hour * 60 + parsed.minute - minutes;
  while (total < 0) total += 24 * 60;
  total %= 24 * 60;
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

function teachingSlotTimeKey(startTime: string, endTime: string | null | undefined): string {
  return `${startTime}|${endTime?.trim() || ""}`;
}

/** Gabung baris DB (satu hari) jadi draft editor (bisa multi-hari). */
export function groupTeachingSlotsToDrafts(
  slots: Pick<GuruTeachingSlot, "id" | "dayOfWeek" | "startTime" | "endTime">[],
): TeachingSlotDraft[] {
  const map = new Map<string, TeachingSlotDraft>();

  for (const slot of slots) {
    const key = teachingSlotTimeKey(slot.startTime, slot.endTime);
    const existing = map.get(key);
    if (existing) {
      if (!existing.daysOfWeek.includes(slot.dayOfWeek)) {
        existing.daysOfWeek = [...existing.daysOfWeek, slot.dayOfWeek].sort(
          (a, b) => a - b,
        );
      }
    } else {
      map.set(key, {
        id: slot.id,
        daysOfWeek: [slot.dayOfWeek],
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const dayA = Math.min(...a.daysOfWeek);
    const dayB = Math.min(...b.daysOfWeek);
    if (dayA !== dayB) return dayA - dayB;
    return a.startTime.localeCompare(b.startTime);
  });
}

export function formatDaysSummary(daysOfWeek: number[], locale: Locale): string {
  return [...daysOfWeek]
    .sort((a, b) => a - b)
    .map((day) => isoWeekdayLabel(day, locale))
    .join(", ");
}

export function formatSlotSummary(
  daysOfWeek: number[],
  startTime: string,
  endTime: string | null | undefined,
  locale: Locale,
): string {
  const days = formatDaysSummary(daysOfWeek, locale);
  if (endTime?.trim()) return `${days} ${startTime}–${endTime.trim()}`;
  return `${days} ${startTime}`;
}

export function toggleTeachingSlotDay(
  daysOfWeek: number[],
  day: number,
): number[] | null {
  if (daysOfWeek.includes(day)) {
    const next = daysOfWeek.filter((d) => d !== day);
    return next.length > 0 ? next.sort((a, b) => a - b) : null;
  }
  return [...daysOfWeek, day].sort((a, b) => a - b);
}

export function isValidTeachingSlotDraft(slot: {
  daysOfWeek: number[];
  startTime: string;
  endTime?: string | null;
}): boolean {
  if (!slot.daysOfWeek.length) return false;
  if (!slot.daysOfWeek.every((d) => d >= 1 && d <= 7)) return false;
  if (!parseTimeHm(slot.startTime)) return false;
  if (slot.endTime?.trim() && !parseTimeHm(slot.endTime)) return false;
  return true;
}
