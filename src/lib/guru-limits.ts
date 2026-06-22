/** Selaras dengan src/lib/guru/limits.ts di backend. */
export type GuruStorageMode = "local" | "cloud";

export type GuruLimits = {
  maxWorkspaces: number;
  maxClasses: number;
  maxSubjects: number;
  maxActiveStudents: number;
};

export type GuruUsage = {
  workspaceCount: number;
  classCount: number;
  subjectCount: number;
  activeStudentCount: number;
};

export {
  GURU_QUOTA_UNLIMITED,
  isQuotaUnlimited,
  getGuruLimitsForMode,
  getGuruLocalLimitsFromEnv,
  getGuruProLimitsFromEnv,
  refreshGuruQuotaConfigFromApi,
} from "@/lib/guru-quota-config";

import {
  getGuruLimitsForMode,
  getGuruLocalLimitsFromEnv,
  getGuruProLimitsFromEnv,
  isQuotaUnlimited,
} from "@/lib/guru-quota-config";

export function canAddBillableWorkspace(
  billableWorkspaceCount: number,
  limits: GuruLimits,
): boolean {
  if (isQuotaUnlimited(limits.maxWorkspaces)) return true;
  return billableWorkspaceCount < limits.maxWorkspaces;
}

export function canAddClassInWorkspace(
  activeClassCountInWorkspace: number,
  limits: GuruLimits,
): boolean {
  if (isQuotaUnlimited(limits.maxClasses)) return true;
  return activeClassCountInWorkspace < limits.maxClasses;
}

export function guruUsageWithinLimits(
  usage: GuruUsage,
  limits: GuruLimits,
): boolean {
  if (
    !isQuotaUnlimited(limits.maxActiveStudents) &&
    usage.activeStudentCount > limits.maxActiveStudents
  ) {
    return false;
  }
  if (
    !isQuotaUnlimited(limits.maxWorkspaces) &&
    usage.workspaceCount > limits.maxWorkspaces
  ) {
    return false;
  }
  if (
    !isQuotaUnlimited(limits.maxSubjects) &&
    usage.subjectCount > limits.maxSubjects
  ) {
    return false;
  }
  return true;
}

/** Teks kuota untuk UI. */
export function formatGuruQuotaSummary(
  limits: GuruLimits,
  t: (key: import("@/lib/i18n/translations").TranslationKey, params?: Record<string, string | number>) => string,
): string {
  const schoolPart = isQuotaUnlimited(limits.maxWorkspaces)
    ? t("quota.unlimitedSchools")
    : t("quota.schoolCount", { count: limits.maxWorkspaces });
  const studentPart = isQuotaUnlimited(limits.maxActiveStudents)
    ? t("quota.unlimitedStudents")
    : t("quota.studentLimit", { count: limits.maxActiveStudents });
  const classPart = isQuotaUnlimited(limits.maxClasses)
    ? t("quota.unlimitedClassesPerSchool")
    : t("quota.classLimitPerSchool", { count: limits.maxClasses });
  return `${schoolPart} · ${classPart} · ${t("quota.unlimitedSubjects")} · ${studentPart}`;
}

export function formatGuruUsageBanner(
  usage: GuruUsage,
  limits: GuruLimits,
  tierLabel: string,
  t: (key: import("@/lib/i18n/translations").TranslationKey, params?: Record<string, string | number>) => string,
): string {
  const studentPart = isQuotaUnlimited(limits.maxActiveStudents)
    ? `${usage.activeStudentCount} ${t("common.students")}`
    : `${usage.activeStudentCount}/${limits.maxActiveStudents} ${t("common.students")}`;
  const schoolPart = isQuotaUnlimited(limits.maxWorkspaces)
    ? `${usage.workspaceCount} ${t("common.school").toLowerCase()}`
    : `${usage.workspaceCount}/${limits.maxWorkspaces} ${t("common.school").toLowerCase()}`;
  return `${tierLabel} · ${studentPart} · ${schoolPart} · ${usage.classCount} ${t("nav.statClasses").toLowerCase()} · ${usage.subjectCount} ${t("nav.statSubjects").toLowerCase()}`;
}
