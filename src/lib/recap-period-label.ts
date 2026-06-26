import { getGuruMonthRange } from "@/lib/month-range";
import {
  semesterLabel,
  semesterRange,
  type SemesterValue,
} from "@/lib/period-range";
import { getGuruWeekRange } from "@/lib/week-range";

export type RecapPeriodKind = "weekly" | "monthly" | "semester";

/** Label periode untuk UI (tanpa nama mapel). */
export function recapNavPeriodLabel(
  kind: RecapPeriodKind,
  state: {
    weekDate: string;
    month: string;
    semester: SemesterValue;
  },
): string {
  switch (kind) {
    case "weekly": {
      const { start, end, weekNumber } = getGuruWeekRange(state.weekDate);
      return `Minggu ${weekNumber} (${start} – ${end})`;
    }
    case "monthly":
      return getGuruMonthRange(state.month).monthLabel;
    case "semester":
      return semesterLabel(state.semester);
  }
}

/** Hapus sufiks mapel dari label lama (mis. "… · Matematika"). */
export function stripSubjectFromPeriodLabel(label: string): string {
  const sep = " · ";
  const idx = label.lastIndexOf(sep);
  return idx >= 0 ? label.slice(0, idx) : label;
}

export function recapPeriodRange(
  kind: RecapPeriodKind,
  state: {
    weekDate: string;
    month: string;
    semester: SemesterValue;
  },
): { startDate: string; endDate: string; periodLabel: string } {
  const periodLabel = recapNavPeriodLabel(kind, state);
  switch (kind) {
    case "weekly": {
      const { start, end } = getGuruWeekRange(state.weekDate);
      return { startDate: start, endDate: end, periodLabel };
    }
    case "monthly": {
      const { start, end } = getGuruMonthRange(state.month);
      return { startDate: start, endDate: end, periodLabel };
    }
    case "semester": {
      const { start, end } = semesterRange(state.semester);
      return { startDate: start, endDate: end, periodLabel };
    }
  }
}
