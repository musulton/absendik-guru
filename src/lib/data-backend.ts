import { isSchoolWorkspaceId, getSchoolLinkSnapshot } from "@/lib/school-link";
import {
  getAutoCloudSyncEnabled,
  hasCloudSubscription,
} from "@/lib/storage-mode";

/** Sumber data operasi guru per workspace aktif. */
export type DataBackend =
  | "school-cloud"
  | "local-sqlite"
  | "local-sqlite-cloud-sync";

export function isSchoolCloudBackend(backend: DataBackend): boolean {
  return backend === "school-cloud";
}

export function usesLocalSqliteBackend(backend: DataBackend): boolean {
  return backend === "local-sqlite" || backend === "local-sqlite-cloud-sync";
}

export function shouldSyncLocalToCloud(backend: DataBackend): boolean {
  return backend === "local-sqlite-cloud-sync";
}

/**
 * Tentukan backend data untuk workspace.
 * - `school:*` + terhubung Absendik Sekolah → cloud API
 * - lokal → SQLite; Pro + sync otomatis → juga cadangkan ke cloud
 */
export async function resolveDataBackend(
  workspaceId: string,
): Promise<DataBackend> {
  if (isSchoolWorkspaceId(workspaceId)) {
    const link = getSchoolLinkSnapshot();
    if (link.linked) {
      return "school-cloud";
    }
  }

  if ((await hasCloudSubscription()) && (await getAutoCloudSyncEnabled())) {
    return "local-sqlite-cloud-sync";
  }

  return "local-sqlite";
}

/** Apakah operasi CRUD untuk workspace ini lewat cloud sekolah? */
export async function shouldUseSchoolCloud(
  workspaceId: string,
): Promise<boolean> {
  return isSchoolCloudBackend(await resolveDataBackend(workspaceId));
}

/** Apakah workspace ID menunjuk ke sekolah Absendik (prefix + link aktif)? */
export function isSchoolLinkedWorkspace(workspaceId: string): boolean {
  if (!isSchoolWorkspaceId(workspaceId)) return false;
  return getSchoolLinkSnapshot().linked;
}
