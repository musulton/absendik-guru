/**
 * Data guru: SQLite lokal untuk workspace pribadi.
 * Jika akun terhubung ke Absendik Sekolah, absensi/nilai/kelas/siswa
 * workspace sekolah dibaca dari tabel sekolah yang sama via API.
 */
import * as api from "@/lib/api";
import * as local from "@/lib/local-store";
import { hasCloudSubscription } from "@/lib/storage-mode";
import { getGuruLimitsForMode } from "@/lib/guru-limits";
import { applyProSubscriptionActive, syncProSubscriptionFromServer } from "@/lib/subscription-sync";
import * as schoolApi from "@/lib/school-api";
import { scheduleAutoCloudSync } from "@/lib/auto-cloud-sync";
import { registerWorkspaceLeadOnServer } from "@/lib/workspace-lead-registration";
import { emitListMutation } from "@/lib/list-mutation-events";
import { isSchoolLinkedWorkspace } from "@/lib/data-backend";
import {
  ensureSchoolLinkLoaded,
  getSchoolLinkSnapshot,
  getCachedSchoolClasses,
  refreshSchoolLink,
  setCachedSchoolLink,
  updateCachedSchoolClasses,
} from "@/lib/school-link";
import {
  createSchoolGradeTaskFromSupabase,
  deleteSchoolGradeTaskFromSupabase,
  fetchSchoolAssignmentsFromSupabase,
  fetchSchoolAttendanceAcademicYearRecapFromSupabase,
  fetchSchoolAttendanceFromSupabase,
  fetchSchoolAttendanceMonthlyRecapFromSupabase,
  fetchSchoolAttendanceSemesterRecapFromSupabase,
  fetchSchoolAttendanceWeeklyRecapFromSupabase,
  fetchSchoolClassesFromSupabase,
  fetchSchoolDayBlockFromSupabase,
  fetchSchoolGradeDayFromSupabase,
  fetchSchoolGradeMonthlyRecapFromSupabase,
  fetchSchoolGradeSemesterRecapFromSupabase,
  fetchSchoolGradeWeeklyRecapFromSupabase,
  fetchSchoolStudentAttendanceDetailFromSupabase,
  fetchSchoolStudentGradeDetailFromSupabase,
  fetchSchoolStudentsFromSupabase,
  fetchSchoolReadWithFallback,
  mutateSchoolWithFallback,
  saveSchoolAttendanceFromSupabase,
  saveSchoolGradeTaskFromSupabase,
  submitSchoolAttendanceFromSupabase,
} from "@/lib/school-link-supabase";
import {
  sortWorkspacesForDisplay,
} from "@/lib/workspace-kind";
import type {
  ApiResult,
  GuruAssignment,
  GuruAttendanceData,
  GuruAttendanceStatus,
  GuruClass,
  GuruStudent,
  GuruStudentAttendanceDetail,
  GuruStudentGradeDetail,
  TeachingSlotDraft,
} from "@/lib/types";
import { normalizeIsoDate } from "@/lib/dates";
import { rescheduleTeachingNotifications } from "@/lib/teaching-notifications";
import {
  cachedFetch,
  cacheKey,
  clearFetchCache,
  invalidateFetchCache,
} from "@/lib/fetch-cache";

const FETCH_TTL = {
  me: 60_000,
  list: 45_000,
  session: 30_000,
  dayBlock: 120_000,
} as const;

export { clearFetchCache };

const SCHOOL_READONLY_ERROR = {
  code: "school_readonly",
  message:
    "Data kelas dan siswa dikelola admin sekolah di Absendik Sekolah.",
} as const;

function asResult<T>(
  promise: Promise<{ ok: true; data: T } | { ok: false; error: import("@/lib/types").ApiError }>,
): Promise<ApiResult<T>> {
  return promise as Promise<ApiResult<T>>;
}

function schoolReadonly<T>(): ApiResult<T> {
  return { ok: false, error: SCHOOL_READONLY_ERROR };
}

