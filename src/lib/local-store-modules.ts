import { getLocalDb } from "@/lib/local-db/connection";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_WORKSPACE_MODULES,
  normalizeWorkspaceModules,
  type WorkspaceModules,
} from "@/lib/workspace-modules-shared";

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function localGetWorkspaceModules(
  workspaceId: string,
): Promise<WorkspaceModules> {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const row = await db.getFirstAsync<{
    module_attendance_enabled: number | null;
    module_grades_enabled: number | null;
  }>(
    `SELECT module_attendance_enabled, module_grades_enabled
     FROM workspaces WHERE id = ?`,
    workspaceId,
  );
  if (!row) return DEFAULT_WORKSPACE_MODULES;
  return normalizeWorkspaceModules({
    attendance: row.module_attendance_enabled !== 0,
    grades: row.module_grades_enabled !== 0,
  });
}

export async function localSetWorkspaceModules(
  workspaceId: string,
  modules: WorkspaceModules,
): Promise<void> {
  const normalized = normalizeWorkspaceModules(modules);
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  await db.runAsync(
    `UPDATE workspaces
     SET module_attendance_enabled = ?, module_grades_enabled = ?
     WHERE id = ?`,
    normalized.attendance ? 1 : 0,
    normalized.grades ? 1 : 0,
    workspaceId,
  );
}
