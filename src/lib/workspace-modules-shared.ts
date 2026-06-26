export type WorkspaceModules = {
  attendance: boolean;
  grades: boolean;
  teachingJournal: boolean;
  studentNotes: boolean;
};

export const DEFAULT_WORKSPACE_MODULES: WorkspaceModules = {
  attendance: true,
  grades: true,
  teachingJournal: true,
  studentNotes: true,
};

export function countEnabledModules(modules: WorkspaceModules): number {
  return [
    modules.attendance,
    modules.grades,
    modules.teachingJournal,
    modules.studentNotes,
  ].filter(Boolean).length;
}

export function normalizeWorkspaceModules(
  partial: Partial<WorkspaceModules> | null | undefined,
): WorkspaceModules {
  const modules: WorkspaceModules = {
    attendance: partial?.attendance !== false,
    grades: partial?.grades !== false,
    teachingJournal: partial?.teachingJournal !== false,
    studentNotes: partial?.studentNotes !== false,
  };
  if (countEnabledModules(modules) === 0) {
    return { ...DEFAULT_WORKSPACE_MODULES };
  }
  return modules;
}