function normalizeStudentAttendanceDetail(
  detail: GuruStudentAttendanceDetail,
): GuruStudentAttendanceDetail {
  const rawRecords = detail.records as Array<
    GuruStudentAttendanceDetail["records"][number] & {
      session_date?: string;
      subject_name?: string | null;
    }
  >;

  return {
    ...detail,
    records: rawRecords.map((row) => ({
      sessionDate:
        normalizeIsoDate(row.sessionDate ?? row.session_date) ?? "",
      status: row.status as GuruAttendanceStatus,
      note: row.note ?? null,
      subjectName: row.subjectName ?? row.subject_name ?? null,
    })),
  };
}

function normalizeStudentGradeDetail(
  detail: GuruStudentGradeDetail,
): GuruStudentGradeDetail {
  const rawRecords = detail.records as Array<
    GuruStudentGradeDetail["records"][number] & {
      task_date?: string;
    }
  >;

  return {
    ...detail,
    records: rawRecords.map((row) => ({
      taskId: row.taskId,
      taskDate: normalizeIsoDate(row.taskDate ?? row.task_date) ?? "",
      title: row.title,
      score: row.score ?? null,
    })),
  };
}

function afterLocalMutation() {
  scheduleAutoCloudSync();
  invalidateFetchCache(cacheKey(["me"]));
  invalidateFetchCache("workspaces:");
}

/** Setelah mutasi SQLite workspace lokal — invalidate cache + jadwalkan sync Pro. */
function notifyLocalWorkspaceMutation(workspaceId: string, classId?: string) {
  if (isSchoolLinkedWorkspace(workspaceId)) return;
  afterLocalMutation();
  if (classId) {
    invalidateClassData(workspaceId, classId);
    return;
  }
  invalidateFetchCache(cacheKey(["classes", workspaceId]));
}

function invalidateClassData(workspaceId: string, classId: string) {
  invalidateFetchCache(cacheKey(["students", workspaceId, classId]));
  invalidateFetchCache(cacheKey(["assignments", workspaceId, classId]));
  invalidateFetchCache(cacheKey(["classes", workspaceId]));
  invalidateFetchCache(`attendance:${workspaceId}:${classId}:`);
  invalidateFetchCache(`gradeDay:${workspaceId}:${classId}:`);
}

export { hasCloudSubscription, refreshSchoolLink, ensureSchoolLinkLoaded };
export {
  resolveDataBackend,
  shouldUseSchoolCloud,
  isSchoolLinkedWorkspace,
} from "@/lib/data-backend";

export async function usesCloudStorage(): Promise<boolean> {
  return hasCloudSubscription();
}

export async function apiMe(
  accessToken?: string | null,
  options?: { force?: boolean },
) {
  const forceBootstrap = Boolean(accessToken) || Boolean(options?.force);
  return cachedFetch(
    cacheKey(["me"]),
    FETCH_TTL.me,
    () => fetchMeUncached(accessToken, forceBootstrap),
    { force: forceBootstrap },
  );
}

async function fetchMeUncached(
  accessToken?: string | null,
  bootstrap = false,
) {
  if (bootstrap) {
    await Promise.all([
      syncProSubscriptionFromServer().catch(() => null),
      refreshSchoolLink().catch(() => ({ linked: false as const })),
    ]);
  }

  const server = await api.apiMe("cloud", accessToken);
  if (server.ok) {
    if (server.data.schoolLink?.linked) {
      setCachedSchoolLink(server.data.schoolLink);
    }
    await applyProSubscriptionActive(Boolean(server.data.cloudSubscriptionActive));
    const subscribed = server.data.cloudSubscriptionActive;
    const limits = getGuruLimitsForMode(subscribed ? "cloud" : "local");
    let usage = server.data.usage;
    try {
      usage = await local.localGetUsage();
    } catch {
      /* pertahankan usage server */
    }
    return {
      ok: true as const,
      data: {
        ...server.data,
        limits,
        usage,
        schoolLink: getSchoolLinkSnapshot(),
        cloudSubscriptionActive: subscribed,
      },
    };
  }

  if (
    server.error.code === "network" ||
    server.error.code === "invalid_response" ||
    server.error.code === "unauthorized"
  ) {
    const localResult = await local.localMe();
    if (!localResult.ok) return localResult;

    return {
      ok: true as const,
      data: {
        ...localResult.data,
        schoolLink: getSchoolLinkSnapshot(),
      },
    };
  }

  return server;
}

