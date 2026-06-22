import { resolveApiUrl } from "@/lib/config";
import { getAccessToken } from "@/lib/auth";
import { getAppLocale, translate } from "@/lib/i18n/translations";
import type {
  ApiError,
  GuruAssignment,
  GuruAttendanceData,
  GuruAttendanceStatus,
  GuruClass,
  GuruGradeDayData,
  GuruGradePeriodRecap,
  GuruGradeTask,
  GuruPeriodRecap,
  GuruSchoolLinkResponse,
  GuruStudent,
  SchoolLinkSummary,
} from "@/lib/types";

const FETCH_TIMEOUT_MS = 5_000;

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function schoolFetch<T>(
  path: string,
  init?: RequestInit,
  accessTokenOverride?: string | null,
): Promise<{ ok: true; data: T } | { ok: false; error: ApiError }> {
  const locale = await getAppLocale();
  const token = accessTokenOverride ?? (await getAccessToken());
  if (!token) {
    return {
      ok: false,
      error: { code: "unauthorized", message: translate(locale, "error.notSignedIn") },
    };
  }

  const url = resolveApiUrl(path);

  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    return {
      ok: false,
      error: {
        code: "network",
        message: translate(locale, "error.connectionFailed"),
      },
    };
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {
      ok: false,
      error: {
        code: "invalid_response",
        message: translate(locale, "error.serverInvalidResponse"),
      },
    };
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      error: (json as { error?: ApiError }).error ?? {
        code: "unknown",
        message: translate(locale, "error.requestFailed"),
      },
    };
  }
  return { ok: true, data: json as T };
}

function subjectQueryParam(
  subjectName: string | null | undefined,
): string | undefined {
  if (subjectName === undefined) return undefined;
  if (subjectName === null) return "__homeroom__";
  return subjectName;
}

function classPath(classId: string, suffix: string) {
  return `/api/guru/v1/school/classes/${classId}${suffix}`;
}

export async function apiFetchSchoolLink() {
  return schoolFetch<GuruSchoolLinkResponse>("/api/guru/v1/school/link");
}

export async function apiListSchoolClasses() {
  return schoolFetch<{ classes: GuruClass[] }>("/api/guru/v1/school/classes");
}

export async function apiListSchoolStudents(classId: string) {
  return schoolFetch<{ students: GuruStudent[] }>(
    classPath(classId, "/students"),
  );
}

export async function apiGetSchoolStudentAttendanceDetail(
  classId: string,
  studentId: string,
  subjectName?: string | null,
) {
  const q = new URLSearchParams();
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  const query = q.toString();
  return schoolFetch<{ detail: import("@/lib/types").GuruStudentAttendanceDetail }>(
    `${classPath(classId, `/students/${studentId}/attendance`)}${query ? `?${query}` : ""}`,
  );
}

export async function apiGetSchoolStudentGradeDetail(
  classId: string,
  studentId: string,
  subjectName?: string | null,
) {
  const q = new URLSearchParams();
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  const query = q.toString();
  return schoolFetch<{ detail: import("@/lib/types").GuruStudentGradeDetail }>(
    `${classPath(classId, `/students/${studentId}/grades`)}${query ? `?${query}` : ""}`,
  );
}

export async function apiListSchoolAssignments(classId: string) {
  return schoolFetch<{ assignments: GuruAssignment[] }>(
    classPath(classId, "/assignments"),
  );
}

export async function apiGetSchoolAttendance(
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  const q = new URLSearchParams({ date: sessionDate });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return schoolFetch<{ attendance: GuruAttendanceData }>(
    `${classPath(classId, "/attendance")}?${q}`,
  );
}

export async function apiSaveSchoolAttendance(
  classId: string,
  sessionDate: string,
  records: {
    studentId: string;
    status: GuruAttendanceStatus;
    note?: string;
  }[],
  subjectName?: string | null,
) {
  const body: {
    sessionDate: string;
    records: typeof records;
    subjectName?: string | null;
  } = { sessionDate, records };
  if (subjectName !== undefined) {
    body.subjectName = subjectName === null ? "__homeroom__" : subjectName;
  }
  return schoolFetch<{ attendance: GuruAttendanceData }>(
    classPath(classId, "/attendance"),
    { method: "PUT", body: JSON.stringify(body) },
  );
}

