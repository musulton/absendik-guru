import { localGetWorkspaceStudentSort, localSetWorkspaceStudentSort } from "@/lib/local-store-student-sort";
import {
  DEFAULT_STUDENT_SORT_MODE,
  normalizeStudentSortMode,
  type StudentSortMode,
} from "@/lib/student-sort";

export {
  DEFAULT_STUDENT_SORT_MODE,
  normalizeStudentSortMode,
  type StudentSortMode,
} from "@/lib/student-sort";

export async function getWorkspaceStudentSort(
  workspaceId: string,
): Promise<StudentSortMode> {
  return localGetWorkspaceStudentSort(workspaceId);
}

export async function setWorkspaceStudentSort(
  workspaceId: string,
  mode: StudentSortMode,
): Promise<void> {
  await localSetWorkspaceStudentSort(workspaceId, normalizeStudentSortMode(mode));
}
