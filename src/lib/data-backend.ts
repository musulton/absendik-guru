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
 * Lokal → SQLite; Pro + sync otomatis → juga cadangkan ke cloud.
 */
export async function resolveDataBackend(
  _workspaceId: string,
): Promise<DataBackend> {
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

/** Apakah workspace ID menunjuk ke sekolah terhubung (legacy)? */
export function isSchoolLinkedWorkspace(_workspaceId: string): boolean {
  return false;
}
