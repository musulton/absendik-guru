import {
  DEFAULT_STUDENT_SORT_MODE,
  type StudentSortMode,
} from "@/lib/student-sort";

const cache = new Map<string, StudentSortMode>();

export function setCachedStudentSort(
  workspaceId: string,
  mode: StudentSortMode,
): void {
  cache.set(workspaceId, mode);
}

export function getCachedStudentSort(workspaceId: string): StudentSortMode {
  return cache.get(workspaceId) ?? DEFAULT_STUDENT_SORT_MODE;
}
