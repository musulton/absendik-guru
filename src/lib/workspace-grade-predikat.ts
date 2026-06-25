import {
  DEFAULT_GRADE_PREDIKAT,
  parseGradePredikatDraft,
  parseGradePredikatSettings,
  type SchoolGradePredikatSettings,
} from "@/lib/grade-predikat";
import {
  localGetWorkspaceGradePredikat,
  localSetWorkspaceGradePredikat,
} from "@/lib/local-store-grade-predikat";

export async function getWorkspaceGradePredikatSettings(
  workspaceId: string,
): Promise<SchoolGradePredikatSettings> {
  return localGetWorkspaceGradePredikat(workspaceId);
}

export async function saveWorkspaceGradePredikatSettings(
  workspaceId: string,
  draft: SchoolGradePredikatSettings,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = parseGradePredikatDraft(draft);
  if ("error" in parsed) {
    return { ok: false, error: parsed.error };
  }

  await localSetWorkspaceGradePredikat(workspaceId, parsed);
  return { ok: true };
}

export async function resetWorkspaceGradePredikatSettings(
  workspaceId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await localSetWorkspaceGradePredikat(workspaceId, DEFAULT_GRADE_PREDIKAT);
  return { ok: true };
}

export function canEditWorkspaceGradePredikat(_workspaceId: string): boolean {
  return true;
}