export async function apiListLocalWorkspaces() {
  return local.localListWorkspaces();
}

export async function apiListWorkspaces() {
  const link = await ensureSchoolLinkLoaded();
  const localResult = await local.localListWorkspaces();
  if (!link.linked) return localResult;

  const schoolWorkspace = schoolApi.buildSchoolWorkspace({
    workspaceId: link.workspaceId,
    schoolId: link.schoolId,
    schoolName: link.schoolName,
    attendanceMode: link.attendanceMode,
    classCount: link.stats?.classCount ?? link.classes?.length,
    subjectCount: link.stats?.subjectCount,
    activeStudentCount: link.stats?.activeStudentCount,
  });

  if (!localResult.ok) {
    return {
      ok: true as const,
      data: { workspaces: [schoolWorkspace] },
    };
  }

  const others = localResult.data.workspaces.filter(
    (workspace) => workspace.id !== schoolWorkspace.id,
  );
  const merged = [schoolWorkspace, ...others];
  return {
    ok: true as const,
    data: { workspaces: sortWorkspacesForDisplay(merged, link) },
  };
}

export async function apiCreateWorkspace(
  input: Parameters<typeof local.localCreateWorkspace>[0],
) {
  const result = await local.localCreateWorkspace(input);
  if (result.ok) {
    afterLocalMutation();
    registerWorkspaceLeadOnServer(result.data.workspace);
  }
  return result;
}

export async function apiRequestUpgradeInterest(workspaceId: string) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    return schoolReadonly<{ ok: boolean }>();
  }
  return api.apiRequestUpgradeInterest(workspaceId);
}

export async function apiListClasses(
  workspaceId: string,
  options?: { force?: boolean },
) {
  return cachedFetch(
    cacheKey(["classes", workspaceId]),
    FETCH_TTL.list,
    () => fetchClassesUncached(workspaceId),
    { force: Boolean(options?.force) },
  );
}

async function fetchClassesUncached(workspaceId: string) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await fetchSchoolReadWithFallback(
      () => schoolApi.apiListSchoolClasses(),
      async () => {
        const classes = await fetchSchoolClassesFromSupabase();
        if (classes === null) return null;
        return { classes };
      },
    );
    if (result.ok) {
      updateCachedSchoolClasses(result.data.classes);
      return { ok: true as const, data: { classes: result.data.classes } };
    }

    const cached = getCachedSchoolClasses();
    if (cached) {
      return { ok: true as const, data: { classes: cached } };
    }

    await ensureSchoolLinkLoaded();
    const fromLink = getCachedSchoolClasses();
    if (fromLink) {
      return { ok: true as const, data: { classes: fromLink } };
    }

    return result;
  }
  return asResult(local.localListClasses(workspaceId));
}

export async function apiCreateClass(
  workspaceId: string,
  name: string,
  labelColor: string,
  teachingSlots: TeachingSlotDraft[] = [],
) {
  if (isSchoolLinkedWorkspace(workspaceId)) return schoolReadonly<{ class: GuruClass }>();
  const result = await local.localCreateClass(
    workspaceId,
    name,
    labelColor,
    teachingSlots,
  );
  if (result.ok) void rescheduleTeachingNotifications();
  if (result.ok) {
    notifyLocalWorkspaceMutation(workspaceId);
    emitListMutation({
      type: "class-created",
      workspaceId,
      guruClass: result.data.class,
    });
  }
  return result;
}

export async function apiUpdateClass(
  workspaceId: string,
  classId: string,
  input: { name: string; labelColor: string; teachingSlots?: TeachingSlotDraft[] },
) {
  if (isSchoolLinkedWorkspace(workspaceId)) return schoolReadonly<{ class: GuruClass }>();
  const result = await local.localUpdateClass(
    workspaceId,
    classId,
    input.name,
    input.labelColor,
    input.teachingSlots,
  );
  if (result.ok) void rescheduleTeachingNotifications();
  if (result.ok) {
    notifyLocalWorkspaceMutation(workspaceId);
    emitListMutation({
      type: "class-updated",
      workspaceId,
      guruClass: result.data.class,
    });
  }
  return result;
}

