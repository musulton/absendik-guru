import * as api from "@/lib/api";
import {
  exportLocalSyncSnapshot,
  importLocalSyncSnapshot,
} from "@/lib/local-store";
import { getAppLocale, translate } from "@/lib/i18n/translations";
import { hasCloudSubscription } from "@/lib/storage-mode";
import type { ApiError } from "@/lib/types";

export type SyncSummary = {
  workspaces: number;
  classes: number;
  students: number;
  subjects: number;
  sessions: number;
  gradeTasks: number;
};

/** Kirim snapshot SQLite ke cadangan cloud Supabase (Pro). */
export async function syncAllLocalDataToCloud(): Promise<
  | { ok: true; summary: SyncSummary }
  | { ok: false; error: ApiError }
> {
  const locale = await getAppLocale();

  if (!(await hasCloudSubscription())) {
    return {
      ok: false,
      error: {
        code: "subscription_required",
        message: translate(locale, "cloud.needPro"),
      },
    };
  }

  const snapshot = await exportLocalSyncSnapshot();
  if (snapshot.workspaces.length === 0 && snapshot.classes.length === 0) {
    return {
      ok: false,
      error: {
        code: "empty",
        message: translate(locale, "cloud.nothingToBackup"),
      },
    };
  }

  const uploaded = await api.apiUploadSyncSnapshot(snapshot);
  if (!uploaded.ok) return uploaded;

  return {
    ok: true,
    summary: {
      workspaces: uploaded.data.summary.workspaces,
      classes: uploaded.data.summary.classes,
      students: uploaded.data.summary.students,
      subjects: uploaded.data.summary.subjects,
      sessions: uploaded.data.summary.sessions,
      gradeTasks: uploaded.data.summary.gradeTasks,
    },
  };
}

/** Unduh cadangan cloud ke SQLite (ganti data lokal). */
export async function restoreAllCloudDataToLocal(): Promise<
  | { ok: true; summary: SyncSummary }
  | { ok: false; error: ApiError }
> {
  const locale = await getAppLocale();

  if (!(await hasCloudSubscription())) {
    return {
      ok: false,
      error: {
        code: "subscription_required",
        message: translate(locale, "cloud.needProRestore"),
      },
    };
  }

  const cloud = await api.apiFetchSyncSnapshot();
  if (!cloud.ok) return cloud;

  const snapshot = cloud.data;
  if (snapshot.workspaces.length === 0 && snapshot.classes.length === 0) {
    return {
      ok: false,
      error: {
        code: "empty",
        message: translate(locale, "cloud.noBackupYet"),
      },
    };
  }

  const imported = await importLocalSyncSnapshot(snapshot);
  if (!imported.ok) return imported;

  return {
    ok: true,
    summary: {
      workspaces: snapshot.workspaces.length,
      classes: snapshot.classes.length,
      students: snapshot.students.length,
      subjects: snapshot.assignments.length,
      sessions: snapshot.sessions.length,
      gradeTasks: snapshot.gradeTasks?.length ?? 0,
    },
  };
}