export async function apiSubmitSchoolAttendance(
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  const body: { sessionDate: string; subjectName?: string | null } = {
    sessionDate,
  };
  if (subjectName !== undefined) {
    body.subjectName = subjectName === null ? "__homeroom__" : subjectName;
  }
  return schoolFetch<{ attendance: GuruAttendanceData }>(
    classPath(classId, "/attendance/submit"),
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function apiGetSchoolGradeDay(
  classId: string,
  taskDate: string,
  subjectName?: string | null,
) {
  const q = new URLSearchParams({ taskDate });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return schoolFetch<{ gradeDay: GuruGradeDayData }>(
    `${classPath(classId, "/grades/day")}?${q}`,
  );
}

export async function apiCreateSchoolGradeTask(
  classId: string,
  taskDate: string,
  subjectName?: string | null,
  title?: string,
) {
  const body: {
    taskDate: string;
    subjectName?: string | null;
    title?: string;
  } = { taskDate };
  if (subjectName !== undefined) {
    body.subjectName = subjectName === null ? "__homeroom__" : subjectName;
  }
  if (title) body.title = title;
  return schoolFetch<{ task: GuruGradeTask }>(
    classPath(classId, "/grades/day"),
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function apiSaveSchoolGradeTask(
  classId: string,
  taskId: string,
  input: {
    title: string;
    scores: { studentId: string; score?: string | null }[];
  },
) {
  return schoolFetch<{ gradeDay: GuruGradeDayData }>(
    classPath(classId, `/grades/tasks/${taskId}`),
    { method: "PUT", body: JSON.stringify(input) },
  );
}

export async function apiDeleteSchoolGradeTask(classId: string, taskId: string) {
  return schoolFetch<{ ok: boolean }>(
    classPath(classId, `/grades/tasks/${taskId}`),
    { method: "DELETE" },
  );
}

export async function apiSchoolWeeklyRecap(
  classId: string,
  weekDate: string,
  subjectName?: string | null,
) {
  const q = new URLSearchParams({ period: "weekly", weekDate });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return schoolFetch<{ recap: GuruPeriodRecap }>(
    `${classPath(classId, "/recap")}?${q}`,
  );
}

export async function apiSchoolMonthlyRecap(
  classId: string,
  month: string,
  subjectName?: string | null,
) {
  const q = new URLSearchParams({ period: "monthly", month });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return schoolFetch<{ recap: GuruPeriodRecap }>(
    `${classPath(classId, "/recap")}?${q}`,
  );
}

export async function apiSchoolSemesterRecap(
  classId: string,
  semesterYear: number,
  semesterType: "ganjil" | "genap",
  subjectName?: string | null,
) {
  const q = new URLSearchParams({
    period: "semester",
    semesterYear: String(semesterYear),
    semesterType,
  });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return schoolFetch<{ recap: GuruPeriodRecap }>(
    `${classPath(classId, "/recap")}?${q}`,
  );
}

export async function apiSchoolAcademicYearRecap(
  classId: string,
  academicStartYear: number,
  subjectName?: string | null,
) {
  const q = new URLSearchParams({
    period: "academicYear",
    academicStartYear: String(academicStartYear),
  });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return schoolFetch<{ recap: GuruPeriodRecap }>(
    `${classPath(classId, "/recap")}?${q}`,
  );
}

export async function apiSchoolGradeWeeklyRecap(
  classId: string,
  weekDate: string,
  subjectName?: string | null,
) {
  const q = new URLSearchParams({ period: "weekly", weekDate });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return schoolFetch<{ recap: GuruGradePeriodRecap }>(
    `${classPath(classId, "/grades/recap")}?${q}`,
  );
}

export async function apiSchoolGradeMonthlyRecap(
  classId: string,
  month: string,
  subjectName?: string | null,
) {
  const q = new URLSearchParams({ period: "monthly", month });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return schoolFetch<{ recap: GuruGradePeriodRecap }>(
    `${classPath(classId, "/grades/recap")}?${q}`,
  );
}

export async function apiSchoolGradeSemesterRecap(
  classId: string,
  semesterYear: number,
  semesterType: "ganjil" | "genap",
  subjectName?: string | null,
) {
  const q = new URLSearchParams({
    period: "semester",
    semesterYear: String(semesterYear),
    semesterType,
  });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return schoolFetch<{ recap: GuruGradePeriodRecap }>(
    `${classPath(classId, "/grades/recap")}?${q}`,
  );
}

export function buildSchoolWorkspace(summary: SchoolLinkSummary): import("@/lib/types").GuruWorkspace {
  return {
    id: summary.workspaceId,
    name: summary.schoolName,
    city: null,
    npsn: null,
    province: null,
    address: null,
    schoolLevel: null,
    contactName: null,
    contactPhone: null,
    contactEmail: null,
    identityKey: null,
    attendanceMode: summary.attendanceMode,
    role: "member",
    createdAt: new Date().toISOString(),
    classCount: summary.classCount,
    subjectCount: summary.subjectCount,
    activeStudentCount: summary.activeStudentCount,
  };
}
