import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";
import { getGuruMonthRange } from "@/lib/month-range";
import {
  formatSchoolDayBlockMessage,
  resolveSchoolDayBlockMobile,
  type SchoolDayBlock,
} from "@/lib/school-day-block-mobile";
import {
  academicYearLabel,
  academicYearRange,
  semesterLabel,
  semesterRange,
  type AcademicYearValue,
  type SemesterValue,
} from "@/lib/period-range";
import { getGuruWeekRange } from "@/lib/week-range";
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
  GuruSchoolLinkStats,
  GuruStatusCounts,
  GuruStudent,
  GuruStudentAttendanceDetail,
  GuruStudentGradeDetail,
} from "@/lib/types";

export type SchoolApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

const API_FAIL_CODES = new Set<ApiError["code"]>([
  "network",
  "invalid_response",
  "unknown",
]);

let schoolApiCircuitOpenUntil = 0;

function isSchoolApiCircuitOpen(): boolean {
  return Date.now() < schoolApiCircuitOpenUntil;
}

function tripSchoolApiCircuit(durationMs = 3 * 60 * 1000) {
  schoolApiCircuitOpenUntil = Date.now() + durationMs;
}

function resetSchoolApiCircuit() {
  schoolApiCircuitOpenUntil = 0;
}

function shouldTripSchoolApiCircuit(error: ApiError): boolean {
  return API_FAIL_CODES.has(error.code);
}

/** API ke localhost tidak terjangkau dari perangkat fisik — langsung Supabase. */
function isLikelyUnreachableSchoolApi(): boolean {
  const url = config.apiBaseUrl.toLowerCase();
  return (
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes("0.0.0.0")
  );
}

async function runSchoolSupabaseFallback<T>(
  fallback: () => Promise<T | null>,
): Promise<SchoolApiResult<T> | null> {
  try {
    const data = await fallback();
    if (data !== null) return { ok: true, data };
  } catch {
    /* pertahankan error API */
  }
  return null;
}

/**
 * Baca data sekolah: API dulu; Supabase mulai setelah jeda singkat jika API lambat.
 * Cache di `guru-repository` mencegah fetch berulang saat navigasi.
 */
export async function fetchSchoolReadWithFallback<T>(
  apiCall: () => Promise<SchoolApiResult<T>>,
  fallback: () => Promise<T | null>,
): Promise<SchoolApiResult<T>> {
  if (isLikelyUnreachableSchoolApi() || isSchoolApiCircuitOpen()) {
    const direct = await runSchoolSupabaseFallback(fallback);
    if (direct) return direct;
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: SchoolApiResult<T>) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const delayedSupabase = setTimeout(() => {
      void runSchoolSupabaseFallback(fallback).then((result) => {
        if (result) finish(result);
      });
    }, 1_500);

    void (async () => {
      const api = await apiCall();
      clearTimeout(delayedSupabase);
      if (api.ok) {
        resetSchoolApiCircuit();
        finish(api);
        return;
      }
      if (api.error.code === "unauthorized") {
        finish(api);
        return;
      }
      if (shouldTripSchoolApiCircuit(api.error)) {
        tripSchoolApiCircuit();
      }
      if (settled) return;
      const fb = await runSchoolSupabaseFallback(fallback);
      finish(fb ?? api);
    })();
  });
}

/** Tulis data sekolah: API dan Supabase paralel — respons pertama yang sukses menang. */
export async function mutateSchoolWithFallback<T>(
  apiCall: () => Promise<SchoolApiResult<T>>,
  fallback: () => Promise<T | null>,
): Promise<SchoolApiResult<T>> {
  if (isLikelyUnreachableSchoolApi() || isSchoolApiCircuitOpen()) {
    const direct = await runSchoolSupabaseFallback(fallback);
    if (direct) return direct;
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: SchoolApiResult<T>) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    void runSchoolSupabaseFallback(fallback).then((result) => {
      if (result) finish(result);
    });

    void (async () => {
      const api = await apiCall();
      if (api.ok) {
        resetSchoolApiCircuit();
        finish(api);
        return;
      }
      if (api.error.code === "unauthorized") {
        finish(api);
        return;
      }
      if (shouldTripSchoolApiCircuit(api.error)) {
        tripSchoolApiCircuit();
      }
      if (settled) return;
      const fb = await runSchoolSupabaseFallback(fallback);
      finish(fb ?? api);
    })();
  });
}

/** Coba Supabase jika API gagal (kecuali belum login). */
export async function withSchoolSupabaseFallback<T>(
  apiResult: SchoolApiResult<T>,
  fallback: () => Promise<T | null>,
): Promise<SchoolApiResult<T>> {
  if (apiResult.ok) return apiResult;
  if (apiResult.error.code === "unauthorized") return apiResult;
  if (shouldTripSchoolApiCircuit(apiResult.error)) {
    tripSchoolApiCircuit();
  }
  const fb = await runSchoolSupabaseFallback(fallback);
  if (fb) return fb;
  return apiResult;
}

type SchoolProfile = {
  id: string;
  schoolId: string;
  role: "teacher" | "admin";
};

async function loadSchoolProfile(): Promise<
  (SchoolProfile & { attendanceMode: "class" | "subject" }) | null
> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) return null;

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, school_id, role")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr || !profile?.school_id) return null;
  if (profile.role !== "teacher" && profile.role !== "admin") return null;

  const { data: school, error: schoolErr } = await supabase
    .from("schools")
    .select("attendance_mode")
    .eq("id", profile.school_id)
    .maybeSingle();

  if (schoolErr) return null;

  return {
    id: profile.id,
    schoolId: profile.school_id,
    role: profile.role,
    attendanceMode: school?.attendance_mode === "subject" ? "subject" : "class",
  };
}

