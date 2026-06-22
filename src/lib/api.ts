import { resolveApiUrl } from "@/lib/config";
import type {
  ApiError,
  GuruAssignment,
  GuruAttendanceData,
  GuruAttendanceStatus,
  GuruClass,
  GuruStudent,
  GuruPeriodRecap,
  GuruSchoolLevel,
  GuruWorkspace,
  GuruProSubscriptionStatus,
  GuruProDeviceStatus,
  MeResponse,
  SubscriptionStatusResponse,
} from "@/lib/types";
import { getAccessToken } from "@/lib/auth";
import { getGuruDeviceHeaders } from "@/lib/device-id";
import { getAppLocale, translate } from "@/lib/i18n/translations";

const FETCH_TIMEOUT_MS = 20_000;

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      const locale = await getAppLocale();
      throw new Error(translate(locale, "error.noServerResponse"));
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function guruFetch<T>(
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

  const deviceHeaders = await getGuruDeviceHeaders();

  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...deviceHeaders,
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    return {
      ok: false,
      error: { code: "network", message: translate(locale, "error.connectionFailed") },
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
    const err = (json as { error?: ApiError }).error;
    return {
      ok: false,
      error: err ?? {
        code: "unknown",
        message: `${translate(locale, "error.requestFailed")} (${res.status}).`,
      },
    };
  }
  return { ok: true, data: json as T };
}

export async function apiMe(
  storageMode: "cloud" = "cloud",
  accessToken?: string | null,
) {
  return guruFetch<MeResponse>(
    "/api/guru/v1/me",
    {
      headers: { "X-Guru-Storage-Mode": storageMode },
    },
    accessToken,
  );
}

export async function apiListWorkspaces() {
  return guruFetch<{ workspaces: GuruWorkspace[] }>("/api/guru/v1/workspaces");
}

export async function apiRequestUpgradeInterest(workspaceId: string) {
  return guruFetch<{ ok: boolean }>(
    `/api/guru/v1/workspaces/${workspaceId}/upgrade-interest`,
    { method: "POST" },
  );
}

export async function apiSubscriptionStatus() {
  return guruFetch<SubscriptionStatusResponse>("/api/guru/v1/subscription");
}

