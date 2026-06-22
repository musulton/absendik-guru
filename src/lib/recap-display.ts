import {
  ATTENDANCE_STATUS_ORDER,
  getAttendanceStatusLabel,
} from "@/lib/attendance-labels";
import type { Locale } from "@/lib/i18n/translations";
import type {
  GuruAttendanceStatus,
  GuruPeriodStudentRecap,
  GuruStatusCounts,
} from "@/lib/types";

/** Satu baris ringkasan status dengan label lengkap. */
export function formatStatusCounts(
  counts: GuruStatusCounts,
  locale: Locale = "id",
): string {
  const labels = getAttendanceStatusLabel(locale);
  return ATTENDANCE_STATUS_ORDER.map(
    (s) => `${labels[s]} ${counts[s]}`,
  ).join(" · ");
}

/** Ringkas dengan label lengkap. */
export function formatStatusCountsShort(
  counts: GuruStatusCounts,
  locale: Locale = "id",
): string {
  const labels = getAttendanceStatusLabel(locale);
  return ATTENDANCE_STATUS_ORDER.map((s) => `${labels[s]} ${counts[s]}`).join(
    " · ",
  );
}

export function formatStudentRecapSubtitle(
  item: GuruPeriodStudentRecap,
  locale: Locale = "id",
): string {
  const attendanceWord = locale === "en" ? "attendance" : "kehadiran";
  return `${formatStatusCounts(item.counts, locale)} · ${item.pctHadir}% ${attendanceWord}`;
}

export function formatStudentRecapCompact(
  item: GuruPeriodStudentRecap,
  locale: Locale = "id",
): string {
  return `${formatStatusCountsShort(item.counts, locale)} · ${item.pctHadir}%`;
}

export const RECAP_STATUS_COLORS: Record<
  GuruAttendanceStatus,
  { bg: string; text: string }
> = {
  hadir: { bg: "#ecfdf5", text: "#059669" },
  sakit: { bg: "#fffbeb", text: "#d97706" },
  izin: { bg: "#eff6ff", text: "#2563eb" },
  alpha: { bg: "#fef2f2", text: "#dc2626" },
};
