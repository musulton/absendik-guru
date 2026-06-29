import { addMonthsYyyymm } from "@/lib/dates";
import {
  classAverageFromGradeRecap,
  pctHadirFromTotals,
  type MonthlyTrendPoint,
} from "@/lib/recap-monthly-trend";
import {
  apiGradeMonthlyRecap,
  apiMonthlyRecap,
} from "@/lib/guru-repository";
import { semesterRange, type SemesterValue } from "@/lib/period-range";
import type { Locale } from "@/lib/i18n/translations";

const MONTH_SHORT: Record<Locale, string[]> = {
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/** Bulan-bulan dalam rentang semester (ganjil / genap). */
export function listMonthAnchorsInSemester(
  semester: SemesterValue,
  locale: Locale = "id",
): { month: string; label: string }[] {
  const { start, end } = semesterRange(semester);
  const endMonth = end.slice(0, 7);
  const labels = MONTH_SHORT[locale];
  const anchors: { month: string; label: string }[] = [];
  let month = start.slice(0, 7);

  while (month <= endMonth && anchors.length < 7) {
    const monthIndex = Number(month.split("-")[1]) - 1;
    anchors.push({
      month,
      label: labels[monthIndex] ?? month.slice(5, 7),
    });
    month = addMonthsYyyymm(month, 1);
  }

  return anchors;
}

export async function fetchAttendanceSemesterTrend(
  workspaceId: string,
  classId: string,
  semester: SemesterValue,
  locale: Locale = "id",
  subjectName?: string | null,
): Promise<MonthlyTrendPoint[]> {
  const anchors = listMonthAnchorsInSemester(semester, locale);
  const results = await Promise.all(
    anchors.map(async ({ month, label }) => {
      const res = await apiMonthlyRecap(
        workspaceId,
        classId,
        month,
        subjectName,
      );
      if (!res.ok) {
        return { key: month, label, value: null };
      }
      return {
        key: month,
        label,
        value: pctHadirFromTotals(res.data.recap.totals),
      };
    }),
  );
  return results;
}

export async function fetchGradeSemesterTrend(
  workspaceId: string,
  classId: string,
  semester: SemesterValue,
  locale: Locale = "id",
  subjectName?: string | null,
): Promise<MonthlyTrendPoint[]> {
  const anchors = listMonthAnchorsInSemester(semester, locale);
  const results = await Promise.all(
    anchors.map(async ({ month, label }) => {
      const res = await apiGradeMonthlyRecap(
        workspaceId,
        classId,
        month,
        subjectName,
      );
      if (!res.ok) {
        return { key: month, label, value: null };
      }
      return {
        key: month,
        label,
        value: classAverageFromGradeRecap(res.data.recap),
      };
    }),
  );
  return results;
}
