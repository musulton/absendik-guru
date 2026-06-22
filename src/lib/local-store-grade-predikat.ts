import { getLocalDb } from "@/lib/local-db/connection";
import {
  DEFAULT_GRADE_PREDIKAT,
  gradePredikatToJson,
  parseGradePredikatSettings,
  type SchoolGradePredikatSettings,
} from "@/lib/grade-predikat";
import { supabase } from "@/lib/supabase";

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function localGetWorkspaceGradePredikat(
  workspaceId: string,
): Promise<SchoolGradePredikatSettings> {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const row = await db.getFirstAsync<{ grade_predikat_json: string | null }>(
    `SELECT grade_predikat_json FROM workspaces WHERE id = ?`,
    workspaceId,
  );
  if (!row?.grade_predikat_json) return DEFAULT_GRADE_PREDIKAT;
  try {
    return parseGradePredikatSettings(JSON.parse(row.grade_predikat_json));
  } catch {
    return DEFAULT_GRADE_PREDIKAT;
  }
}

export async function localSetWorkspaceGradePredikat(
  workspaceId: string,
  settings: SchoolGradePredikatSettings,
): Promise<void> {
  const payload = gradePredikatToJson(settings);
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  await db.runAsync(
    `UPDATE workspaces SET grade_predikat_json = ? WHERE id = ?`,
    JSON.stringify(payload),
    workspaceId,
  );
}