async function getAssignedClassIds(
  profile: SchoolProfile & { attendanceMode: "class" | "subject" },
): Promise<string[]> {
  if (profile.role === "admin") {
    const { data, error } = await supabase
      .from("classes")
      .select("id")
      .eq("school_id", profile.schoolId)
      .eq("is_active", true);

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => row.id);
  }

  const homeroomQuery = supabase
    .from("class_assignments")
    .select("class_id")
    .eq("teacher_id", profile.id)
    .is("subject_id", null);

  if (profile.attendanceMode === "class") {
    const { data, error } = await homeroomQuery;
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => row.class_id);
  }

  const [
    { data: subjectRows, error: subjectErr },
    { data: homeroomRows, error: homeroomErr },
  ] = await Promise.all([
    supabase
      .from("class_assignments")
      .select("class_id")
      .eq("teacher_id", profile.id)
      .not("subject_id", "is", null),
    homeroomQuery,
  ]);

  if (subjectErr) throw new Error(subjectErr.message);
  if (homeroomErr) throw new Error(homeroomErr.message);

  return [
    ...new Set([
      ...(subjectRows ?? []).map((row) => row.class_id),
      ...(homeroomRows ?? []).map((row) => row.class_id),
    ]),
  ];
}

/** Ringkasan stat workspace sekolah — mirror `summarizeSchoolLinkStats` di backend. */
async function summarizeSchoolLinkStatsFromSupabase(
  profile: SchoolProfile,
  classes: GuruClass[],
): Promise<GuruSchoolLinkStats> {
  const classIds = classes.map((row) => row.id);
  const activeStudentCount = classes.reduce(
    (sum, row) => sum + row.activeStudentCount,
    0,
  );

  if (classIds.length === 0) {
    return { classCount: 0, subjectCount: 0, activeStudentCount: 0 };
  }

  let query = supabase
    .from("class_assignments")
    .select("subject_id")
    .in("class_id", classIds)
    .not("subject_id", "is", null);

  if (profile.role === "teacher") {
    query = query.eq("teacher_id", profile.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const subjectIds = new Set<string>();
  for (const row of data ?? []) {
    if (row.subject_id) subjectIds.add(row.subject_id);
  }

  return {
    classCount: classes.length,
    subjectCount: subjectIds.size,
    activeStudentCount,
  };
}

/**
 * Deteksi tautan Absendik Sekolah langsung dari Supabase (tanpa API Next.js).
 */
export async function fetchSchoolLinkFromSupabase(): Promise<GuruSchoolLinkResponse | null> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) return null;

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, school_id, full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr || !profile?.school_id) return null;
  if (profile.role !== "teacher" && profile.role !== "admin") return null;

  const { data: school, error: schoolErr } = await supabase
    .from("schools")
    .select("name, attendance_mode, timezone")
    .eq("id", profile.school_id)
    .maybeSingle();

  if (schoolErr) return null;

  const classes = await fetchSchoolClassesFromSupabase();
  let stats: GuruSchoolLinkStats | undefined;
  if (classes) {
    try {
      stats = await summarizeSchoolLinkStatsFromSupabase(
        {
          id: profile.id,
          schoolId: profile.school_id,
          role: profile.role as "teacher" | "admin",
        },
        classes,
      );
    } catch {
      stats = {
        classCount: classes.length,
        subjectCount: 0,
        activeStudentCount: classes.reduce(
          (sum, row) => sum + row.activeStudentCount,
          0,
        ),
      };
    }
  }

  return {
    linked: true,
    workspaceId: `school:${profile.school_id}`,
    schoolId: profile.school_id,
    schoolName: school?.name?.trim() || "Sekolah",
    attendanceMode: school?.attendance_mode === "subject" ? "subject" : "class",
    timezone: school?.timezone ?? undefined,
    classes: classes ?? undefined,
    stats,
  };
}

/** Daftar kelas yang ditugaskan ke guru — langsung dari Supabase. */
export async function fetchSchoolClassesFromSupabase(): Promise<
  GuruClass[] | null
> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile) return null;

    const classIds = await getAssignedClassIds(profile);
    if (classIds.length === 0) return [];

    const { data: classes, error: classErr } = await supabase
      .from("classes")
      .select("id, name, is_active, created_at")
      .eq("school_id", profile.schoolId)
      .in("id", classIds)
      .eq("is_active", true)
      .order("name");

    if (classErr) throw new Error(classErr.message);

    const { data: students, error: studentErr } = await supabase
      .from("students")
      .select("class_id")
      .in("class_id", classIds)
      .eq("is_active", true);

    if (studentErr) throw new Error(studentErr.message);

    const counts = new Map<string, number>();
    for (const row of students ?? []) {
      counts.set(row.class_id, (counts.get(row.class_id) ?? 0) + 1);
    }

    return (classes ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      labelColor: null,
      isActive: row.is_active !== false,
      activeStudentCount: counts.get(row.id) ?? 0,
      createdAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

async function teacherCanAccessClass(
  profile: SchoolProfile & { attendanceMode: "class" | "subject" },
  classId: string,
): Promise<boolean> {
  if (profile.role === "admin") {
    const { data } = await supabase
      .from("classes")
      .select("id")
      .eq("id", classId)
      .eq("school_id", profile.schoolId)
      .maybeSingle();
    return Boolean(data);
  }
  const classIds = await getAssignedClassIds(profile);
  return classIds.includes(classId);
}

async function resolveSubjectId(
  profile: SchoolProfile & { attendanceMode: "class" | "subject" },
  classId: string,
  subjectName?: string | null,
): Promise<string | null> {
  if (profile.attendanceMode === "class") return null;

  if (subjectName === undefined || subjectName === null) return null;
  const trimmed = subjectName.trim();
  if (!trimmed || trimmed === "__homeroom__") return null;

  let query = supabase
    .from("class_assignments")
    .select("subject_id, subjects(name)")
    .eq("class_id", classId)
    .not("subject_id", "is", null);

  if (profile.role === "teacher") {
    query = query.eq("teacher_id", profile.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const match = (data ?? []).find((row) => {
    const subject = Array.isArray(row.subjects)
      ? row.subjects[0]
      : row.subjects;
    return subject?.name?.trim().toLowerCase() === trimmed.toLowerCase();
  });

  if (!match?.subject_id) return null;
  return match.subject_id;
}

async function teacherIsHomeroomOfClassMobile(
  profile: SchoolProfile,
  classId: string,
): Promise<boolean> {
  if (profile.role === "admin") return true;
  const { data } = await supabase
    .from("class_assignments")
    .select("id")
    .eq("teacher_id", profile.id)
    .eq("class_id", classId)
    .is("subject_id", null)
    .maybeSingle();
  return Boolean(data);
}

async function assertAttendanceViewAccessMobile(
  profile: SchoolProfile & { attendanceMode: "class" | "subject" },
  classId: string,
  subjectId: string | null,
): Promise<boolean> {
  if (!(await teacherCanAccessClass(profile, classId))) return false;
  if (profile.role === "admin") return true;

  if (subjectId) {
    const { data } = await supabase
      .from("class_assignments")
      .select("id")
      .eq("teacher_id", profile.id)
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .maybeSingle();
    if (data) return true;
    return teacherIsHomeroomOfClassMobile(profile, classId);
  }

  if (profile.attendanceMode === "subject") {
    return teacherIsHomeroomOfClassMobile(profile, classId);
  }

  return true;
}

async function assertAttendanceManageAccessMobile(
  profile: SchoolProfile & { attendanceMode: "class" | "subject" },
  classId: string,
  subjectId: string | null,
): Promise<boolean> {
  if (!(await teacherCanAccessClass(profile, classId))) return false;
  if (profile.role === "admin") return true;

  if (profile.attendanceMode === "subject") {
    if (!subjectId) {
      return teacherIsHomeroomOfClassMobile(profile, classId);
    }
    const { data } = await supabase
      .from("class_assignments")
      .select("id")
      .eq("teacher_id", profile.id)
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .maybeSingle();
    return Boolean(data);
  }

  return teacherIsHomeroomOfClassMobile(profile, classId);
}

const ATTENDANCE_STATUS_SET = new Set<GuruAttendanceStatus>([
  "hadir",
  "sakit",
  "izin",
  "alpha",
]);

function emptyAttendanceCounts(): GuruStatusCounts {
  return { hadir: 0, sakit: 0, izin: 0, alpha: 0 };
}

function addAttendanceStatus(
  counts: GuruStatusCounts,
  status: GuruAttendanceStatus,
) {
  counts[status] += 1;
}

async function resolveSubjectIdForAttendance(
  profile: SchoolProfile & { attendanceMode: "class" | "subject" },
  classId: string,
  subjectName?: string | null,
): Promise<string | null> {
  if (profile.attendanceMode === "class") return null;

  if (subjectName === undefined || subjectName === null) return null;
  const trimmed = subjectName.trim();
  if (!trimmed || trimmed === "__homeroom__") return null;

  return resolveSubjectId(profile, classId, subjectName);
}

type AttendanceSessionRow = {
  id: string;
  class_id: string;
  session_date: string;
  subject_id: string | null;
  submitted_at: string | null;
};

async function getOrCreateAttendanceSessionMobile(
  profile: SchoolProfile & { attendanceMode: "class" | "subject" },
  classId: string,
  date: string,
  subjectId: string | null,
): Promise<AttendanceSessionRow | null> {
  if (profile.attendanceMode === "subject" && !subjectId) {
    if (!(await teacherIsHomeroomOfClassMobile(profile, classId))) return null;
  }
  if (profile.attendanceMode === "class" && subjectId) return null;

  let sessionQuery = supabase
    .from("attendance_sessions")
    .select("id, class_id, session_date, subject_id, submitted_at")
    .eq("class_id", classId)
    .eq("school_id", profile.schoolId)
    .eq("session_date", date);

  sessionQuery = subjectId
    ? sessionQuery.eq("subject_id", subjectId)
    : sessionQuery.is("subject_id", null);

  const { data: existing, error: existingErr } =
    await sessionQuery.maybeSingle();
  if (existingErr) throw new Error(existingErr.message);
  if (existing) return existing;

  if (
    !(await assertAttendanceManageAccessMobile(profile, classId, subjectId))
  ) {
    return null;
  }

  const { data: created, error } = await supabase
    .from("attendance_sessions")
    .insert({
      class_id: classId,
      session_date: date,
      school_id: profile.schoolId,
      subject_id: subjectId,
    })
    .select("id, class_id, session_date, subject_id, submitted_at")
    .single();

  if (error) throw new Error(error.message);
  return created;
}

async function resolveSubjectName(
  subjectId: string | null,
): Promise<string | null> {
  if (!subjectId) return null;
  const { data } = await supabase
    .from("subjects")
    .select("name")
    .eq("id", subjectId)
    .maybeSingle();
  return data?.name?.trim() || null;
}

async function resolveSubjectIdForGrades(
  profile: SchoolProfile & { attendanceMode: "class" | "subject" },
  classId: string,
  subjectName?: string | null,
): Promise<string | null> {
  if (profile.attendanceMode === "class") return null;
  if (subjectName === undefined || subjectName === null) return null;
  const trimmed = subjectName.trim();
  if (!trimmed || trimmed === "__homeroom__") return null;
  return resolveSubjectId(profile, classId, subjectName);
}

async function assertGradeEntryAccessMobile(
  profile: SchoolProfile & { attendanceMode: "class" | "subject" },
  classId: string,
  subjectId: string | null,
): Promise<boolean> {
  if (!(await teacherCanAccessClass(profile, classId))) return false;
  if (profile.role === "admin") return true;

  if (profile.attendanceMode === "subject") {
    if (!subjectId) return false;
    const { data } = await supabase
      .from("class_assignments")
      .select("id")
      .eq("teacher_id", profile.id)
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .maybeSingle();
    return Boolean(data);
  }

  const { data } = await supabase
    .from("class_assignments")
    .select("id")
    .eq("teacher_id", profile.id)
    .eq("class_id", classId)
    .is("subject_id", null)
    .maybeSingle();
  return Boolean(data);
}

/** Daftar siswa aktif di kelas — langsung dari Supabase. */
export async function fetchSchoolStudentsFromSupabase(
  classId: string,
): Promise<GuruStudent[] | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile || !(await teacherCanAccessClass(profile, classId)))
      return null;

    const { data, error } = await supabase
      .from("students")
      .select("id, class_id, full_name, student_number, is_active, created_at")
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .eq("is_active", true)
      .order("full_name");

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      classId: row.class_id,
      fullName: row.full_name,
      studentNumber: row.student_number,
      isActive: row.is_active !== false,
      createdAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

/** Penugasan kelas/mapel guru — langsung dari Supabase. */
export async function fetchSchoolAssignmentsFromSupabase(
  classId: string,
): Promise<GuruAssignment[] | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile || !(await teacherCanAccessClass(profile, classId)))
      return null;

    let query = supabase
      .from("class_assignments")
      .select("id, class_id, subject_id, created_at, subjects(name)")
      .eq("class_id", classId);

    if (profile.role === "teacher") {
      query = query.eq("teacher_id", profile.id);
    }

    const { data, error } = await query.order("created_at");
    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => {
      const subject = Array.isArray(row.subjects)
        ? row.subjects[0]
        : row.subjects;
      const subjectName = subject?.name?.trim() || null;
      return {
        id: row.id,
        classId: row.class_id,
        subjectId: row.subject_id,
        subjectName,
        label: subjectName || "Wali kelas",
        labelColor: null,
        createdAt: row.created_at,
      };
    });
  } catch {
    return null;
  }
}

