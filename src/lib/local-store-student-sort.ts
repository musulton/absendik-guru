import { getLocalDb } from "@/lib/local-db/connection";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_STUDENT_SORT_MODE,
  normalizeStudentSortMode,
  type StudentSortMode,
} from "@/lib/student-sort";

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function localGetWorkspaceStudentSort(
  workspaceId: string,
): Promise<StudentSortMode> {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const row = await db.getFirstAsync<{ student_sort_mode: string | null }>(
    `SELECT student_sort_mode FROM workspaces WHERE id = ?`,
    workspaceId,
  );
  if (!row) return DEFAULT_STUDENT_SORT_MODE;
  return normalizeStudentSortMode(row.student_sort_mode);
}

export async function localSetWorkspaceStudentSort(
  workspaceId: string,
  mode: StudentSortMode,
): Promise<void> {
  const normalized = normalizeStudentSortMode(mode);
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  await db.runAsync(
    `UPDATE workspaces SET student_sort_mode = ? WHERE id = ?`,
    normalized,
    workspaceId,
  );
}
