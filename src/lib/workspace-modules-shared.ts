export type WorkspaceModules = {
  attendance: boolean;
  grades: boolean;
};

export const DEFAULT_WORKSPACE_MODULES: WorkspaceModules = {
  attendance: true,
  grades: true,
};

export function normalizeWorkspaceModules(
  partial: Partial<WorkspaceModules> | null | undefined,
): WorkspaceModules {
  const attendance = partial?.attendance !== false;
  const grades = partial?.grades !== false;
  if (!attendance && !grades) {
    return { attendance: true, grades: false };
  }
  return { attendance, grades };
}