/** Cek libur sekolah untuk tanggal absensi — langsung dari Supabase. */
export async function fetchSchoolDayBlockFromSupabase(
  sessionDate: string,
): Promise<SchoolDayBlock | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile) return null;
    return resolveSchoolDayBlockMobile(profile.schoolId, sessionDate);
  } catch {
    return null;
  }
}

/** Absensi harian kelas — langsung dari Supabase. */
export async function fetchSchoolAttendanceFromSupabase(
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
): Promise<GuruAttendanceData | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile || !(await teacherCanAccessClass(profile, classId)))
      return null;

    const date = sessionDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

    const subjectId = await resolveSubjectIdForAttendance(
      profile,
      classId,
      subjectName,
    );
    if (
      profile.attendanceMode === "subject" &&
      subjectName !== undefined &&
      subjectName !== null &&
      subjectName.trim() &&
      subjectName.trim() !== "__homeroom__" &&
      !subjectId
    ) {
      return null;
    }
    if (!(await assertAttendanceViewAccessMobile(profile, classId, subjectId)))
      return null;

    let sessionQuery = supabase
      .from("attendance_sessions")
      .select("id, class_id, session_date, subject_id, submitted_at")
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .eq("session_date", date);

    sessionQuery = subjectId
      ? sessionQuery.eq("subject_id", subjectId)
      : sessionQuery.is("subject_id", null);

    const [{ data: session }, { data: students, error: studentsErr }] =
      await Promise.all([
        sessionQuery.maybeSingle(),
        supabase
          .from("students")
          .select("id, full_name, student_number")
          .eq("class_id", classId)
          .eq("school_id", profile.schoolId)
          .eq("is_active", true)
          .order("full_name"),
      ]);

    if (studentsErr) throw new Error(studentsErr.message);

    const recordByStudent = new Map<
      string,
      { status: GuruAttendanceStatus; note: string | null }
    >();

    if (session?.id) {
      const { data: records, error: recordsErr } = await supabase
        .from("attendance_records")
        .select("student_id, status, note")
        .eq("session_id", session.id);

      if (recordsErr) throw new Error(recordsErr.message);
      for (const row of records ?? []) {
        recordByStudent.set(row.student_id, {
          status: row.status as GuruAttendanceStatus,
          note: row.note,
        });
      }
    }

    const subjectLabel = await resolveSubjectName(
      session?.subject_id ?? subjectId,
    );

    return {
      session: session
        ? {
            id: session.id,
            classId: session.class_id,
            sessionDate: session.session_date,
            subjectName: subjectLabel,
            submittedAt: session.submitted_at,
          }
        : null,
      sessionDate: date,
      students: (students ?? []).map((student) => {
        const rec = recordByStudent.get(student.id);
        return {
          studentId: student.id,
          fullName: student.full_name,
          studentNumber: student.student_number,
          status: rec?.status ?? "alpha",
          note: rec?.note ?? null,
        };
      }),
    };
  } catch {
    return null;
  }
}

/** Simpan + submit absensi harian — langsung ke Supabase (selaras API sekolah). */
export async function saveSchoolAttendanceFromSupabase(
  classId: string,
  sessionDate: string,
  records: { studentId: string; status: GuruAttendanceStatus; note?: string }[],
  subjectName?: string | null,
): Promise<GuruAttendanceData | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile) return null;

    const date = sessionDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    if (!records.length) return null;

    for (const row of records) {
      if (!ATTENDANCE_STATUS_SET.has(row.status)) return null;
    }

    const subjectId = await resolveSubjectIdForAttendance(
      profile,
      classId,
      subjectName,
    );
    if (
      profile.attendanceMode === "subject" &&
      subjectName !== undefined &&
      subjectName !== null &&
      subjectName.trim() &&
      subjectName.trim() !== "__homeroom__" &&
      !subjectId
    ) {
      return null;
    }
    if (
      !(await assertAttendanceManageAccessMobile(profile, classId, subjectId))
    )
      return null;

    const dayBlock = await resolveSchoolDayBlockMobile(profile.schoolId, date);
    if (dayBlock) throw new Error(formatSchoolDayBlockMessage(dayBlock));

    const session = await getOrCreateAttendanceSessionMobile(
      profile,
      classId,
      date,
      subjectId,
    );
    if (!session) return null;

    if (session.submitted_at) {
      const { error: unlockErr } = await supabase
        .from("attendance_sessions")
        .update({ submitted_at: null, submitted_by: null })
        .eq("id", session.id);
      if (unlockErr) throw new Error(unlockErr.message);
    }

    const studentIds = records.map((row) => row.studentId);
    const { data: validStudents, error: valErr } = await supabase
      .from("students")
      .select("id")
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .eq("is_active", true)
      .in("id", studentIds);

    if (valErr) throw new Error(valErr.message);
    if ((validStudents ?? []).length !== studentIds.length) return null;

    const rows = records.map((record) => ({
      session_id: session.id,
      student_id: record.studentId,
      school_id: profile.schoolId,
      status: record.status,
      note: record.note?.trim() || null,
    }));

    const { error: upsertErr } = await supabase
      .from("attendance_records")
      .upsert(rows, { onConflict: "session_id,student_id" });

    if (upsertErr) throw new Error(upsertErr.message);

    const { error: submitErr } = await supabase
      .from("attendance_sessions")
      .update({
        submitted_by: profile.id,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (submitErr) throw new Error(submitErr.message);

    return fetchSchoolAttendanceFromSupabase(classId, date, subjectName);
  } catch {
    return null;
  }
}