export async function apiDeleteClass(workspaceId: string, classId: string) {
  if (isSchoolLinkedWorkspace(workspaceId)) return schoolReadonly<{ ok: boolean }>();
  const result = await local.localDeleteClass(workspaceId, classId);
  if (result.ok) {
    notifyLocalWorkspaceMutation(workspaceId, classId);
    emitListMutation({ type: "class-deleted", workspaceId, classId });
  }
  return result;
}

export async function apiListStudents(
  workspaceId: string,
  classId: string,
  options?: { force?: boolean },
) {
  return cachedFetch(
    cacheKey(["students", workspaceId, classId]),
    FETCH_TTL.list,
    () => fetchStudentsUncached(workspaceId, classId),
    { force: Boolean(options?.force) },
  );
}

async function fetchStudentsUncached(workspaceId: string, classId: string) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    return fetchSchoolReadWithFallback(
      () => schoolApi.apiListSchoolStudents(classId),
      async () => {
        const students = await fetchSchoolStudentsFromSupabase(classId);
        if (students === null) return null;
        return { students };
      },
    );
  }
  return asResult(local.localListStudents(workspaceId, classId));
}

export async function apiCreateStudent(
  workspaceId: string,
  classId: string,
  input: { fullName: string; studentNumber?: string },
) {
  if (isSchoolLinkedWorkspace(workspaceId)) return schoolReadonly<{ student: GuruStudent }>();
  const result = await local.localCreateStudent(workspaceId, classId, input);
  if (result.ok) {
    notifyLocalWorkspaceMutation(workspaceId, classId);
    emitListMutation({
      type: "student-created",
      workspaceId,
      classId,
      student: result.data.student,
    });
  }
  return result;
}

export async function apiUpdateStudent(
  workspaceId: string,
  classId: string,
  studentId: string,
  input: { fullName: string; studentNumber?: string },
) {
  if (isSchoolLinkedWorkspace(workspaceId)) return schoolReadonly<{ student: GuruStudent }>();
  const result = await local.localUpdateStudent(workspaceId, classId, studentId, input);
  if (result.ok) {
    notifyLocalWorkspaceMutation(workspaceId, classId);
    emitListMutation({
      type: "student-updated",
      workspaceId,
      classId,
      student: result.data.student,
    });
  }
  return result;
}

export async function apiDeleteStudent(
  workspaceId: string,
  classId: string,
  studentId: string,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) return schoolReadonly<{ ok: boolean }>();
  const result = await local.localDeleteStudent(workspaceId, classId, studentId);
  if (result.ok) {
    notifyLocalWorkspaceMutation(workspaceId, classId);
    emitListMutation({
      type: "student-deleted",
      workspaceId,
      classId,
      studentId,
    });
  }
  return result;
}

export async function apiListAssignments(
  workspaceId: string,
  classId: string,
  options?: { force?: boolean },
) {
  return cachedFetch(
    cacheKey(["assignments", workspaceId, classId]),
    FETCH_TTL.list,
    () => fetchAssignmentsUncached(workspaceId, classId),
    { force: Boolean(options?.force) },
  );
}

async function fetchAssignmentsUncached(workspaceId: string, classId: string) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    return fetchSchoolReadWithFallback(
      () => schoolApi.apiListSchoolAssignments(classId),
      async () => {
        const assignments = await fetchSchoolAssignmentsFromSupabase(classId);
        if (assignments === null) return null;
        return { assignments };
      },
    );
  }
  return local.localListAssignments(workspaceId, classId);
}

export async function apiListTeachingSlots(
  workspaceId: string,
  classId: string,
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    return { ok: true as const, data: { slots: [] } };
  }
  return asResult(
    local.localListTeachingSlots(workspaceId, classId, subjectName),
  );
}

