import type {
  GuruGradePeriodRecap,
  GuruGradeStudentRecap,
  GuruGradeTaskRecap,
  GuruStudentGradeRecord,
} from "@/lib/types";
import {
  DEFAULT_GRADE_PREDIKAT,
  GRADE_BAND_ORDER,
  getGradeBandForScore,
  getGradeBandLabel,
  type GradeBand,
  type SchoolGradePredikatSettings,
} from "@/lib/grade-predikat";

export type { GradeBand, SchoolGradePredikatSettings } from "@/lib/grade-predikat";
export { DEFAULT_GRADE_PREDIKAT, getGradeBandLabel, parseGradePredikatSettings } from "@/lib/grade-predikat";

export type GradeRecapStudentSummary = {
  scored: number;
  total: number;
  average: number | null;
};

export { GRADE_BAND_ORDER };

/** Warna sel/badge rekap nilai — selaras dengan rekap absensi. */
export const RECAP_GRADE_COLORS: Record<GradeBand, { bg: string; text: string }> =
  {
    sangat_baik: { bg: "#ecfdf5", text: "#059669" },
    baik: { bg: "#eff6ff", text: "#2563eb" },
    cukup: { bg: "#fffbeb", text: "#d97706" },
    kurang: { bg: "#fef2f2", text: "#dc2626" },
  };