/** Submit absensi yang sudah disimpan — langsung ke Supabase. */
export async function submitSchoolAttendanceFromSupabase(
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
): Promise<GuruAttendanceData | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile) return null;

    const date = sessionDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

    const subjectId = await resolveSubjectIdForAttendance(
      profile,
      classId,
      subjectName,
    );
    if (
      !(await assertAttendanceManageAccessMobile(profile, classId, subjectId))
    )
      return null;

    const session = await getOrCreateAttendanceSessionMobile(
      profile,
      classId,
      date,
      subjectId,
    );
    if (!session) return null;

    const { count, error: countErr } = await supabase
      .from("attendance_records")
      .select("*", { count: "exact", head: true })
      .eq("session_id", session.id);

    if (countErr) throw new Error(countErr.message);
    if (!count) return null;

    const { error: submitErr } = await supabase
      .from("attendance_sessions")
      .update({
        submitted_by: profile.id,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (submitErr) throw new Error(submitErr.message);

    return fetchSchoolAttendanceFromSupabase(classId, date, subjectName);
  } catch {
    return null;
  }
}

async function buildAttendancePeriodRecapFromSupabase(
  classId: string,
  subjectName: string | null | undefined,
  input: {
    range: { start: string; end: string };
    periodType: GuruPeriodRecap["periodType"];
    periodLabel: string;
    weekNumber?: number;
  },
): Promise<GuruPeriodRecap | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile || !(await teacherCanAccessClass(profile, classId)))
      return null;

    const subjectId = await resolveSubjectIdForAttendance(
      profile,
      classId,
      subjectName,
    );
    if (
      profile.attendanceMode === "subject" &&
      subjectName !== undefined &&
      subjectName !== null &&
      subjectName.trim() &&
      subjectName.trim() !== "__homeroom__" &&
      !subjectId
    ) {
      return null;
    }
    if (!(await assertAttendanceViewAccessMobile(profile, classId, subjectId)))
      return null;

    const className = await getClassName(profile, classId);
    const subjectLabel = await resolveSubjectName(subjectId);

    const { data: students, error: stErr } = await supabase
      .from("students")
      .select("id, full_name, student_number")
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .eq("is_active", true)
      .order("full_name");

    if (stErr) throw new Error(stErr.message);

    let sessionQuery = supabase
      .from("attendance_sessions")
      .select("id, session_date, submitted_at")
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .gte("session_date", input.range.start)
      .lte("session_date", input.range.end);

    sessionQuery = subjectId
      ? sessionQuery.eq("subject_id", subjectId)
      : sessionQuery.is("subject_id", null);

    const { data: sessions, error: sessErr } = await sessionQuery;
    if (sessErr) throw new Error(sessErr.message);

    const sessionList = sessions ?? [];
    const sessionIds = sessionList.map((session) => session.id);

    let records: {
      session_id: string;
      student_id: string;
      status: GuruAttendanceStatus;
    }[] = [];

    if (sessionIds.length > 0) {
      const { data: recs, error: recErr } = await supabase
        .from("attendance_records")
        .select("session_id, student_id, status")
        .in("session_id", sessionIds);

      if (recErr) throw new Error(recErr.message);
      records = (recs ?? []) as typeof records;
    }

    const sessionIdsWithData = new Set(records.map((row) => row.session_id));
    const daysRecorded = new Set(
      sessionList
        .filter((session) => sessionIdsWithData.has(session.id))
        .map((session) => session.session_date),
    ).size;

    const totals = emptyAttendanceCounts();
    for (const row of records) addAttendanceStatus(totals, row.status);

    const studentRecaps = (students ?? []).map((student) => {
      const recs = records.filter((row) => row.student_id === student.id);
      const counts = emptyAttendanceCounts();
      for (const row of recs) addAttendanceStatus(counts, row.status);
      const denom = daysRecorded > 0 ? daysRecorded : 0;
      const pctHadir = denom > 0 ? Math.round((counts.hadir / denom) * 100) : 0;

      return {
        studentId: student.id,
        fullName: student.full_name,
        studentNumber: student.student_number,
        counts,
        daysWithRecord: recs.length > 0 ? daysRecorded : 0,
        pctHadir,
      };
    });

    return {
      periodType: input.periodType,
      classId,
      className,
      periodLabel: input.periodLabel,
      startDate: input.range.start,
      endDate: input.range.end,
      weekNumber: input.weekNumber,
      subjectName: subjectLabel,
      daysRecorded,
      totalSessions: sessionList.length,
      totals,
      students: studentRecaps,
    };
  } catch {
    return null;
  }
}

export async function fetchSchoolAttendanceWeeklyRecapFromSupabase(
  classId: string,
  weekDate: string,
  subjectName?: string | null,
): Promise<GuruPeriodRecap | null> {
  try {
    const { start, end, weekNumber } = getGuruWeekRange(weekDate);
    const subjectLabel = subjectName?.trim() ? ` — ${subjectName.trim()}` : "";
    return buildAttendancePeriodRecapFromSupabase(classId, subjectName, {
      range: { start, end },
      periodType: "weekly",
      periodLabel: `Minggu ${weekNumber} (${start} – ${end})${subjectLabel}`,
      weekNumber,
    });
  } catch {
    return null;
  }
}

export async function fetchSchoolAttendanceMonthlyRecapFromSupabase(
  classId: string,
  month: string,
  subjectName?: string | null,
): Promise<GuruPeriodRecap | null> {
  try {
    const { start, end, monthLabel } = getGuruMonthRange(month);
    const subjectLabel = subjectName?.trim() ? ` — ${subjectName.trim()}` : "";
    return buildAttendancePeriodRecapFromSupabase(classId, subjectName, {
      range: { start, end },
      periodType: "monthly",
      periodLabel: `${monthLabel}${subjectLabel}`,
    });
  } catch {
    return null;
  }
}

export async function fetchSchoolAttendanceSemesterRecapFromSupabase(
  classId: string,
  semesterYear: number,
  semesterType: SemesterValue["semester"],
  subjectName?: string | null,
): Promise<GuruPeriodRecap | null> {
  try {
    const semester: SemesterValue = {
      year: semesterYear,
      semester: semesterType,
    };
    const range = semesterRange(semester);
    const subjectLabel = subjectName?.trim() ? ` — ${subjectName.trim()}` : "";
    return buildAttendancePeriodRecapFromSupabase(classId, subjectName, {
      range,
      periodType: "semester",
      periodLabel: `${semesterLabel(semester)}${subjectLabel}`,
    });
  } catch {
    return null;
  }
}