export async function apiCreateSubjectAssignment(
  workspaceId: string,
  classId: string,
  subjectName: string,
  labelColor: string,
  teachingSlots: TeachingSlotDraft[] = [],
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    return schoolReadonly<{ assignment: GuruAssignment }>();
  }
  const result = await local.localCreateSubjectAssignment(
    workspaceId,
    classId,
    subjectName,
    labelColor,
    teachingSlots,
  );
  if (result.ok) void rescheduleTeachingNotifications();
  if (result.ok) {
    notifyLocalWorkspaceMutation(workspaceId, classId);
    emitListMutation({
      type: "assignment-created",
      workspaceId,
      classId,
      assignment: result.data.assignment,
    });
  }
  return result;
}

export async function apiUpdateSubjectAssignment(
  workspaceId: string,
  classId: string,
  assignmentId: string,
  input: { subjectName: string; labelColor: string; teachingSlots?: TeachingSlotDraft[] },
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    return schoolReadonly<{ assignment: GuruAssignment }>();
  }
  const result = await local.localUpdateSubjectAssignment(
    workspaceId,
    classId,
    assignmentId,
    input,
    input.teachingSlots,
  );
  if (result.ok) void rescheduleTeachingNotifications();
  if (result.ok) notifyLocalWorkspaceMutation(workspaceId, classId);
  return result;
}

export async function apiDeleteAssignment(
  workspaceId: string,
  classId: string,
  assignmentId: string,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) return schoolReadonly<{ ok: boolean }>();
  const result = await local.localDeleteAssignment(workspaceId, classId, assignmentId);
  if (result.ok) {
    notifyLocalWorkspaceMutation(workspaceId, classId);
    emitListMutation({
      type: "assignment-deleted",
      workspaceId,
      classId,
      assignmentId,
    });
  }
  return result;
}

export async function apiGetAttendance(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  return cachedFetch(
    cacheKey(["attendance", workspaceId, classId, sessionDate, subjectName ?? ""]),
    FETCH_TTL.session,
    () => fetchAttendanceUncached(workspaceId, classId, sessionDate, subjectName),
  );
}

async function fetchAttendanceUncached(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await fetchSchoolReadWithFallback(
      () => schoolApi.apiGetSchoolAttendance(classId, sessionDate, subjectName),
      async () => {
        const attendance = await fetchSchoolAttendanceFromSupabase(
          classId,
          sessionDate,
          subjectName,
        );
        if (attendance === null) return null;
        return { attendance };
      },
    );
    if (!result.ok) return result;
    return { ok: true as const, data: { attendance: result.data.attendance } };
  }
  return asResult(
    local.localGetAttendance(workspaceId, classId, sessionDate, subjectName),
  );
}

export async function apiGetSchoolDayBlock(workspaceId: string, sessionDate: string) {
  if (!isSchoolLinkedWorkspace(workspaceId)) return null;
  return cachedFetch(
    cacheKey(["dayBlock", workspaceId, sessionDate]),
    FETCH_TTL.dayBlock,
    () => fetchSchoolDayBlockFromSupabase(sessionDate),
  );
}

function invalidateGradeDays(workspaceId: string, classId: string) {
  invalidateFetchCache(`gradeDay:${workspaceId}:${classId}:`);
}

export async function apiSaveAttendance(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  records: Parameters<typeof local.localSaveAttendance>[3],
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await mutateSchoolWithFallback(
      () =>
        schoolApi.apiSaveSchoolAttendance(
          classId,
          sessionDate,
          records,
          subjectName,
        ),
      async () => {
        const attendance = await saveSchoolAttendanceFromSupabase(
          classId,
          sessionDate,
          records,
          subjectName,
        );
        if (attendance === null) return null;
        return { attendance };
      },
    );
    if (!result.ok) return result;
    invalidateFetchCache(
      cacheKey(["attendance", workspaceId, classId, sessionDate, subjectName ?? ""]),
    );
    return { ok: true as const, data: { attendance: result.data.attendance } };
  }
  const result = await asResult(
    local.localSaveAttendance(
      workspaceId,
      classId,
      sessionDate,
      records,
      subjectName,
    ),
  );
  if (result.ok) {
    invalidateFetchCache(
      cacheKey(["attendance", workspaceId, classId, sessionDate, subjectName ?? ""]),
    );
    notifyLocalWorkspaceMutation(workspaceId, classId);
  }
  return result;
}

