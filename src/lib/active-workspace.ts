import { storage, STORAGE_KEYS } from "@/lib/storage";
import {
  apiListLocalWorkspaces,
  apiListWorkspaces,
} from "@/lib/guru-repository";
import { ensureSchoolLinkLoaded, isSchoolWorkspaceId } from "@/lib/school-link";
import {
  getWorkspaceKind,
  sortWorkspacesForDisplay,
} from "@/lib/workspace-kind";
import type { GuruWorkspace } from "@/lib/types";

function pickSchoolWorkspace(workspaces: GuruWorkspace[]): GuruWorkspace | null {
  return workspaces.find((w) => isSchoolWorkspaceId(w.id)) ?? null;
}

/**
 * Tentukan sekolah aktif setelah login.
 * Tanpa ID tersimpan → null (tampilkan pemilih sekolah).
 */
export async function resolveActiveWorkspace(): Promise<GuruWorkspace | null> {
  const savedId = await storage.get(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
  const link = await ensureSchoolLinkLoaded().catch(() => ({
    linked: false as const,
  }));

  const merged = await apiListWorkspaces();
  if (!merged.ok) {
    if (!savedId) return null;
    const local = await apiListLocalWorkspaces();
    if (!local.ok) return null;
    const workspaces = local.data.workspaces;
    return workspaces.find((w) => w.id === savedId) ?? null;
  }

  const workspaces = sortWorkspacesForDisplay(merged.data.workspaces, link);

  if (!savedId) {
    await storage.remove(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
    return null;
  }

  const saved = workspaces.find((w) => w.id === savedId) ?? null;
  if (!saved) {
    await storage.remove(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
    return null;
  }

  if (link.linked && getWorkspaceKind(saved, link) === "localArchive") {
    const school = pickSchoolWorkspace(workspaces);
    if (school) {
      await storage.set(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, school.id);
      return school;
    }
  }

  await storage.set(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, saved.id);
  return saved;
}