export async function fetchSchoolAttendanceAcademicYearRecapFromSupabase(
  classId: string,
  academicStartYear: number,
  subjectName?: string | null,
): Promise<GuruPeriodRecap | null> {
  try {
    const academicYear: AcademicYearValue = { startYear: academicStartYear };
    const range = academicYearRange(academicYear);
    const subjectLabel = subjectName?.trim() ? ` — ${subjectName.trim()}` : "";
    return buildAttendancePeriodRecapFromSupabase(classId, subjectName, {
      range,
      periodType: "academicYear",
      periodLabel: `${academicYearLabel(academicYear)}${subjectLabel}`,
    });
  } catch {
    return null;
  }
}

/** Nilai harian kelas — langsung dari Supabase. */
export async function fetchSchoolGradeDayFromSupabase(
  classId: string,
  taskDate: string,
  subjectName?: string | null,
): Promise<GuruGradeDayData | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile || !(await teacherCanAccessClass(profile, classId)))
      return null;

    const date = taskDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

    const subjectId = await resolveSubjectIdForGrades(
      profile,
      classId,
      subjectName,
    );
    if (!(await assertGradeEntryAccessMobile(profile, classId, subjectId)))
      return null;

    let taskQuery = supabase
      .from("grade_tasks")
      .select(
        "id, class_id, subject_id, task_date, title, sort_order, created_at",
      )
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .eq("task_date", date)
      .order("sort_order")
      .order("created_at");

    taskQuery = subjectId
      ? taskQuery.eq("subject_id", subjectId)
      : taskQuery.is("subject_id", null);

    const [
      { data: taskRows, error: taskErr },
      { data: students, error: studentsErr },
    ] = await Promise.all([
      taskQuery,
      supabase
        .from("students")
        .select("id, full_name, student_number")
        .eq("class_id", classId)
        .eq("school_id", profile.schoolId)
        .eq("is_active", true)
        .order("full_name"),
    ]);

    if (taskErr) throw new Error(taskErr.message);
    if (studentsErr) throw new Error(studentsErr.message);

    const tasks = await Promise.all(
      (taskRows ?? []).map(async (row) => ({
        id: row.id,
        classId: row.class_id,
        subjectName: await resolveSubjectName(row.subject_id),
        taskDate: row.task_date,
        title: row.title,
        sortOrder: row.sort_order,
        createdAt: row.created_at,
      })),
    );

    let scoreRows: {
      task_id: string;
      student_id: string;
      score: string | null;
    }[] = [];
    if (tasks.length > 0) {
      const { data: scores, error: scoreErr } = await supabase
        .from("grade_scores")
        .select("task_id, student_id, score")
        .in(
          "task_id",
          tasks.map((task) => task.id),
        );
      if (scoreErr) throw new Error(scoreErr.message);
      scoreRows = scores ?? [];
    }

    const scoreMap = new Map<string, Map<string, string | null>>();
    for (const row of scoreRows) {
      if (!scoreMap.has(row.student_id)) {
        scoreMap.set(row.student_id, new Map());
      }
      scoreMap.get(row.student_id)!.set(row.task_id, row.score);
    }

    return {
      taskDate: date,
      tasks,
      students: (students ?? []).map((student) => {
        const byTask =
          scoreMap.get(student.id) ?? new Map<string, string | null>();
        const scores: Record<string, string | null> = {};
        for (const task of tasks) {
          scores[task.id] = byTask.get(task.id) ?? null;
        }
        return {
          studentId: student.id,
          fullName: student.full_name,
          studentNumber: student.student_number,
          scores,
        };
      }),
    };
  } catch {
    return null;
  }
}

/** Riwayat absensi siswa — langsung dari Supabase. */
export async function fetchSchoolStudentAttendanceDetailFromSupabase(
  classId: string,
  studentId: string,
  subjectName?: string | null,
): Promise<GuruStudentAttendanceDetail | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile || !(await teacherCanAccessClass(profile, classId)))
      return null;

    const { data: student, error: studentErr } = await supabase
      .from("students")
      .select("id, full_name, student_number")
      .eq("id", studentId)
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .eq("is_active", true)
      .maybeSingle();

    if (studentErr || !student) return null;

    const subjectId = await resolveSubjectIdForAttendance(
      profile,
      classId,
      subjectName,
    );

    let sessionQuery = supabase
      .from("attendance_sessions")
      .select("id, session_date, subject_id, subjects(name)")
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .order("session_date", { ascending: false })
      .limit(120);

    if (subjectName !== undefined) {
      sessionQuery = subjectId
        ? sessionQuery.eq("subject_id", subjectId)
        : sessionQuery.is("subject_id", null);
    }

    const { data: sessions, error: sessionErr } = await sessionQuery;
    if (sessionErr) throw new Error(sessionErr.message);

    const sessionIds = (sessions ?? []).map((s) => s.id);
    if (sessionIds.length === 0) {
      return {
        studentId: student.id,
        fullName: student.full_name,
        studentNumber: student.student_number,
        summary: { hadir: 0, sakit: 0, izin: 0, alpha: 0 },
        totalRecords: 0,
        records: [],
      };
    }

    const { data: records, error: recordsErr } = await supabase
      .from("attendance_records")
      .select("session_id, status, note")
      .eq("student_id", studentId)
      .in("session_id", sessionIds);

    if (recordsErr) throw new Error(recordsErr.message);

    const sessionById = new Map(
      (sessions ?? []).map((s) => {
        const subject = Array.isArray(s.subjects) ? s.subjects[0] : s.subjects;
        return [
          s.id,
          {
            sessionDate: s.session_date,
            subjectName: subject?.name?.trim() ?? null,
          },
        ] as const;
      }),
    );

    const summary = { hadir: 0, sakit: 0, izin: 0, alpha: 0 };
    const detailRecords: GuruStudentAttendanceDetail["records"] = [];

    for (const row of records ?? []) {
      const session = sessionById.get(row.session_id);
      if (!session) continue;
      const status = row.status as GuruAttendanceStatus;
      summary[status] += 1;
      detailRecords.push({
        sessionDate: session.sessionDate,
        status,
        note: row.note,
        subjectName: session.subjectName,
      });
    }

    return {
      studentId: student.id,
      fullName: student.full_name,
      studentNumber: student.student_number,
      summary,
      totalRecords: detailRecords.length,
      records: detailRecords,
    };
  } catch {
    return null;
  }
}