export function parseGradeScore(raw: string | null | undefined): number | null {
  if (!raw?.trim()) return null;
  const n = parseFloat(raw.trim().replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

export function getGradeBand(
  score: number,
  settings: SchoolGradePredikatSettings = DEFAULT_GRADE_PREDIKAT,
): GradeBand {
  return getGradeBandForScore(score, settings);
}

export function getGradeScorePalette(
  raw: string | null | undefined,
  settings: SchoolGradePredikatSettings = DEFAULT_GRADE_PREDIKAT,
): { bg: string; text: string } | null {
  const score = parseGradeScore(raw);
  if (score === null) return null;
  return RECAP_GRADE_COLORS[getGradeBandForScore(score, settings)];
}

export function getGradeAveragePalette(
  average: number | null | undefined,
  settings: SchoolGradePredikatSettings = DEFAULT_GRADE_PREDIKAT,
): { bg: string; text: string } | null {
  if (average == null || Number.isNaN(average)) return null;
  return RECAP_GRADE_COLORS[getGradeBandForScore(average, settings)];
}

export type GradeBandCounts = Record<GradeBand, number>;

/** Filter daftar nilai — rata-rata predikat atau ada nilai kurang (remedial). */
export type GradeListPredikatFilter = "all" | GradeBand | "any_kurang";

export type GradeListFilter = {
  query?: string;
  predikat?: GradeListPredikatFilter;
};

export function emptyGradeBandCounts(): GradeBandCounts {
  return { sangat_baik: 0, baik: 0, cukup: 0, kurang: 0 };
}

export function countGradeBandsFromRecap(
  recap: GuruGradePeriodRecap,
  settings: SchoolGradePredikatSettings = DEFAULT_GRADE_PREDIKAT,
): GradeBandCounts {
  const counts = emptyGradeBandCounts();
  for (const student of recap.students) {
    addStudentGradeBands(counts, student, recap.tasks, settings);
  }
  return counts;
}

/** Jumlah siswa per predikat rata-rata (bukan jumlah nilai). */
export function countStudentAverageBandsFromRecap(
  recap: GuruGradePeriodRecap,
  settings: SchoolGradePredikatSettings = DEFAULT_GRADE_PREDIKAT,
): GradeBandCounts {
  const counts = emptyGradeBandCounts();
  for (const student of recap.students) {
    const band = getStudentAverageBand(student, recap.tasks, settings);
    if (band === null) continue;
    counts[band] += 1;
  }
  return counts;
}

export function countStudentGradeBands(
  student: GuruGradeStudentRecap,
  tasks: GuruGradeTaskRecap[],
  settings: SchoolGradePredikatSettings = DEFAULT_GRADE_PREDIKAT,
): GradeBandCounts {
  const counts = emptyGradeBandCounts();
  addStudentGradeBands(counts, student, tasks, settings);
  return counts;
}

export function countGradeBandsFromRecords(
  records: Pick<GuruStudentGradeRecord, "score">[],
  settings: SchoolGradePredikatSettings = DEFAULT_GRADE_PREDIKAT,
): GradeBandCounts {
  const counts = emptyGradeBandCounts();
  for (const record of records) {
    const score = parseGradeScore(record.score);
    if (score === null) continue;
    counts[getGradeBandForScore(score, settings)] += 1;
  }
  return counts;
}

function addStudentGradeBands(
  counts: GradeBandCounts,
  student: GuruGradeStudentRecap,
  tasks: GuruGradeTaskRecap[],
  settings: SchoolGradePredikatSettings,
) {
  for (const task of tasks) {
    const score = parseGradeScore(student.scores[task.taskId]);
    if (score === null) continue;
    counts[getGradeBandForScore(score, settings)] += 1;
  }
}

export function formatGradeBandCounts(
  counts: GradeBandCounts,
  settings: SchoolGradePredikatSettings = DEFAULT_GRADE_PREDIKAT,
): string {
  return GRADE_BAND_ORDER.filter((band) => counts[band] > 0)
    .map((band) => `${getGradeBandLabel(band, settings)} ${counts[band]}`)
    .join(" · ");
}

export function summarizeStudentGrades(
  student: GuruGradeStudentRecap,
  tasks: GuruGradeTaskRecap[],
): GradeRecapStudentSummary {
  let scored = 0;
  const nums: number[] = [];

  for (const task of tasks) {
    const raw = student.scores[task.taskId]?.trim();
    if (!raw) continue;
    scored += 1;
    const n = parseGradeScore(raw);
    if (n !== null) nums.push(n);
  }

  const average =
    nums.length > 0
      ? Math.round((nums.reduce((sum, n) => sum + n, 0) / nums.length) * 10) / 10
      : null;

  return { scored, total: tasks.length, average };
}

export type GradeListMatchEntry = {
  taskId: string;
  title: string;
  taskDate: string;
  score: string;
  band: GradeBand;
};

export function isGradeListPredikatFilterActive(
  filter: GradeListFilter,
): boolean {
  return (filter.predikat ?? "all") !== "all";
}

/** Nilai per tugas yang relevan dengan filter predikat aktif. */
export function getStudentGradeListMatchEntries(
  student: GuruGradeStudentRecap,
  tasks: GuruGradeTaskRecap[],
  settings: SchoolGradePredikatSettings,
  filter: GradeListFilter,
): GradeListMatchEntry[] {
  const predikat = filter.predikat ?? "all";
  if (predikat === "all") return [];

  const entries: GradeListMatchEntry[] = [];

  for (const task of tasks) {
    const raw = student.scores[task.taskId]?.trim();
    if (!raw) continue;
    const score = parseGradeScore(raw);
    if (score === null) continue;
    const band = getGradeBandForScore(score, settings);

    if (predikat === "any_kurang") {
      if (band !== "kurang") continue;
    }

    entries.push({
      taskId: task.taskId,
      title: task.title,
      taskDate: task.taskDate,
      score: raw,
      band,
    });
  }

  return entries;
}

export function getGradeListVisibleTasks(
  tasks: GuruGradeTaskRecap[],
  students: GuruGradeStudentRecap[],
  settings: SchoolGradePredikatSettings,
  filter: GradeListFilter,
): GuruGradeTaskRecap[] {
  if (!isGradeListPredikatFilterActive(filter)) return tasks;

  const taskIds = new Set<string>();
  for (const student of students) {
    for (const entry of getStudentGradeListMatchEntries(
      student,
      tasks,
      settings,
      filter,
    )) {
      taskIds.add(entry.taskId);
    }
  }

  if (taskIds.size === 0) return tasks;
  return tasks.filter((task) => taskIds.has(task.taskId));
}

export function getStudentAverageBand(
  student: GuruGradeStudentRecap,
  tasks: GuruGradeTaskRecap[],
  settings: SchoolGradePredikatSettings = DEFAULT_GRADE_PREDIKAT,
): GradeBand | null {
  const { average } = summarizeStudentGrades(student, tasks);
  if (average == null) return null;
  return getGradeBandForScore(average, settings);
}

export function studentHasPredikatScore(
  student: GuruGradeStudentRecap,
  tasks: GuruGradeTaskRecap[],
  settings: SchoolGradePredikatSettings,
  band: GradeBand,
): boolean {
  for (const task of tasks) {
    const score = parseGradeScore(student.scores[task.taskId]);
    if (score === null) continue;
    if (getGradeBandForScore(score, settings) === band) return true;
  }
  return false;
}

function matchesGradeListSearch(
  student: Pick<GuruGradeStudentRecap, "fullName" | "studentNumber">,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (student.fullName.toLowerCase().includes(q)) return true;
  if (student.studentNumber?.toLowerCase().includes(q)) return true;
  return false;
}

export function filterGradeRecapStudents<T extends GuruGradeStudentRecap>(
  students: T[],
  tasks: GuruGradeTaskRecap[],
  settings: SchoolGradePredikatSettings,
  filter: GradeListFilter,
): T[] {
  const predikat = filter.predikat ?? "all";
  const query = filter.query ?? "";

  return students.filter((student) => {
    if (!matchesGradeListSearch(student, query)) return false;
    if (predikat === "all") return true;
    if (predikat === "any_kurang") {
      return studentHasPredikatScore(student, tasks, settings, "kurang");
    }
    return getStudentAverageBand(student, tasks, settings) === predikat;
  });
}

export function shouldUseGradeRecapSummary(
  taskCount: number,
  periodKind: "weekly" | "monthly" | "semester",
): boolean {
  if (periodKind !== "weekly") return true;
  return taskCount > 3;
}

export { formatIsoDateShort as formatTaskDateShort } from "@/lib/dates";
