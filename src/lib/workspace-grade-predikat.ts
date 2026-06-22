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
import { getCachedSchoolLink, isSchoolWorkspaceId } from "@/lib/school-link";

export async function getWorkspaceGradePredikatSettings(
  workspaceId: string,
): Promise<SchoolGradePredikatSettings> {
  if (isSchoolWorkspaceId(workspaceId)) {
    return parseGradePredikatSettings(getCachedSchoolLink()?.gradePredikat);
  }
  return localGetWorkspaceGradePredikat(workspaceId);
}

export async function saveWorkspaceGradePredikatSettings(
  workspaceId: string,
  draft: SchoolGradePredikatSettings,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (isSchoolWorkspaceId(workspaceId)) {
    return {
      ok: false,
      error: "Predikat sekolah terhubung diatur admin di portal Absendik Sekolah.",
    };
  }

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
  if (isSchoolWorkspaceId(workspaceId)) {
    return {
      ok: false,
      error: "Predikat sekolah terhubung diatur admin di portal Absendik Sekolah.",
    };
  }

  await localSetWorkspaceGradePredikat(workspaceId, DEFAULT_GRADE_PREDIKAT);
  return { ok: true };
}

export function canEditWorkspaceGradePredikat(workspaceId: string): boolean {
  return !isSchoolWorkspaceId(workspaceId);
}
