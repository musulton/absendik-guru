import type { GuruAttendanceStatus } from "@/lib/types";

export const ATTENDANCE_STATUS_ORDER: GuruAttendanceStatus[] = [
  "hadir",
  "sakit",
  "izin",
  "alpha",
];

export const ATTENDANCE_STATUS_LABEL: Record<GuruAttendanceStatus, string> = {
  hadir: "Hadir",
  sakit: "Sakit",
  izin: "Izin",
  alpha: "Alpha",
};

/** Label ringkas untuk baris status di layar absensi. */
export const ATTENDANCE_STATUS_SHORT: Record<GuruAttendanceStatus, string> = {
  hadir: "H",
  sakit: "S",
  izin: "I",
  alpha: "A",
};

/** @deprecated Prefer getAttendanceStatusLabel — label penuh untuk UI. */
export function getAttendanceStatusShort(
  locale: "id" | "en" = "id",
): Record<GuruAttendanceStatus, string> {
  if (locale === "en") {
    return { hadir: "P", sakit: "S", izin: "E", alpha: "A" };
  }
  return ATTENDANCE_STATUS_SHORT;
}

export function getAttendanceStatusLabel(
  locale: "id" | "en" = "id",
): Record<GuruAttendanceStatus, string> {
  if (locale === "en") {
    return {
      hadir: "Present",
      sakit: "Sick",
      izin: "Excused",
      alpha: "Absent",
    };
  }
  return ATTENDANCE_STATUS_LABEL;
}

export function nextAttendanceStatus(
  current: GuruAttendanceStatus,
): GuruAttendanceStatus {
  const i = ATTENDANCE_STATUS_ORDER.indexOf(current);
  const next = (i + 1) % ATTENDANCE_STATUS_ORDER.length;
  return ATTENDANCE_STATUS_ORDER[next];
}