/** Riwayat nilai siswa — langsung dari Supabase. */
export async function fetchSchoolStudentGradeDetailFromSupabase(
  classId: string,
  studentId: string,
  subjectName?: string | null,
): Promise<GuruStudentGradeDetail | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile || !(await teacherCanAccessClass(profile, classId)))
      return null;

    const { data: student, error: studentErr } = await supabase
      .from("students")
      .select("id, full_name, student_number")
      .eq("id", studentId)
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .eq("is_active", true)
      .maybeSingle();

    if (studentErr || !student) return null;

    const subjectId = await resolveSubjectIdForAttendance(
      profile,
      classId,
      subjectName,
    );

    let taskQuery = supabase
      .from("grade_tasks")
      .select("id, task_date, title, subject_id")
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .order("task_date", { ascending: false })
      .limit(120);

    if (subjectName !== undefined) {
      taskQuery = subjectId
        ? taskQuery.eq("subject_id", subjectId)
        : taskQuery.is("subject_id", null);
    }

    const { data: tasks, error: taskErr } = await taskQuery;
    if (taskErr) throw new Error(taskErr.message);

    const taskIds = (tasks ?? []).map((t) => t.id);
    if (taskIds.length === 0) {
      return {
        studentId: student.id,
        fullName: student.full_name,
        studentNumber: student.student_number,
        scoredTasks: 0,
        totalRecords: 0,
        records: [],
      };
    }

    const { data: scores, error: scoreErr } = await supabase
      .from("grade_scores")
      .select("task_id, score")
      .eq("student_id", studentId)
      .in("task_id", taskIds);

    if (scoreErr) throw new Error(scoreErr.message);

    const scoreByTask = new Map(
      (scores ?? []).map((s) => [s.task_id, s.score]),
    );
    const records = (tasks ?? [])
      .map((task) => ({
        taskId: task.id,
        taskDate: task.task_date,
        title: task.title,
        score: scoreByTask.get(task.id) ?? null,
      }))
      .filter((row) => row.score !== null);

    return {
      studentId: student.id,
      fullName: student.full_name,
      studentNumber: student.student_number,
      scoredTasks: records.length,
      totalRecords: (tasks ?? []).length,
      records,
    };
  } catch {
    return null;
  }
}

/** Tambah tugas nilai — langsung ke Supabase. */
export async function createSchoolGradeTaskFromSupabase(
  classId: string,
  taskDate: string,
  subjectName?: string | null,
  title?: string,
): Promise<GuruGradeTask | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile) return null;

    const date = taskDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

    const subjectId = await resolveSubjectIdForGrades(
      profile,
      classId,
      subjectName,
    );
    if (!(await assertGradeEntryAccessMobile(profile, classId, subjectId)))
      return null;

    let maxQuery = supabase
      .from("grade_tasks")
      .select("sort_order")
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .eq("task_date", date)
      .order("sort_order", { ascending: false })
      .limit(1);

    maxQuery = subjectId
      ? maxQuery.eq("subject_id", subjectId)
      : maxQuery.is("subject_id", null);

    const { data: maxRow, error: maxErr } = await maxQuery.maybeSingle();
    if (maxErr) throw new Error(maxErr.message);

    const sortOrder = (maxRow?.sort_order ?? -1) + 1;
    const taskTitle = title?.trim() || `Tugas ${sortOrder + 1}`;

    const { data, error } = await supabase
      .from("grade_tasks")
      .insert({
        school_id: profile.schoolId,
        class_id: classId,
        subject_id: subjectId,
        task_date: date,
        title: taskTitle,
        sort_order: sortOrder,
        created_by: profile.id,
      })
      .select(
        "id, class_id, subject_id, task_date, title, sort_order, created_at",
      )
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      classId: data.class_id,
      subjectName: await resolveSubjectName(data.subject_id),
      taskDate: data.task_date,
      title: data.title,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

/** Simpan judul tugas + nilai siswa — langsung ke Supabase. */
export async function saveSchoolGradeTaskFromSupabase(
  classId: string,
  taskId: string,
  input: {
    title: string;
    scores: { studentId: string; score?: string | null }[];
  },
): Promise<GuruGradeTask | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile) return null;

    const { data: task, error: taskErr } = await supabase
      .from("grade_tasks")
      .select(
        "id, class_id, subject_id, task_date, title, sort_order, created_at",
      )
      .eq("id", taskId)
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .maybeSingle();

    if (taskErr || !task) return null;
    if (
      !(await assertGradeEntryAccessMobile(profile, classId, task.subject_id))
    ) {
      return null;
    }

    const trimmedTitle = input.title.trim();
    if (!trimmedTitle) return null;

    const { error: updateErr } = await supabase
      .from("grade_tasks")
      .update({ title: trimmedTitle })
      .eq("id", taskId);

    if (updateErr) throw new Error(updateErr.message);

    const scoreRows = input.scores
      .map((row) => ({
        task_id: taskId,
        student_id: row.studentId,
        score: row.score?.trim() || null,
      }))
      .filter((row) => row.score !== null);

    if (scoreRows.length > 0) {
      const { error: scoreErr } = await supabase
        .from("grade_scores")
        .upsert(scoreRows, { onConflict: "task_id,student_id" });
      if (scoreErr) throw new Error(scoreErr.message);
    }

    const emptyScoreStudentIds = input.scores
      .filter((row) => !row.score?.trim())
      .map((row) => row.studentId);

    if (emptyScoreStudentIds.length > 0) {
      const { error: clearErr } = await supabase
        .from("grade_scores")
        .delete()
        .eq("task_id", taskId)
        .in("student_id", emptyScoreStudentIds);
      if (clearErr) throw new Error(clearErr.message);
    }

    const subjectName = await resolveSubjectName(task.subject_id);
    return {
      id: task.id,
      classId: task.class_id,
      subjectName,
      taskDate: task.task_date,
      title: trimmedTitle,
      sortOrder: task.sort_order,
      createdAt: task.created_at,
    };
  } catch {
    return null;
  }
}

