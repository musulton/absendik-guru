import { addDaysIso } from "@/lib/dates";
import { getGuruMonthRange } from "@/lib/month-range";
import { getGuruWeekRange } from "@/lib/week-range";
import {
  apiGradeWeeklyRecap,
  apiWeeklyRecap,
} from "@/lib/guru-repository";
import { summarizeStudentGrades } from "@/lib/grade-recap-display";
import type { GuruGradePeriodRecap, GuruStatusCounts } from "@/lib/types";

export type MonthlyTrendPoint = {
  key: string;
  label: string;
  value: number | null;
};

export function pctHadirFromTotals(totals: GuruStatusCounts): number | null {
  const denom = totals.hadir + totals.sakit + totals.izin + totals.alpha;
  if (denom <= 0) return null;
  return Math.round((totals.hadir / denom) * 100);
}

export function classAverageFromGradeRecap(
  recap: GuruGradePeriodRecap,
): number | null {
  const averages: number[] = [];
  for (const student of recap.students) {
    const summary = summarizeStudentGrades(student, recap.tasks);
    if (summary.average !== null) averages.push(summary.average);
  }
  if (!averages.length) return null;
  const mean = averages.reduce((sum, n) => sum + n, 0) / averages.length;
  return Math.round(mean * 10) / 10;
}

/** Senin awal tiap minggu yang bersinggungan dengan bulan YYYY-MM. */
export function listWeekAnchorsInMonth(month: string): {
  weekDate: string;
  label: string;
}[] {
  const { start, end } = getGuruMonthRange(month);
  const anchors: { weekDate: string; label: string }[] = [];
  let weekDate = getGuruWeekRange(start).start;

  while (weekDate <= end && anchors.length < 6) {
    const { start: weekStart, end: weekEnd } = getGuruWeekRange(weekDate);
    if (weekEnd >= start && weekStart <= end) {
      anchors.push({
        weekDate,
        label: `M${anchors.length + 1}`,
      });
    }
    weekDate = addDaysIso(weekDate, 7);
  }

  return anchors;
}

export async function fetchAttendanceMonthlyTrend(
  workspaceId: string,
  classId: string,
  month: string,
  subjectName?: string | null,
): Promise<MonthlyTrendPoint[]> {
  const anchors = listWeekAnchorsInMonth(month);
  const results = await Promise.all(
    anchors.map(async ({ weekDate, label }) => {
      const res = await apiWeeklyRecap(
        workspaceId,
        classId,
        weekDate,
        subjectName,
      );
      if (!res.ok) {
        return { key: weekDate, label, value: null };
      }
      return {
        key: weekDate,
        label,
        value: pctHadirFromTotals(res.data.recap.totals),
      };
    }),
  );
  return results;
}

export async function fetchGradeMonthlyTrend(
  workspaceId: string,
  classId: string,
  month: string,
  subjectName?: string | null,
): Promise<MonthlyTrendPoint[]> {
  const anchors = listWeekAnchorsInMonth(month);
  const results = await Promise.all(
    anchors.map(async ({ weekDate, label }) => {
      const res = await apiGradeWeeklyRecap(
        workspaceId,
        classId,
        weekDate,
        subjectName,
      );
      if (!res.ok) {
        return { key: weekDate, label, value: null };
      }
      return {
        key: weekDate,
        label,
        value: classAverageFromGradeRecap(res.data.recap),
      };
    }),
  );
  return results;
}