export { rescheduleTeachingNotifications };

export async function apiGetGradeDay(
  workspaceId: string,
  classId: string,
  taskDate: string,
  subjectName?: string | null,
) {
  return cachedFetch(
    cacheKey(["gradeDay", workspaceId, classId, taskDate, subjectName ?? ""]),
    FETCH_TTL.session,
    () => fetchGradeDayUncached(workspaceId, classId, taskDate, subjectName),
  );
}

async function fetchGradeDayUncached(
  workspaceId: string,
  classId: string,
  taskDate: string,
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await fetchSchoolReadWithFallback(
      () => schoolApi.apiGetSchoolGradeDay(classId, taskDate, subjectName),
      async () => {
        const gradeDay = await fetchSchoolGradeDayFromSupabase(
          classId,
          taskDate,
          subjectName,
        );
        if (gradeDay === null) return null;
        return { gradeDay };
      },
    );
    if (!result.ok) return result;
    return { ok: true as const, data: { gradeDay: result.data.gradeDay } };
  }
  return asResult(local.localGetGradeDay(workspaceId, classId, taskDate, subjectName));
}

export async function apiCreateGradeTask(
  workspaceId: string,
  classId: string,
  taskDate: string,
  subjectName?: string | null,
  title?: string,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await mutateSchoolWithFallback(
      () =>
        schoolApi.apiCreateSchoolGradeTask(
          classId,
          taskDate,
          subjectName,
          title,
        ),
      async () => {
        const task = await createSchoolGradeTaskFromSupabase(
          classId,
          taskDate,
          subjectName,
          title,
        );
        if (task === null) return null;
        return { task };
      },
    );
    if (!result.ok) return result;
    invalidateGradeDays(workspaceId, classId);
    return { ok: true as const, data: { task: result.data.task } };
  }
  const result = await asResult(
    local.localCreateGradeTask(workspaceId, classId, taskDate, subjectName, title),
  );
  if (result.ok) {
    invalidateGradeDays(workspaceId, classId);
    notifyLocalWorkspaceMutation(workspaceId, classId);
  }
  return result;
}

export async function apiSaveGradeTask(
  workspaceId: string,
  classId: string,
  taskId: string,
  input: {
    title: string;
    scores: { studentId: string; score?: string | null }[];
  },
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await mutateSchoolWithFallback(
      () => schoolApi.apiSaveSchoolGradeTask(classId, taskId, input),
      async () => {
        const task = await saveSchoolGradeTaskFromSupabase(classId, taskId, input);
        if (task === null) return null;
        const gradeDay = await fetchSchoolGradeDayFromSupabase(
          classId,
          task.taskDate,
          task.subjectName,
        );
        if (gradeDay === null) return null;
        return { gradeDay };
      },
    );
    if (!result.ok) return result;
    const savedTask = result.data.gradeDay.tasks.find((task) => task.id === taskId);
    if (!savedTask) {
      return {
        ok: false,
        error: { code: "not_found", message: "Tugas tidak ditemukan." },
      };
    }
    invalidateGradeDays(workspaceId, classId);
    return { ok: true as const, data: { task: savedTask } };
  }
  const result = await asResult(local.localSaveGradeTask(workspaceId, classId, taskId, input));
  if (result.ok) {
    invalidateGradeDays(workspaceId, classId);
    notifyLocalWorkspaceMutation(workspaceId, classId);
  }
  return result;
}

export async function apiDeleteGradeTask(
  workspaceId: string,
  classId: string,
  taskId: string,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await mutateSchoolWithFallback(
      () => schoolApi.apiDeleteSchoolGradeTask(classId, taskId),
      async () => {
        const deleted = await deleteSchoolGradeTaskFromSupabase(classId, taskId);
        if (!deleted) return null;
        return { ok: true as const };
      },
    );
    if (result.ok) invalidateGradeDays(workspaceId, classId);
    return result;
  }
  const result = await asResult(local.localDeleteGradeTask(workspaceId, classId, taskId));
  if (result.ok) {
    invalidateGradeDays(workspaceId, classId);
    notifyLocalWorkspaceMutation(workspaceId, classId);
  }
  return result;
}

