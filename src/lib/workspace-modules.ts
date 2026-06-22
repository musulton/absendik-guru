import { storage } from "@/lib/storage";
import { isSchoolWorkspaceId } from "@/lib/school-link";
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

function modulesStorageKey(workspaceId: string): string {
  return `guru_workspace_modules:${workspaceId}`;
}

export async function getWorkspaceModules(
  workspaceId: string,
): Promise<WorkspaceModules> {
  if (isSchoolWorkspaceId(workspaceId)) {
    const raw = await storage.get(modulesStorageKey(workspaceId));
    if (!raw) return DEFAULT_WORKSPACE_MODULES;
    try {
      return normalizeWorkspaceModules(JSON.parse(raw) as Partial<WorkspaceModules>);
    } catch {
      return DEFAULT_WORKSPACE_MODULES;
    }
  }
  return localGetWorkspaceModules(workspaceId);
}

export async function setWorkspaceModules(
  workspaceId: string,
  modules: WorkspaceModules,
): Promise<void> {
  const normalized = normalizeWorkspaceModules(modules);
  if (isSchoolWorkspaceId(workspaceId)) {
    await storage.set(
      modulesStorageKey(workspaceId),
      JSON.stringify(normalized),
    );
    return;
  }
  await localSetWorkspaceModules(workspaceId, normalized);
}
