import type { GuruSchoolLinkResponse, GuruUsage, GuruWorkspace } from "@/lib/types";
import { canAddBillableWorkspace, getGuruLimitsForMode } from "@/lib/guru-limits";
import { isCloudSubscriptionActive } from "@/lib/storage-mode";
import { getWorkspaceKind } from "@/lib/workspace-kind";

/** Sekolah di HP — exclude workspace terhubung & arsip lokal. */
export function countBillableWorkspaces(
  workspaces: GuruWorkspace[],
  link: GuruSchoolLinkResponse,
): number {
  return workspaces.filter(
    (workspace) => getWorkspaceKind(workspace, link) === "local",
  ).length;
}

/** Daftar sekolah utama — tanpa arsip lokal sebelum terhubung. */
export function filterMainWorkspaces(
  workspaces: GuruWorkspace[],
  link: GuruSchoolLinkResponse,
): GuruWorkspace[] {
  return workspaces.filter(
    (workspace) => getWorkspaceKind(workspace, link) !== "localArchive",
  );
}

/** Arsip data lokal yang kembar dengan sekolah terhubung. */
export function filterArchiveWorkspaces(
  workspaces: GuruWorkspace[],
  link: GuruSchoolLinkResponse,
): GuruWorkspace[] {
  return workspaces.filter(
    (workspace) => getWorkspaceKind(workspace, link) === "localArchive",
  );
}

/** Kuota siswa lokal — exclude siswa di workspace arsip saat terhubung ke sekolah. */
export function applyLocalStudentQuotaUsage(
  raw: GuruUsage,
  workspaces: GuruWorkspace[],
  link: GuruSchoolLinkResponse,
): GuruUsage {
  if (!link.linked) return raw;

  const archivedStudents = workspaces
    .filter((workspace) => getWorkspaceKind(workspace, link) === "localArchive")
    .reduce((sum, workspace) => sum + (workspace.activeStudentCount ?? 0), 0);

  if (archivedStudents === 0) return raw;

  return {
    ...raw,
    activeStudentCount: Math.max(0, raw.activeStudentCount - archivedStudents),
  };
}

/** Cek kuota sekolah mandiri — selaras dengan localCreateWorkspace. */
export async function canAddBillableWorkspaceNow(
  workspaces: GuruWorkspace[],
  link: GuruSchoolLinkResponse,
): Promise<boolean> {
  const subscribed = await isCloudSubscriptionActive();
  const limits = getGuruLimitsForMode(subscribed ? "cloud" : "local");
  return canAddBillableWorkspace(countBillableWorkspaces(workspaces, link), limits);
}