export async function apiGradeWeeklyRecap(
  workspaceId: string,
  classId: string,
  weekDate: string,
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await fetchSchoolReadWithFallback(
      () => schoolApi.apiSchoolGradeWeeklyRecap(classId, weekDate, subjectName),
      async () => {
        const recap = await fetchSchoolGradeWeeklyRecapFromSupabase(
          classId,
          weekDate,
          subjectName,
        );
        if (recap === null) return null;
        return { recap };
      },
    );
    if (!result.ok) return result;
    return { ok: true as const, data: { recap: result.data.recap } };
  }
  return local.localGradeWeeklyRecap(workspaceId, classId, weekDate, subjectName);
}

export async function apiGradeMonthlyRecap(
  workspaceId: string,
  classId: string,
  month: string,
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await fetchSchoolReadWithFallback(
      () => schoolApi.apiSchoolGradeMonthlyRecap(classId, month, subjectName),
      async () => {
        const recap = await fetchSchoolGradeMonthlyRecapFromSupabase(
          classId,
          month,
          subjectName,
        );
        if (recap === null) return null;
        return { recap };
      },
    );
    if (!result.ok) return result;
    return { ok: true as const, data: { recap: result.data.recap } };
  }
  return local.localGradeMonthlyRecap(workspaceId, classId, month, subjectName);
}

export async function apiGradeSemesterRecap(
  workspaceId: string,
  classId: string,
  semesterYear: number,
  semesterType: "ganjil" | "genap",
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await fetchSchoolReadWithFallback(
      () =>
        schoolApi.apiSchoolGradeSemesterRecap(
          classId,
          semesterYear,
          semesterType,
          subjectName,
        ),
      async () => {
        const recap = await fetchSchoolGradeSemesterRecapFromSupabase(
          classId,
          semesterYear,
          semesterType,
          subjectName,
        );
        if (recap === null) return null;
        return { recap };
      },
    );
    if (!result.ok) return result;
    return { ok: true as const, data: { recap: result.data.recap } };
  }
  if (!(await hasCloudSubscription())) {
    return {
      ok: false as const,
      error: {
        code: "subscription_required",
        message:
          "Rekap nilai semester untuk pelanggan berlangganan. Aktifkan langganan di Pengaturan.",
      },
    };
  }
  return local.localGradeSemesterRecap(
    workspaceId,
    classId,
    { year: semesterYear, semester: semesterType },
    subjectName,
  );
}

export async function apiSubmitAttendance(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await mutateSchoolWithFallback(
      () => schoolApi.apiSubmitSchoolAttendance(classId, sessionDate, subjectName),
      async () => {
        const attendance = await submitSchoolAttendanceFromSupabase(
          classId,
          sessionDate,
          subjectName,
        );
        if (attendance === null) return null;
        return { attendance };
      },
    );
    if (!result.ok) return result;
    return { ok: true as const, data: { attendance: result.data.attendance } };
  }
  const result = await asResult(
    local.localSubmitAttendance(workspaceId, classId, sessionDate, subjectName),
  );
  if (result.ok) notifyLocalWorkspaceMutation(workspaceId, classId);
  return result;
}

export async function apiWeeklyRecap(
  workspaceId: string,
  classId: string,
  weekDate: string,
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await fetchSchoolReadWithFallback(
      () => schoolApi.apiSchoolWeeklyRecap(classId, weekDate, subjectName),
      async () => {
        const recap = await fetchSchoolAttendanceWeeklyRecapFromSupabase(
          classId,
          weekDate,
          subjectName,
        );
        if (recap === null) return null;
        return { recap };
      },
    );
    if (!result.ok) return result;
    return { ok: true as const, data: { recap: result.data.recap } };
  }
  return local.localWeeklyRecap(workspaceId, classId, weekDate, subjectName);
}

export async function apiMonthlyRecap(
  workspaceId: string,
  classId: string,
  month: string,
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await fetchSchoolReadWithFallback(
      () => schoolApi.apiSchoolMonthlyRecap(classId, month, subjectName),
      async () => {
        const recap = await fetchSchoolAttendanceMonthlyRecapFromSupabase(
          classId,
          month,
          subjectName,
        );
        if (recap === null) return null;
        return { recap };
      },
    );
    if (!result.ok) return result;
    return { ok: true as const, data: { recap: result.data.recap } };
  }
  return local.localMonthlyRecap(workspaceId, classId, month, subjectName);
}

