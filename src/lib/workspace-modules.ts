import {
  localGetWorkspaceModules,
  localSetWorkspaceModules,
} from "@/lib/local-store-modules";
import {
  DEFAULT_WORKSPACE_MODULES,
  normalizeWorkspaceModules,
  type WorkspaceModules,
} from "@/lib/workspace-modules-shared";

export {
  DEFAULT_WORKSPACE_MODULES,
  normalizeWorkspaceModules,
  type WorkspaceModules,
} from "@/lib/workspace-modules-shared";

export async function getWorkspaceModules(
  workspaceId: string,
): Promise<WorkspaceModules> {
  return localGetWorkspaceModules(workspaceId);
}

export async function setWorkspaceModules(
  workspaceId: string,
  modules: WorkspaceModules,
): Promise<void> {
  const normalized = normalizeWorkspaceModules(modules);
  await localSetWorkspaceModules(workspaceId, normalized);
}
