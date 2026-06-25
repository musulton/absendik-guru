import type { GuruStudent } from "@/lib/types";

export type StudentSortMode = "name" | "nis";

export const DEFAULT_STUDENT_SORT_MODE: StudentSortMode = "name";

export function normalizeStudentSortMode(
  raw: string | null | undefined,
): StudentSortMode {
  return raw === "nis" ? "nis" : "name";
}

export function sqlStudentOrderBy(mode: StudentSortMode): string {
  if (mode === "nis") {
    return `ORDER BY CASE WHEN student_number IS NULL OR TRIM(student_number) = '' THEN 1 ELSE 0 END ASC, student_number ASC, full_name ASC`;
  }
  return `ORDER BY full_name ASC`;
}

export function compareStudents(
  a: Pick<GuruStudent, "fullName" | "studentNumber">,
  b: Pick<GuruStudent, "fullName" | "studentNumber">,
  mode: StudentSortMode,
): number {
  if (mode === "nis") {
    const aNis = a.studentNumber?.trim() ?? "";
    const bNis = b.studentNumber?.trim() ?? "";
    const aEmpty = !aNis;
    const bEmpty = !bNis;
    if (aEmpty !== bEmpty) return aEmpty ? 1 : -1;
    if (!aEmpty && !bEmpty) {
      const cmp = aNis.localeCompare(bNis, "id", { numeric: true });
      if (cmp !== 0) return cmp;
    }
  }
  return a.fullName.localeCompare(b.fullName, "id");
}

export function sortStudentsByMode<T extends GuruStudent>(
  students: T[],
  mode: StudentSortMode,
): T[] {
  return [...students].sort((a, b) => compareStudents(a, b, mode));
}
