import { isSchoolWorkspaceId } from "@/lib/school-link";
import type { GuruSchoolLinkResponse, GuruWorkspace } from "@/lib/types";

export type WorkspaceKind = "school" | "local" | "localArchive";

function normalizeSchoolName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Workspace lokal yang kembar nama dengan sekolah terhubung — arsip sebelum link. */
export function localWorkspaceDuplicatesLinkedSchool(
  workspace: GuruWorkspace,
  link: GuruSchoolLinkResponse & { linked: true },
): boolean {
  const localName = normalizeSchoolName(workspace.name);
  const schoolName = normalizeSchoolName(link.schoolName);
  if (localName && localName === schoolName) return true;

  const localNpsn = workspace.npsn?.trim();
  if (localNpsn && link.schoolId && workspace.identityKey?.includes(link.schoolId)) {
    return true;
  }

  return false;
}

export function getWorkspaceKind(
  workspace: GuruWorkspace,
  link: GuruSchoolLinkResponse = { linked: false },
): WorkspaceKind {
  if (isSchoolWorkspaceId(workspace.id)) return "school";
  if (link.linked && localWorkspaceDuplicatesLinkedSchool(workspace, link)) {
    return "localArchive";
  }
  return "local";
}

const KIND_ORDER: Record<WorkspaceKind, number> = {
  school: 0,
  local: 1,
  localArchive: 2,
};

/** Urutkan: sekolah aktif → lokal mandiri → arsip sebelum terhubung. */
export function sortWorkspacesForDisplay(
  workspaces: GuruWorkspace[],
  link: GuruSchoolLinkResponse,
): GuruWorkspace[] {
  return [...workspaces].sort((a, b) => {
    const orderA = KIND_ORDER[getWorkspaceKind(a, link)];
    const orderB = KIND_ORDER[getWorkspaceKind(b, link)];
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, "id");
  });
}

export function linkedSchoolNameMatches(
  inputName: string,
  link: GuruSchoolLinkResponse,
): boolean {
  if (!link.linked) return false;
  return normalizeSchoolName(inputName) === normalizeSchoolName(link.schoolName);
}

export function isLocalArchiveWorkspace(
  workspace: GuruWorkspace,
  link: GuruSchoolLinkResponse,
): boolean {
  return getWorkspaceKind(workspace, link) === "localArchive";
}