export async function apiVerifyAndroidPurchase(input: {
  purchaseToken: string;
  productId?: string;
}) {
  return guruFetch<{
    ok: boolean;
    subscription: GuruProSubscriptionStatus;
    proDevice?: GuruProDeviceStatus | null;
  }>("/api/guru/v1/subscription/android/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function apiTransferProDevice() {
  return guruFetch<{
    ok: boolean;
    proDevice: GuruProDeviceStatus;
  }>("/api/guru/v1/pro/device/transfer", {
    method: "POST",
  });
}

export async function apiCreateWorkspace(input: {
  name: string;
  city?: string;
  npsn?: string;
  province?: string;
  address?: string;
  schoolLevel?: GuruSchoolLevel;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  attendanceMode?: "class" | "subject";
}) {
  return guruFetch<{ workspace: GuruWorkspace }>("/api/guru/v1/workspaces", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

function workspacePath(workspaceId: string, suffix: string) {
  return `/api/guru/v1/workspaces/${workspaceId}${suffix}`;
}

/** Query subjectName: undefined = default null; string = mapel; homeroom = wali. */
function subjectQueryParam(
  subjectName: string | null | undefined,
): string | undefined {
  if (subjectName === undefined) return undefined;
  if (subjectName === null) return "__homeroom__";
  return subjectName;
}

export async function apiListClasses(workspaceId: string) {
  return guruFetch<{ classes: GuruClass[] }>(
    workspacePath(workspaceId, "/classes"),
  );
}

export async function apiCreateClass(
  workspaceId: string,
  name: string,
  labelColor?: string,
) {
  return guruFetch<{ class: GuruClass }>(
    workspacePath(workspaceId, "/classes"),
    { method: "POST", body: JSON.stringify({ name, labelColor }) },
  );
}

export async function apiUpdateClass(
  workspaceId: string,
  classId: string,
  name: string,
) {
  return guruFetch<{ class: GuruClass }>(
    workspacePath(workspaceId, `/classes/${classId}`),
    { method: "PATCH", body: JSON.stringify({ name }) },
  );
}

export async function apiDeleteClass(workspaceId: string, classId: string) {
  return guruFetch<{ ok: boolean }>(
    workspacePath(workspaceId, `/classes/${classId}`),
    { method: "DELETE" },
  );
}

export async function apiListStudents(workspaceId: string, classId: string) {
  return guruFetch<{ students: GuruStudent[] }>(
    workspacePath(workspaceId, `/classes/${classId}/students`),
  );
}

export async function apiCreateStudent(
  workspaceId: string,
  classId: string,
  input: { fullName: string; studentNumber?: string },
) {
  return guruFetch<{ student: GuruStudent }>(
    workspacePath(workspaceId, `/classes/${classId}/students`),
    { method: "POST", body: JSON.stringify(input) },
  );
}

export async function apiUpdateStudent(
  workspaceId: string,
  classId: string,
  studentId: string,
  input: { fullName: string; studentNumber?: string },
) {
  return guruFetch<{ student: GuruStudent }>(
    workspacePath(workspaceId, `/classes/${classId}/students/${studentId}`),
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export async function apiDeleteStudent(
  workspaceId: string,
  classId: string,
  studentId: string,
) {
  return guruFetch<{ ok: boolean }>(
    workspacePath(workspaceId, `/classes/${classId}/students/${studentId}`),
    { method: "DELETE" },
  );
}

export async function apiListAssignments(
  workspaceId: string,
  classId: string,
) {
  return guruFetch<{ assignments: GuruAssignment[] }>(
    workspacePath(workspaceId, `/classes/${classId}/assignments`),
  );
}

export async function apiCreateSubjectAssignment(
  workspaceId: string,
  classId: string,
  subjectName: string,
  labelColor?: string,
) {
  return guruFetch<{ assignment: GuruAssignment }>(
    workspacePath(workspaceId, `/classes/${classId}/assignments`),
    { method: "POST", body: JSON.stringify({ subjectName, labelColor }) },
  );
}

export async function apiDeleteAssignment(
  workspaceId: string,
  classId: string,
  assignmentId: string,
) {
  return guruFetch<{ ok: boolean }>(
    workspacePath(
      workspaceId,
      `/classes/${classId}/assignments/${assignmentId}`,
    ),
    { method: "DELETE" },
  );
}

export async function apiGetAttendance(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  const q = new URLSearchParams({ date: sessionDate });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return guruFetch<{ attendance: GuruAttendanceData }>(
    `${workspacePath(workspaceId, `/classes/${classId}/attendance`)}?${q}`,
  );
}

export async function apiSaveAttendance(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  records: { studentId: string; status: GuruAttendanceStatus; note?: string }[],
  subjectName?: string | null,
) {
  const body: {
    sessionDate: string;
    records: typeof records;
    subjectName?: string | null;
  } = { sessionDate, records };
  if (subjectName !== undefined) {
    body.subjectName =
      subjectName === null ? "__homeroom__" : subjectName;
  }
  return guruFetch<{ attendance: GuruAttendanceData }>(
    workspacePath(workspaceId, `/classes/${classId}/attendance`),
    { method: "PUT", body: JSON.stringify(body) },
  );
}

export async function apiSubmitAttendance(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  const body: { sessionDate: string; subjectName?: string | null } = {
    sessionDate,
  };
  if (subjectName !== undefined) {
    body.subjectName =
      subjectName === null ? "__homeroom__" : subjectName;
  }
  return guruFetch<{ attendance: GuruAttendanceData }>(
    workspacePath(workspaceId, `/classes/${classId}/attendance/submit`),
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function apiWeeklyRecap(
  workspaceId: string,
  classId: string,
  weekDate: string,
  subjectName?: string | null,
) {
  const q = new URLSearchParams({ weekDate });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return guruFetch<{ recap: GuruPeriodRecap }>(
    `${workspacePath(workspaceId, `/classes/${classId}/recap/weekly`)}?${q}`,
  );
}

export async function apiMonthlyRecap(
  workspaceId: string,
  classId: string,
  month: string,
  subjectName?: string | null,
) {
  const q = new URLSearchParams({ month });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return guruFetch<{ recap: GuruPeriodRecap }>(
    `${workspacePath(workspaceId, `/classes/${classId}/recap/monthly`)}?${q}`,
  );
}

export async function apiSemesterRecap(
  workspaceId: string,
  classId: string,
  semesterYear: number,
  semesterType: "ganjil" | "genap",
  subjectName?: string | null,
) {
  const q = new URLSearchParams({
    semesterYear: String(semesterYear),
    semesterType,
  });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return guruFetch<{ recap: GuruPeriodRecap }>(
    `${workspacePath(workspaceId, `/classes/${classId}/recap/semester`)}?${q}`,
  );
}

export async function apiAcademicYearRecap(
  workspaceId: string,
  classId: string,
  academicStartYear: number,
  subjectName?: string | null,
) {
  const q = new URLSearchParams({
    academicStartYear: String(academicStartYear),
  });
  const sub = subjectQueryParam(subjectName);
  if (sub !== undefined) q.set("subjectName", sub);
  return guruFetch<{ recap: GuruPeriodRecap }>(
    `${workspacePath(workspaceId, `/classes/${classId}/recap/academic-year`)}?${q}`,
  );
}

export async function apiFetchSyncSnapshot() {
  return guruFetch<import("@/lib/local-store").LocalSyncSnapshot>(
    "/api/guru/v1/sync/snapshot",
  );
}

export async function apiUploadSyncSnapshot(
  snapshot: import("@/lib/local-store").LocalSyncSnapshot,
) {
  return guruFetch<{
    ok: boolean;
    syncedAt: string;
    summary: {
      workspaces: number;
      classes: number;
      students: number;
      subjects: number;
      sessions: number;
      gradeTasks: number;
    };
  }>("/api/guru/v1/sync/snapshot", {
    method: "POST",
    body: JSON.stringify(snapshot),
  });
}

export async function apiRegisterGuruSchools(
  schools: {
    name: string;
    city?: string | null;
    npsn?: string | null;
    attendanceMode?: "class" | "subject";
    schoolLevel?: string | null;
    province?: string | null;
    address?: string | null;
    contactName?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
  }[],
) {
  return guruFetch<{ ok: boolean; registered: number }>(
    "/api/guru/v1/workspaces/register",
    {
      method: "POST",
      body: JSON.stringify({ schools }),
    },
  );
}