export async function apiSemesterRecap(
  workspaceId: string,
  classId: string,
  semesterYear: number,
  semesterType: "ganjil" | "genap",
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await fetchSchoolReadWithFallback(
      () =>
        schoolApi.apiSchoolSemesterRecap(
          classId,
          semesterYear,
          semesterType,
          subjectName,
        ),
      async () => {
        const recap = await fetchSchoolAttendanceSemesterRecapFromSupabase(
          classId,
          semesterYear,
          semesterType,
          subjectName,
        );
        if (recap === null) return null;
        return { recap };
      },
    );
    if (!result.ok) return result;
    return { ok: true as const, data: { recap: result.data.recap } };
  }
  if (!(await hasCloudSubscription())) {
    return {
      ok: false as const,
      error: {
        code: "subscription_required",
        message:
          "Rekap semester untuk pelanggan berlangganan. Aktifkan langganan di Pengaturan.",
      },
    };
  }
  return local.localSemesterRecap(
    workspaceId,
    classId,
    { year: semesterYear, semester: semesterType },
    subjectName,
  );
}

export async function apiAcademicYearRecap(
  workspaceId: string,
  classId: string,
  academicStartYear: number,
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await fetchSchoolReadWithFallback(
      () =>
        schoolApi.apiSchoolAcademicYearRecap(
          classId,
          academicStartYear,
          subjectName,
        ),
      async () => {
        const recap = await fetchSchoolAttendanceAcademicYearRecapFromSupabase(
          classId,
          academicStartYear,
          subjectName,
        );
        if (recap === null) return null;
        return { recap };
      },
    );
    if (!result.ok) return result;
    return { ok: true as const, data: { recap: result.data.recap } };
  }
  if (!(await hasCloudSubscription())) {
    return {
      ok: false as const,
      error: {
        code: "subscription_required",
        message:
          "Rekap tahun ajaran untuk pelanggan berlangganan. Aktifkan langganan di Pengaturan.",
      },
    };
  }
  return local.localAcademicYearRecap(
    workspaceId,
    classId,
    { startYear: academicStartYear },
    subjectName,
  );
}

export async function apiGetStudentAttendanceDetail(
  workspaceId: string,
  classId: string,
  studentId: string,
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await fetchSchoolReadWithFallback(
      () =>
        schoolApi.apiGetSchoolStudentAttendanceDetail(
          classId,
          studentId,
          subjectName,
        ),
      async () => {
        const detail = await fetchSchoolStudentAttendanceDetailFromSupabase(
          classId,
          studentId,
          subjectName,
        );
        if (detail === null) return null;
        return { detail };
      },
    );
    if (!result.ok) return result;
    return {
      ok: true as const,
      data: { detail: normalizeStudentAttendanceDetail(result.data.detail) },
    };
  }
  return asResult(
    local.localGetStudentAttendanceDetail(
      workspaceId,
      classId,
      studentId,
      subjectName,
    ),
  );
}

export async function apiGetStudentGradeDetail(
  workspaceId: string,
  classId: string,
  studentId: string,
  subjectName?: string | null,
) {
  if (isSchoolLinkedWorkspace(workspaceId)) {
    const result = await fetchSchoolReadWithFallback(
      () =>
        schoolApi.apiGetSchoolStudentGradeDetail(
          classId,
          studentId,
          subjectName,
        ),
      async () => {
        const detail = await fetchSchoolStudentGradeDetailFromSupabase(
          classId,
          studentId,
          subjectName,
        );
        if (detail === null) return null;
        return { detail };
      },
    );
    if (!result.ok) return result;
    return {
      ok: true as const,
      data: { detail: normalizeStudentGradeDetail(result.data.detail) },
    };
  }
  return asResult(
    local.localGetStudentGradeDetail(
      workspaceId,
      classId,
      studentId,
      subjectName,
    ),
  );
}