/** Hapus tugas nilai — langsung dari Supabase. */
export async function deleteSchoolGradeTaskFromSupabase(
  classId: string,
  taskId: string,
): Promise<boolean | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile) return null;

    const { data: task, error: taskErr } = await supabase
      .from("grade_tasks")
      .select("id, subject_id")
      .eq("id", taskId)
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .maybeSingle();

    if (taskErr || !task) return null;
    if (
      !(await assertGradeEntryAccessMobile(profile, classId, task.subject_id))
    ) {
      return null;
    }

    const { error } = await supabase
      .from("grade_tasks")
      .delete()
      .eq("id", taskId);
    if (error) throw new Error(error.message);
    return true;
  } catch {
    return null;
  }
}

async function getClassName(
  profile: SchoolProfile,
  classId: string,
): Promise<string> {
  const { data } = await supabase
    .from("classes")
    .select("name")
    .eq("id", classId)
    .eq("school_id", profile.schoolId)
    .maybeSingle();
  return data?.name?.trim() || "Kelas";
}

async function buildGradePeriodRecapFromSupabase(
  classId: string,
  subjectName: string | null | undefined,
  input: {
    range: { start: string; end: string };
    periodType: GuruGradePeriodRecap["periodType"];
    periodLabel: string;
  },
): Promise<GuruGradePeriodRecap | null> {
  try {
    const profile = await loadSchoolProfile();
    if (!profile || !(await teacherCanAccessClass(profile, classId)))
      return null;

    const subjectId = await resolveSubjectIdForGrades(
      profile,
      classId,
      subjectName,
    );
    if (!(await assertGradeEntryAccessMobile(profile, classId, subjectId)))
      return null;

    const className = await getClassName(profile, classId);
    const subjectLabel = await resolveSubjectName(subjectId);

    let taskQuery = supabase
      .from("grade_tasks")
      .select("id, title, task_date")
      .eq("class_id", classId)
      .eq("school_id", profile.schoolId)
      .gte("task_date", input.range.start)
      .lte("task_date", input.range.end)
      .order("task_date")
      .order("sort_order")
      .order("created_at");

    taskQuery = subjectId
      ? taskQuery.eq("subject_id", subjectId)
      : taskQuery.is("subject_id", null);

    const [
      { data: taskRows, error: taskErr },
      { data: students, error: studentsErr },
    ] = await Promise.all([
      taskQuery,
      supabase
        .from("students")
        .select("id, full_name, student_number")
        .eq("class_id", classId)
        .eq("school_id", profile.schoolId)
        .eq("is_active", true)
        .order("full_name"),
    ]);

    if (taskErr) throw new Error(taskErr.message);
    if (studentsErr) throw new Error(studentsErr.message);

    const tasks = (taskRows ?? []).map((row) => ({
      taskId: row.id,
      title: row.title,
      taskDate: row.task_date,
    }));

    let scoreRows: {
      task_id: string;
      student_id: string;
      score: string | null;
    }[] = [];
    if (tasks.length > 0) {
      const { data: scores, error: scoreErr } = await supabase
        .from("grade_scores")
        .select("task_id, student_id, score")
        .in(
          "task_id",
          tasks.map((task) => task.taskId),
        );
      if (scoreErr) throw new Error(scoreErr.message);
      scoreRows = scores ?? [];
    }

    const scoreByStudent = new Map<string, Record<string, string | null>>();
    for (const student of students ?? []) {
      const scores: Record<string, string | null> = {};
      for (const task of tasks) scores[task.taskId] = null;
      scoreByStudent.set(student.id, scores);
    }
    for (const row of scoreRows) {
      const bucket = scoreByStudent.get(row.student_id);
      if (bucket) bucket[row.task_id] = row.score;
    }

    return {
      periodType: input.periodType,
      classId,
      className,
      periodLabel: input.periodLabel,
      startDate: input.range.start,
      endDate: input.range.end,
      subjectName: subjectLabel,
      tasks,
      students: (students ?? []).map((student) => ({
        studentId: student.id,
        fullName: student.full_name,
        studentNumber: student.student_number,
        scores: scoreByStudent.get(student.id) ?? {},
      })),
    };
  } catch {
    return null;
  }
}

export async function fetchSchoolGradeWeeklyRecapFromSupabase(
  classId: string,
  weekDate: string,
  subjectName?: string | null,
): Promise<GuruGradePeriodRecap | null> {
  try {
    const { start, end, weekNumber } = getGuruWeekRange(weekDate);
    const subjectLabel = subjectName?.trim() ? ` — ${subjectName.trim()}` : "";
    return buildGradePeriodRecapFromSupabase(classId, subjectName, {
      range: { start, end },
      periodType: "weekly",
      periodLabel: `Minggu ${weekNumber} (${start} – ${end})${subjectLabel}`,
    });
  } catch {
    return null;
  }
}

export async function fetchSchoolGradeMonthlyRecapFromSupabase(
  classId: string,
  month: string,
  subjectName?: string | null,
): Promise<GuruGradePeriodRecap | null> {
  try {
    const { start, end, monthLabel } = getGuruMonthRange(month);
    const subjectLabel = subjectName?.trim() ? ` — ${subjectName.trim()}` : "";
    return buildGradePeriodRecapFromSupabase(classId, subjectName, {
      range: { start, end },
      periodType: "monthly",
      periodLabel: `${monthLabel}${subjectLabel}`,
    });
  } catch {
    return null;
  }
}

export async function fetchSchoolGradeSemesterRecapFromSupabase(
  classId: string,
  semesterYear: number,
  semesterType: SemesterValue["semester"],
  subjectName?: string | null,
): Promise<GuruGradePeriodRecap | null> {
  try {
    const semester: SemesterValue = {
      year: semesterYear,
      semester: semesterType,
    };
    const range = semesterRange(semester);
    const subjectLabel = subjectName?.trim() ? ` — ${subjectName.trim()}` : "";
    return buildGradePeriodRecapFromSupabase(classId, subjectName, {
      range,
      periodType: "semester",
      periodLabel: `${semesterLabel(semester)}${subjectLabel}`,
    });
  } catch {
    return null;
  }
}
