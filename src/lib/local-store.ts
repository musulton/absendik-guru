import { getLocalDb } from "@/lib/local-db/connection";
import {
  getGuruLimitsForMode,
  canAddBillableWorkspace,
  canAddClassInWorkspace,
  isQuotaUnlimited,
} from "@/lib/guru-limits";
import { isCloudSubscriptionActive } from "@/lib/storage-mode";
import { getGuruMonthRange } from "@/lib/month-range";
import {
  academicYearLabel,
  academicYearRange,
  semesterLabel,
  semesterRange,
  type AcademicYearValue,
  type SemesterValue,
} from "@/lib/period-range";
import { getGuruWeekRange } from "@/lib/week-range";
import { getAppLocale, translate } from "@/lib/i18n/translations";
import { getSchoolLinkSnapshot } from "@/lib/school-link";
import {
  applyLocalStudentQuotaUsage,
  countBillableWorkspaces,
} from "@/lib/workspace-quota";
import { supabase } from "@/lib/supabase";
import type {
  ApiError,
  GuruAssignment,
  GuruAttendanceData,
  GuruAttendanceStatus,
  GuruAttendanceStudent,
  GuruClass,
  GuruGradeDayData,
  GuruGradePeriodRecap,
  GuruGradeStudentRecap,
  GuruGradeTask,
  GuruGradeTaskRecap,
  GuruPeriodRecap,
  GuruSchoolLevel,
  GuruStatusCounts,
  GuruStudent,
  GuruTeachingSlot,
  GuruWorkspace,
  GuruUsage,
  MeResponse,
  TeachingSlotDraft,
} from "@/lib/types";

const VALID_SCHOOL_LEVELS = new Set<GuruSchoolLevel>([
  "sd",
  "smp",
  "sma",
  "smk",
  "madrasah",
  "lainnya",
]);

type WorkspaceDbRow = {
  id: string;
  name: string;
  city: string | null;
  npsn: string | null;
  province: string | null;
  address: string | null;
  school_level: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  identity_key: string | null;
  attendance_mode: string;
  created_at: string;
  class_count?: number;
  subject_count?: number;
  active_student_count?: number;
};

function mapWorkspaceRow(row: WorkspaceDbRow): GuruWorkspace {
  const level = row.school_level as GuruSchoolLevel | null;
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    npsn: row.npsn,
    province: row.province,
    address: row.address,
    schoolLevel: level && VALID_SCHOOL_LEVELS.has(level) ? level : null,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    identityKey: row.identity_key,
    attendanceMode: row.attendance_mode as "class" | "subject",
    role: "owner",
    createdAt: row.created_at,
    classCount: row.class_count,
    subjectCount: row.subject_count,
    activeStudentCount: row.active_student_count,
  };
}

function newId() {
  return `loc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function assignmentLabel(subjectName: string | null) {
  return subjectName?.trim() || "Wali kelas";
}

function fail(code: string, message: string): { ok: false; error: ApiError } {
  return { ok: false, error: { code, message } };
}

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("UNAUTHORIZED");
  return id;
}

function resolveSubject(subjectName?: string | null): string | null {
  if (subjectName === undefined) return null;
  return subjectName?.trim() || null;
}

function resolveTeachingSubject(subjectName?: string | null): string | null {
  return subjectName?.trim() || null;
}

async function replaceTeachingSlots(
  db: Awaited<ReturnType<typeof getLocalDb>>,
  workspaceId: string,
  classId: string,
  subjectName: string | null,
  slots: TeachingSlotDraft[],
) {
  await db.runAsync(
    `DELETE FROM teaching_slots
     WHERE workspace_id = ? AND class_id = ? AND COALESCE(subject_name, '') = COALESCE(?, '')`,
    workspaceId,
    classId,
    subjectName,
  );
  const createdAt = nowIso();
  for (const slot of slots) {
    for (const dayOfWeek of slot.daysOfWeek) {
      if (dayOfWeek < 1 || dayOfWeek > 7) continue;
      await db.runAsync(
        `INSERT INTO teaching_slots
         (id, workspace_id, class_id, subject_name, day_of_week, start_time, end_time, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        newId(),
        workspaceId,
        classId,
        subjectName,
        dayOfWeek,
        slot.startTime,
        slot.endTime?.trim() || null,
        createdAt,
      );
    }
  }
}

export async function localListTeachingSlots(
  workspaceId: string,
  classId: string,
  subjectName?: string | null,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const subject = resolveTeachingSubject(subjectName ?? null);
  const rows = await db.getAllAsync<{
    id: string;
    workspace_id: string;
    class_id: string;
    subject_name: string | null;
    day_of_week: number;
    start_time: string;
    end_time: string | null;
    created_at: string;
  }>(
    `SELECT id, workspace_id, class_id, subject_name, day_of_week, start_time, end_time, created_at
     FROM teaching_slots
     WHERE workspace_id = ? AND class_id = ?
       AND COALESCE(subject_name, '') = COALESCE(?, '')
     ORDER BY day_of_week ASC, start_time ASC`,
    workspaceId,
    classId,
    subject,
  );

  const slots: GuruTeachingSlot[] = rows.map((r) => ({
    id: r.id,
    workspaceId: r.workspace_id,
    classId: r.class_id,
    subjectName: r.subject_name,
    dayOfWeek: r.day_of_week,
    startTime: r.start_time,
    endTime: r.end_time,
    createdAt: r.created_at,
  }));

  return { ok: true as const, data: { slots } };
}

export async function localListTeachingSlotsForNotifications() {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const rows = await db.getAllAsync<{
    id: string;
    workspace_id: string;
    class_id: string;
    subject_name: string | null;
    day_of_week: number;
    start_time: string;
    class_name: string;
  }>(
    `SELECT ts.id, ts.workspace_id, ts.class_id, ts.subject_name, ts.day_of_week, ts.start_time,
            c.name AS class_name
     FROM teaching_slots ts
     JOIN classes c ON c.id = ts.class_id AND c.is_active = 1
     ORDER BY ts.day_of_week ASC, ts.start_time ASC`,
  );

  return {
    ok: true as const,
    data: {
      slots: rows.map((r) => ({
        id: r.id,
        workspaceId: r.workspace_id,
        classId: r.class_id,
        subjectName: r.subject_name,
        dayOfWeek: r.day_of_week,
        startTime: r.start_time,
        className: r.class_name,
      })),
    },
  };
}

async function computeUsage(userId: string): Promise<GuruUsage> {
  const db = await getLocalDb(userId);
  const ws = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM workspaces`,
  );
  const cls = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM classes WHERE is_active = 1`,
  );
  const sub = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM assignments WHERE subject_name IS NOT NULL`,
  );
  const st = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n
     FROM students s
     INNER JOIN classes c
       ON c.id = s.class_id AND c.workspace_id = s.workspace_id
     WHERE s.is_active = 1 AND c.is_active = 1`,
  );
  return {
    workspaceCount: ws?.n ?? 0,
    classCount: cls?.n ?? 0,
    subjectCount: sub?.n ?? 0,
    activeStudentCount: st?.n ?? 0,
  };
}

async function listLocalWorkspacesForQuota(userId: string): Promise<GuruWorkspace[]> {
  const db = await getLocalDb(userId);
  const rows = await db.getAllAsync<WorkspaceDbRow>(
    `SELECT w.*,
            (SELECT COUNT(*) FROM classes c
             WHERE c.workspace_id = w.id AND c.is_active = 1) AS class_count,
            (SELECT COUNT(DISTINCT a.subject_name) FROM assignments a
             WHERE a.workspace_id = w.id AND a.subject_name IS NOT NULL) AS subject_count,
            (SELECT COUNT(*) FROM students s
             INNER JOIN classes c
               ON c.id = s.class_id AND c.workspace_id = w.id
             WHERE s.workspace_id = w.id AND s.is_active = 1 AND c.is_active = 1) AS active_student_count
     FROM workspaces w
     ORDER BY w.created_at ASC`,
  );
  return rows.map(mapWorkspaceRow);
}

async function computeQuotaUsage(userId: string): Promise<GuruUsage> {
  const [raw, workspaces] = await Promise.all([
    computeUsage(userId),
    listLocalWorkspacesForQuota(userId),
  ]);
  const link = getSchoolLinkSnapshot();
  const studentAdjusted = applyLocalStudentQuotaUsage(raw, workspaces, link);
  return {
    ...studentAdjusted,
    workspaceCount: countBillableWorkspaces(workspaces, link),
  };
}

export async function localGetUsage(): Promise<GuruUsage> {
  const userId = await requireUserId();
  return computeQuotaUsage(userId);
}

export async function localMe(): Promise<
  { ok: true; data: MeResponse } | { ok: false; error: ApiError }
> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const user = session.session?.user;
    if (!user) return fail("unauthorized", "Belum login.");

    const meta = user.user_metadata ?? {};
    const fullName =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      user.email?.split("@")[0] ||
      "Guru";

    const usage = await computeQuotaUsage(user.id);
    const subscribed = await isCloudSubscriptionActive();
    const limits = getGuruLimitsForMode(subscribed ? "cloud" : "local");

    return {
      ok: true,
      data: {
        account: {
          id: user.id,
          fullName,
          email: user.email ?? null,
          avatarUrl:
            (typeof meta.avatar_url === "string" && meta.avatar_url) ||
            (typeof meta.picture === "string" && meta.picture) ||
            null,
        },
        storageMode: "local",
        limits,
        usage,
        cloudSubscriptionActive: subscribed,
      },
    };
  } catch (e) {
    const locale = await getAppLocale();
    return fail(
      "local_db",
      e instanceof Error
        ? e.message
        : translate(locale, "local.dbOpenFailed"),
    );
  }
}

export async function localListWorkspaces(): Promise<
  | { ok: true; data: { workspaces: GuruWorkspace[] } }
  | { ok: false; error: ApiError }
> {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const rows = await db.getAllAsync<WorkspaceDbRow>(
    `SELECT w.*,
            (SELECT COUNT(*) FROM classes c
             WHERE c.workspace_id = w.id AND c.is_active = 1) AS class_count,
            (SELECT COUNT(DISTINCT a.subject_name) FROM assignments a
             WHERE a.workspace_id = w.id AND a.subject_name IS NOT NULL) AS subject_count,
            (SELECT COUNT(*) FROM students s
             INNER JOIN classes c
               ON c.id = s.class_id AND c.workspace_id = w.id
             WHERE s.workspace_id = w.id AND s.is_active = 1 AND c.is_active = 1) AS active_student_count
     FROM workspaces w
     ORDER BY w.created_at ASC`,
  );

  return { ok: true, data: { workspaces: rows.map(mapWorkspaceRow) } };
}

export async function localCreateWorkspace(input: {
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
}): Promise<
  | { ok: true; data: { workspace: GuruWorkspace } }
  | { ok: false; error: ApiError }
> {
  const userId = await requireUserId();
  const trimmedName = input.name.trim();
  if (!trimmedName) return fail("validation", "Nama sekolah wajib diisi.");
  if (!input.schoolLevel) {
    return fail("validation", "Jenjang sekolah wajib dipilih.");
  }
  const city = input.city?.trim();
  if (!city) return fail("validation", "Kota/kabupaten wajib diisi.");

  const usage = await computeQuotaUsage(userId);
  const subscribed = await isCloudSubscriptionActive();
  const limits = getGuruLimitsForMode(subscribed ? "cloud" : "local");
  if (!canAddBillableWorkspace(usage.workspaceCount, limits)) {
    const locale = await getAppLocale();
    return fail(
      "limit",
      subscribed
        ? translate(locale, "workspace.schoolQuotaFull", {
            max: limits.maxWorkspaces,
          })
        : translate(locale, "local.freeSchoolLimit"),
    );
  }

  const ws: GuruWorkspace = {
    id: newId(),
    name: trimmedName,
    city,
    npsn: input.npsn?.trim() || null,
    province: input.province?.trim() || null,
    address: input.address?.trim() || null,
    schoolLevel: input.schoolLevel,
    contactName: input.contactName?.trim() || null,
    contactPhone: input.contactPhone?.trim() || null,
    contactEmail: input.contactEmail?.trim() || null,
    identityKey: null,
    attendanceMode: input.attendanceMode ?? "class",
    role: "owner",
    createdAt: nowIso(),
    classCount: 0,
    subjectCount: 0,
    activeStudentCount: 0,
  };

  const db = await getLocalDb(userId);
  try {
    await db.runAsync(
      `INSERT INTO workspaces (
         id, name, city, npsn, province, address, school_level,
         contact_name, contact_phone, contact_email,
         identity_key, attendance_mode,
         module_attendance_enabled, module_grades_enabled,
         created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?)`,
      ws.id,
      ws.name,
      ws.city,
      ws.npsn,
      ws.province,
      ws.address,
      ws.schoolLevel,
      ws.contactName,
      ws.contactPhone,
      ws.contactEmail,
      ws.identityKey,
      ws.attendanceMode,
      ws.createdAt,
    );
  } catch {
    const locale = await getAppLocale();
    return fail(
      "unknown",
      translate(locale, "bootstrap.sessionLoadFailed"),
    );
  }

  return { ok: true, data: { workspace: ws } };
}

export async function localListClasses(workspaceId: string) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    label_color: string | null;
    is_active: number;
    created_at: string;
    active_student_count: number;
  }>(
    `SELECT c.id, c.name, c.label_color, c.is_active, c.created_at,
            (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id AND s.is_active = 1) AS active_student_count
     FROM classes c
     WHERE c.workspace_id = ? AND c.is_active = 1
     ORDER BY c.name ASC`,
    workspaceId,
  );

  const classes: GuruClass[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    labelColor: c.label_color,
    isActive: Boolean(c.is_active),
    activeStudentCount: c.active_student_count,
    createdAt: c.created_at,
  }));

  return { ok: true as const, data: { classes } };
}

export async function localCreateClass(
  workspaceId: string,
  name: string,
  labelColor: string,
  teachingSlots: TeachingSlotDraft[] = [],
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const dup = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM classes WHERE workspace_id = ? AND name = ? AND is_active = 1`,
    workspaceId,
    name.trim(),
  );
  if (dup) return fail("duplicate", "Nama kelas sudah ada.");

  const subscribed = await isCloudSubscriptionActive();
  const limits = getGuruLimitsForMode(subscribed ? "cloud" : "local");
  const classCountRow = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM classes WHERE workspace_id = ? AND is_active = 1`,
    workspaceId,
  );
  const classCount = classCountRow?.n ?? 0;
  if (!canAddClassInWorkspace(classCount, limits)) {
    const locale = await getAppLocale();
    return fail(
      "limit",
      translate(locale, "local.classLimitBody", { max: limits.maxClasses }),
    );
  }

  const classId = newId();
  const createdAt = nowIso();

  const ws = await db.getFirstAsync<{ attendance_mode: string }>(
    `SELECT attendance_mode FROM workspaces WHERE id = ?`,
    workspaceId,
  );
  const mode = ws?.attendance_mode ?? "class";

  await db.runAsync(
    `INSERT INTO classes (id, workspace_id, name, label_color, is_active, created_at)
     VALUES (?, ?, ?, ?, 1, ?)`,
    classId,
    workspaceId,
    name.trim(),
    labelColor,
    createdAt,
  );
  if (teachingSlots.length) {
    await replaceTeachingSlots(db, workspaceId, classId, null, teachingSlots);
  }
  if (mode === "class") {
    await db.runAsync(
      `INSERT INTO assignments (id, workspace_id, class_id, user_id, subject_name, label_color, created_at)
       VALUES (?, ?, ?, ?, NULL, NULL, ?)`,
      newId(),
      workspaceId,
      classId,
      userId,
      createdAt,
    );
  }

  return {
    ok: true as const,
    data: {
      class: {
        id: classId,
        name: name.trim(),
        labelColor,
        isActive: true,
        activeStudentCount: 0,
        createdAt,
      },
    },
  };
}

export async function localUpdateClass(
  workspaceId: string,
  classId: string,
  name: string,
  labelColor: string,
  teachingSlots?: TeachingSlotDraft[],
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const result = await db.runAsync(
    `UPDATE classes SET name = ?, label_color = ? WHERE id = ? AND workspace_id = ? AND is_active = 1`,
    name.trim(),
    labelColor,
    classId,
    workspaceId,
  );
  if (!result.changes) return fail("not_found", "Kelas tidak ditemukan.");

  if (teachingSlots) {
    await replaceTeachingSlots(db, workspaceId, classId, null, teachingSlots);
  }

  const row = await db.getFirstAsync<{
    id: string;
    name: string;
    label_color: string | null;
    is_active: number;
    created_at: string;
  }>(
    `SELECT id, name, label_color, is_active, created_at FROM classes WHERE id = ?`,
    classId,
  );

  const countRow = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM students WHERE class_id = ? AND is_active = 1`,
    classId,
  );

  return {
    ok: true as const,
    data: {
      class: {
        id: row!.id,
        name: row!.name,
        labelColor: row!.label_color,
        isActive: Boolean(row!.is_active),
        activeStudentCount: countRow?.n ?? 0,
        createdAt: row!.created_at,
      },
    },
  };
}

export async function localDeleteClass(workspaceId: string, classId: string) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  await db.runAsync(
    `UPDATE students SET is_active = 0
     WHERE workspace_id = ? AND class_id = ? AND is_active = 1`,
    workspaceId,
    classId,
  );
  const result = await db.runAsync(
    `UPDATE classes SET is_active = 0 WHERE id = ? AND workspace_id = ?`,
    classId,
    workspaceId,
  );
  if (!result.changes) return fail("not_found", "Kelas tidak ditemukan.");
  return { ok: true as const, data: { ok: true } };
}

export async function localListStudents(workspaceId: string, classId: string) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const rows = await db.getAllAsync<{
    id: string;
    class_id: string;
    full_name: string;
    student_number: string | null;
    is_active: number;
    created_at: string;
  }>(
    `SELECT id, class_id, full_name, student_number, is_active, created_at
     FROM students
     WHERE workspace_id = ? AND class_id = ? AND is_active = 1
     ORDER BY full_name ASC`,
    workspaceId,
    classId,
  );

  const students: GuruStudent[] = rows.map((s) => ({
    id: s.id,
    classId: s.class_id,
    fullName: s.full_name,
    studentNumber: s.student_number,
    isActive: Boolean(s.is_active),
    createdAt: s.created_at,
  }));

  return { ok: true as const, data: { students } };
}

export async function localCreateStudent(
  workspaceId: string,
  classId: string,
  input: { fullName: string; studentNumber?: string },
) {
  const userId = await requireUserId();
  const usage = await computeQuotaUsage(userId);
  const subscribed = await isCloudSubscriptionActive();
  const limits = getGuruLimitsForMode(subscribed ? "cloud" : "local");
  if (
    !isQuotaUnlimited(limits.maxActiveStudents) &&
    usage.activeStudentCount >= limits.maxActiveStudents
  ) {
    const locale = await getAppLocale();
    return fail(
      "limit",
      translate(locale, "student.quotaAtMax", {
        max: limits.maxActiveStudents,
      }),
    );
  }

  const st: GuruStudent = {
    id: newId(),
    classId,
    fullName: input.fullName.trim(),
    studentNumber: input.studentNumber?.trim() || null,
    isActive: true,
    createdAt: nowIso(),
  };

  const db = await getLocalDb(userId);
  await db.runAsync(
    `INSERT INTO students (id, workspace_id, class_id, full_name, student_number, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, 1, ?)`,
    st.id,
    workspaceId,
    classId,
    st.fullName,
    st.studentNumber,
    st.createdAt,
  );

  return { ok: true as const, data: { student: st } };
}

export async function localUpdateStudent(
  workspaceId: string,
  classId: string,
  studentId: string,
  input: { fullName: string; studentNumber?: string },
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const result = await db.runAsync(
    `UPDATE students SET full_name = ?, student_number = ?
     WHERE id = ? AND class_id = ? AND workspace_id = ? AND is_active = 1`,
    input.fullName.trim(),
    input.studentNumber?.trim() || null,
    studentId,
    classId,
    workspaceId,
  );
  if (!result.changes) return fail("not_found", "Siswa tidak ditemukan.");

  const row = await db.getFirstAsync<{
    id: string;
    class_id: string;
    full_name: string;
    student_number: string | null;
    is_active: number;
    created_at: string;
  }>(`SELECT * FROM students WHERE id = ?`, studentId);

  return {
    ok: true as const,
    data: {
      student: {
        id: row!.id,
        classId: row!.class_id,
        fullName: row!.full_name,
        studentNumber: row!.student_number,
        isActive: Boolean(row!.is_active),
        createdAt: row!.created_at,
      },
    },
  };
}

export async function localDeleteStudent(
  workspaceId: string,
  classId: string,
  studentId: string,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const result = await db.runAsync(
    `UPDATE students SET is_active = 0 WHERE id = ? AND class_id = ? AND workspace_id = ?`,
    studentId,
    classId,
    workspaceId,
  );
  if (!result.changes) return fail("not_found", "Siswa tidak ditemukan.");
  return { ok: true as const, data: { ok: true } };
}

export async function localListAssignments(
  workspaceId: string,
  classId: string,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const rows = await db.getAllAsync<{
    id: string;
    class_id: string;
    subject_name: string | null;
    label_color: string | null;
    created_at: string;
  }>(
    `SELECT id, class_id, subject_name, label_color, created_at FROM assignments
     WHERE workspace_id = ? AND class_id = ?
     ORDER BY created_at ASC`,
    workspaceId,
    classId,
  );

  const assignments: GuruAssignment[] = rows.map((a) => ({
    id: a.id,
    classId: a.class_id,
    subjectName: a.subject_name,
    label: assignmentLabel(a.subject_name),
    labelColor: a.label_color,
    createdAt: a.created_at,
  }));

  return { ok: true as const, data: { assignments } };
}

export async function localCreateSubjectAssignment(
  workspaceId: string,
  classId: string,
  subjectName: string,
  labelColor: string,
  teachingSlots: TeachingSlotDraft[] = [],
) {
  const userId = await requireUserId();
  const trimmed = subjectName.trim();
  const db = await getLocalDb(userId);
  const dup = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM assignments
     WHERE workspace_id = ? AND class_id = ? AND LOWER(subject_name) = LOWER(?)`,
    workspaceId,
    classId,
    trimmed,
  );
  if (dup) return fail("duplicate", "Mata pelajaran sudah ada.");

  const a = {
    id: newId(),
    classId,
    subjectName: trimmed,
    labelColor,
    createdAt: nowIso(),
  };

  await db.runAsync(
    `INSERT INTO assignments (id, workspace_id, class_id, user_id, subject_name, label_color, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    a.id,
    workspaceId,
    classId,
    userId,
    a.subjectName,
    a.labelColor,
    a.createdAt,
  );
  if (teachingSlots.length) {
    await replaceTeachingSlots(
      db,
      workspaceId,
      classId,
      a.subjectName,
      teachingSlots,
    );
  }

  return {
    ok: true as const,
    data: {
      assignment: {
        id: a.id,
        classId: a.classId,
        subjectName: a.subjectName,
        label: assignmentLabel(a.subjectName),
        labelColor: a.labelColor,
        createdAt: a.createdAt,
      },
    },
  };
}

export async function localUpdateSubjectAssignment(
  workspaceId: string,
  classId: string,
  assignmentId: string,
  input: { subjectName: string; labelColor: string },
  teachingSlots?: TeachingSlotDraft[],
) {
  const trimmed = input.subjectName.trim();
  if (!trimmed) return fail("validation", "Nama mata pelajaran wajib diisi.");

  const userId = await requireUserId();
  const db = await getLocalDb(userId);

  const row = await db.getFirstAsync<{
    id: string;
    subject_name: string;
    label_color: string | null;
    created_at: string;
  }>(
    `SELECT id, subject_name, label_color, created_at FROM assignments
     WHERE id = ? AND workspace_id = ? AND class_id = ? AND subject_name IS NOT NULL`,
    assignmentId,
    workspaceId,
    classId,
  );
  if (!row) return fail("not_found", "Mata pelajaran tidak ditemukan.");

  const dup = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM assignments
     WHERE workspace_id = ? AND class_id = ? AND LOWER(subject_name) = LOWER(?)
       AND id != ?`,
    workspaceId,
    classId,
    trimmed,
    assignmentId,
  );
  if (dup) return fail("duplicate", "Mata pelajaran sudah ada.");

  const oldName = row.subject_name;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE assignments SET subject_name = ?, label_color = ? WHERE id = ?`,
      trimmed,
      input.labelColor,
      assignmentId,
    );
    if (oldName !== trimmed) {
      await db.runAsync(
        `UPDATE attendance_sessions SET subject_name = ?
         WHERE workspace_id = ? AND class_id = ? AND subject_name = ?`,
        trimmed,
        workspaceId,
        classId,
        oldName,
      );
      await db.runAsync(
        `UPDATE teaching_slots SET subject_name = ?
         WHERE workspace_id = ? AND class_id = ? AND subject_name = ?`,
        trimmed,
        workspaceId,
        classId,
        oldName,
      );
    }
    if (teachingSlots) {
      await replaceTeachingSlots(
        db,
        workspaceId,
        classId,
        trimmed,
        teachingSlots,
      );
    }
  });

  return {
    ok: true as const,
    data: {
      assignment: {
        id: row.id,
        classId,
        subjectName: trimmed,
        label: assignmentLabel(trimmed),
        labelColor: input.labelColor,
        createdAt: row.created_at,
      },
    },
  };
}

export async function localDeleteAssignment(
  workspaceId: string,
  classId: string,
  assignmentId: string,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const result = await db.runAsync(
    `DELETE FROM assignments
     WHERE id = ? AND workspace_id = ? AND class_id = ? AND subject_name IS NOT NULL`,
    assignmentId,
    workspaceId,
    classId,
  );
  if (!result.changes)
    return fail("not_found", "Mata pelajaran tidak ditemukan.");
  return { ok: true as const, data: { ok: true } };
}

async function findSessionRow(
  db: Awaited<ReturnType<typeof getLocalDb>>,
  workspaceId: string,
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  const subject = resolveSubject(subjectName);
  return db.getFirstAsync<{
    id: string;
    class_id: string;
    session_date: string;
    subject_name: string | null;
    submitted_at: string | null;
  }>(
    `SELECT id, class_id, session_date, subject_name, submitted_at
     FROM attendance_sessions
     WHERE workspace_id = ? AND class_id = ? AND session_date = ?
       AND COALESCE(subject_name, '') = COALESCE(?, '')`,
    workspaceId,
    classId,
    sessionDate,
    subject,
  );
}

export async function localGetAttendance(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const students = await db.getAllAsync<{
    id: string;
    full_name: string;
    student_number: string | null;
  }>(
    `SELECT id, full_name, student_number FROM students
     WHERE workspace_id = ? AND class_id = ? AND is_active = 1
     ORDER BY full_name ASC`,
    workspaceId,
    classId,
  );

  const session = await findSessionRow(
    db,
    workspaceId,
    classId,
    sessionDate,
    subjectName,
  );

  const recordMap = new Map<
    string,
    { status: GuruAttendanceStatus; note: string | null }
  >();
  if (session) {
    const recs = await db.getAllAsync<{
      student_id: string;
      status: GuruAttendanceStatus;
      note: string | null;
    }>(
      `SELECT student_id, status, note FROM attendance_records WHERE session_id = ?`,
      session.id,
    );
    for (const r of recs) {
      recordMap.set(r.student_id, { status: r.status, note: r.note });
    }
  }

  const rows: GuruAttendanceStudent[] = students.map((s) => {
    const rec = recordMap.get(s.id);
    return {
      studentId: s.id,
      fullName: s.full_name,
      studentNumber: s.student_number,
      status: rec?.status ?? "alpha",
      note: rec?.note ?? null,
    };
  });

  return {
    ok: true as const,
    data: {
      attendance: {
        session: session
          ? {
              id: session.id,
              classId: session.class_id,
              sessionDate: session.session_date,
              subjectName: session.subject_name,
              submittedAt: session.submitted_at,
            }
          : null,
        sessionDate,
        students: rows,
      } satisfies GuruAttendanceData,
    },
  };
}

async function getOrCreateSession(
  db: Awaited<ReturnType<typeof getLocalDb>>,
  workspaceId: string,
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  let session = await findSessionRow(
    db,
    workspaceId,
    classId,
    sessionDate,
    subjectName,
  );
  if (!session) {
    const id = newId();
    const subject = resolveSubject(subjectName);
    const createdAt = nowIso();
    await db.runAsync(
      `INSERT INTO attendance_sessions (id, workspace_id, class_id, session_date, subject_name, submitted_at, created_at)
       VALUES (?, ?, ?, ?, ?, NULL, ?)`,
      id,
      workspaceId,
      classId,
      sessionDate,
      subject,
      createdAt,
    );
    session = {
      id,
      class_id: classId,
      session_date: sessionDate,
      subject_name: subject,
      submitted_at: null,
    };
  }
  return session;
}

export async function localSaveAttendance(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  records: {
    studentId: string;
    status: GuruAttendanceStatus;
    note?: string;
  }[],
  subjectName?: string | null,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const session = await getOrCreateSession(
    db,
    workspaceId,
    classId,
    sessionDate,
    subjectName,
  );

  await db.withTransactionAsync(async () => {
    for (const r of records) {
      const existing = await db.getFirstAsync<{ id: string }>(
        `SELECT id FROM attendance_records WHERE session_id = ? AND student_id = ?`,
        session.id,
        r.studentId,
      );
      if (existing) {
        await db.runAsync(
          `UPDATE attendance_records SET status = ?, note = ? WHERE id = ?`,
          r.status,
          r.note ?? null,
          existing.id,
        );
      } else {
        await db.runAsync(
          `INSERT INTO attendance_records (id, session_id, student_id, status, note)
           VALUES (?, ?, ?, ?, ?)`,
          newId(),
          session.id,
          r.studentId,
          r.status,
          r.note ?? null,
        );
      }
    }
  });

  return localGetAttendance(workspaceId, classId, sessionDate, subjectName);
}

export async function localSubmitAttendance(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const session = await findSessionRow(
    db,
    workspaceId,
    classId,
    sessionDate,
    subjectName,
  );
  if (!session) return fail("not_found", "Simpan absensi dulu.");

  await db.runAsync(
    `UPDATE attendance_sessions SET submitted_at = ? WHERE id = ?`,
    nowIso(),
    session.id,
  );

  return localGetAttendance(workspaceId, classId, sessionDate, subjectName);
}

function mapGradeTaskRow(r: {
  id: string;
  class_id: string;
  subject_name: string | null;
  task_date: string;
  title: string;
  sort_order: number;
  created_at: string;
}): GuruGradeTask {
  return {
    id: r.id,
    classId: r.class_id,
    subjectName: r.subject_name,
    taskDate: r.task_date,
    title: r.title,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  };
}

export async function localGetGradeDay(
  workspaceId: string,
  classId: string,
  taskDate: string,
  subjectName?: string | null,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const subject = resolveSubject(subjectName);

  const students = await db.getAllAsync<{
    id: string;
    full_name: string;
    student_number: string | null;
  }>(
    `SELECT id, full_name, student_number FROM students
     WHERE workspace_id = ? AND class_id = ? AND is_active = 1
     ORDER BY full_name ASC`,
    workspaceId,
    classId,
  );

  const taskRows = await db.getAllAsync<{
    id: string;
    class_id: string;
    subject_name: string | null;
    task_date: string;
    title: string;
    sort_order: number;
    created_at: string;
  }>(
    `SELECT id, class_id, subject_name, task_date, title, sort_order, created_at
     FROM grade_tasks
     WHERE workspace_id = ? AND class_id = ? AND task_date = ?
       AND COALESCE(subject_name, '') = COALESCE(?, '')
     ORDER BY sort_order ASC, created_at ASC`,
    workspaceId,
    classId,
    taskDate,
    subject,
  );

  const tasks = taskRows.map(mapGradeTaskRow);
  const scoreMap = new Map<string, Map<string, string | null>>();

  if (tasks.length) {
    const placeholders = tasks.map(() => "?").join(",");
    const scores = await db.getAllAsync<{
      task_id: string;
      student_id: string;
      score: string | null;
    }>(
      `SELECT task_id, student_id, score FROM grade_scores
       WHERE task_id IN (${placeholders})`,
      ...tasks.map((t) => t.id),
    );
    for (const s of scores) {
      if (!scoreMap.has(s.student_id)) scoreMap.set(s.student_id, new Map());
      scoreMap.get(s.student_id)!.set(s.task_id, s.score);
    }
  }

  const studentRows = students.map((s) => {
    const byTask = scoreMap.get(s.id) ?? new Map<string, string | null>();
    const scores: Record<string, string | null> = {};
    for (const task of tasks) {
      scores[task.id] = byTask.get(task.id) ?? null;
    }
    return {
      studentId: s.id,
      fullName: s.full_name,
      studentNumber: s.student_number,
      scores,
    };
  });

  return {
    ok: true as const,
    data: {
      gradeDay: {
        taskDate,
        tasks,
        students: studentRows,
      } satisfies GuruGradeDayData,
    },
  };
}

export async function localCreateGradeTask(
  workspaceId: string,
  classId: string,
  taskDate: string,
  subjectName?: string | null,
  title?: string,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const subject = resolveSubject(subjectName);
  const maxRow = await db.getFirstAsync<{ n: number }>(
    `SELECT COALESCE(MAX(sort_order), -1) AS n FROM grade_tasks
     WHERE workspace_id = ? AND class_id = ? AND task_date = ?
       AND COALESCE(subject_name, '') = COALESCE(?, '')`,
    workspaceId,
    classId,
    taskDate,
    subject,
  );
  const sortOrder = (maxRow?.n ?? -1) + 1;
  const id = newId();
  const createdAt = nowIso();
  const taskTitle = title?.trim() || `Tugas ${sortOrder + 1}`;

  await db.runAsync(
    `INSERT INTO grade_tasks
     (id, workspace_id, class_id, subject_name, task_date, title, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    workspaceId,
    classId,
    subject,
    taskDate,
    taskTitle,
    sortOrder,
    createdAt,
  );

  return {
    ok: true as const,
    data: {
      task: {
        id,
        classId,
        subjectName: subject,
        taskDate,
        title: taskTitle,
        sortOrder,
        createdAt,
      },
    },
  };
}

export async function localSaveGradeTask(
  workspaceId: string,
  classId: string,
  taskId: string,
  input: {
    title: string;
    scores: { studentId: string; score?: string | null }[];
  },
) {
  const trimmedTitle = input.title.trim();
  if (!trimmedTitle) return fail("validation", "Judul tugas wajib diisi.");

  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const task = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM grade_tasks
     WHERE id = ? AND workspace_id = ? AND class_id = ?`,
    taskId,
    workspaceId,
    classId,
  );
  if (!task) return fail("not_found", "Tugas tidak ditemukan.");

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE grade_tasks SET title = ? WHERE id = ?`,
      trimmedTitle,
      taskId,
    );
    const existingRows = await db.getAllAsync<{
      id: string;
      student_id: string;
    }>(`SELECT id, student_id FROM grade_scores WHERE task_id = ?`, taskId);
    const existingByStudent = new Map(
      existingRows.map((r) => [r.student_id, r.id]),
    );
    for (const row of input.scores) {
      const score = row.score?.trim() || null;
      const existingId = existingByStudent.get(row.studentId);
      if (existingId) {
        await db.runAsync(
          `UPDATE grade_scores SET score = ? WHERE id = ?`,
          score,
          existingId,
        );
      } else {
        await db.runAsync(
          `INSERT INTO grade_scores (id, task_id, student_id, score)
           VALUES (?, ?, ?, ?)`,
          newId(),
          taskId,
          row.studentId,
          score,
        );
      }
    }
  });

  const row = await db.getFirstAsync<{
    id: string;
    class_id: string;
    subject_name: string | null;
    task_date: string;
    title: string;
    sort_order: number;
    created_at: string;
  }>(
    `SELECT id, class_id, subject_name, task_date, title, sort_order, created_at
     FROM grade_tasks WHERE id = ?`,
    taskId,
  );

  return { ok: true as const, data: { task: mapGradeTaskRow(row!) } };
}

export async function localDeleteGradeTask(
  workspaceId: string,
  classId: string,
  taskId: string,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const result = await db.runAsync(
    `DELETE FROM grade_tasks WHERE id = ? AND workspace_id = ? AND class_id = ?`,
    taskId,
    workspaceId,
    classId,
  );
  if (!result.changes) return fail("not_found", "Tugas tidak ditemukan.");
  return { ok: true as const, data: { ok: true } };
}

async function buildGradePeriodRecap(
  userId: string,
  workspaceId: string,
  classId: string,
  range: { start: string; end: string },
  meta: {
    periodType: "weekly" | "monthly" | "semester";
    periodLabel: string;
    subjectName?: string | null;
  },
): Promise<GuruGradePeriodRecap> {
  const db = await getLocalDb(userId);
  const subject = resolveSubject(meta.subjectName);

  const guruClass = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM classes WHERE id = ? AND workspace_id = ?`,
    classId,
    workspaceId,
  );

  const students = await db.getAllAsync<{
    id: string;
    full_name: string;
    student_number: string | null;
  }>(
    `SELECT id, full_name, student_number FROM students
     WHERE workspace_id = ? AND class_id = ? AND is_active = 1
     ORDER BY full_name ASC`,
    workspaceId,
    classId,
  );

  const taskRows = await db.getAllAsync<{
    id: string;
    title: string;
    task_date: string;
  }>(
    `SELECT id, title, task_date FROM grade_tasks
     WHERE workspace_id = ? AND class_id = ?
       AND task_date >= ? AND task_date <= ?
       AND COALESCE(subject_name, '') = COALESCE(?, '')
     ORDER BY task_date ASC, sort_order ASC, created_at ASC`,
    workspaceId,
    classId,
    range.start,
    range.end,
    subject,
  );

  const tasks: GuruGradeTaskRecap[] = taskRows.map((t) => ({
    taskId: t.id,
    title: t.title,
    taskDate: t.task_date,
  }));

  let scoreRows: {
    task_id: string;
    student_id: string;
    score: string | null;
  }[] = [];
  if (taskRows.length) {
    const placeholders = taskRows.map(() => "?").join(",");
    scoreRows = await db.getAllAsync<{
      task_id: string;
      student_id: string;
      score: string | null;
    }>(
      `SELECT task_id, student_id, score FROM grade_scores
       WHERE task_id IN (${placeholders})`,
      ...taskRows.map((t) => t.id),
    );
  }

  const scoreByStudent = new Map<string, Record<string, string | null>>();
  for (const s of students) {
    const scores: Record<string, string | null> = {};
    for (const task of tasks) scores[task.taskId] = null;
    scoreByStudent.set(s.id, scores);
  }
  for (const row of scoreRows) {
    const bucket = scoreByStudent.get(row.student_id);
    if (bucket) bucket[row.task_id] = row.score;
  }

  const studentRecaps: GuruGradeStudentRecap[] = students.map((s) => ({
    studentId: s.id,
    fullName: s.full_name,
    studentNumber: s.student_number,
    scores: scoreByStudent.get(s.id) ?? {},
  }));

  return {
    periodType: meta.periodType,
    classId,
    className: guruClass?.name ?? "Kelas",
    periodLabel: meta.periodLabel,
    startDate: range.start,
    endDate: range.end,
    subjectName: subject,
    tasks,
    students: studentRecaps,
  };
}

export async function localGradeWeeklyRecap(
  workspaceId: string,
  classId: string,
  weekDate: string,
  subjectName?: string | null,
) {
  const { start, end, weekNumber } = getGuruWeekRange(weekDate);
  const userId = await requireUserId();
  const recap = await buildGradePeriodRecap(
    userId,
    workspaceId,
    classId,
    { start, end },
    {
      periodType: "weekly",
      periodLabel: `Minggu ${weekNumber} (${start} – ${end})`,
      subjectName,
    },
  );
  return { ok: true as const, data: { recap } };
}

export async function localGradeMonthlyRecap(
  workspaceId: string,
  classId: string,
  month: string,
  subjectName?: string | null,
) {
  const { start, end, monthLabel } = getGuruMonthRange(month);
  const userId = await requireUserId();
  const recap = await buildGradePeriodRecap(
    userId,
    workspaceId,
    classId,
    { start, end },
    {
      periodType: "monthly",
      periodLabel: monthLabel,
      subjectName,
    },
  );
  return { ok: true as const, data: { recap } };
}

export async function localGradeSemesterRecap(
  workspaceId: string,
  classId: string,
  semester: SemesterValue,
  subjectName?: string | null,
) {
  const { start, end } = semesterRange(semester);
  const userId = await requireUserId();
  const recap = await buildGradePeriodRecap(
    userId,
    workspaceId,
    classId,
    { start, end },
    {
      periodType: "semester",
      periodLabel: semesterLabel(semester),
      subjectName,
    },
  );
  return { ok: true as const, data: { recap } };
}

function emptyCounts(): GuruStatusCounts {
  return { hadir: 0, sakit: 0, izin: 0, alpha: 0 };
}

function addStatus(counts: GuruStatusCounts, status: GuruAttendanceStatus) {
  counts[status] += 1;
}

async function buildPeriodRecap(
  userId: string,
  workspaceId: string,
  classId: string,
  range: { start: string; end: string },
  meta: {
    periodType: "weekly" | "monthly" | "semester" | "academicYear";
    periodLabel: string;
    weekNumber?: number;
    subjectName?: string | null;
  },
): Promise<GuruPeriodRecap> {
  const db = await getLocalDb(userId);
  const subject = resolveSubject(meta.subjectName);

  const guruClass = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM classes WHERE id = ?`,
    classId,
  );

  const students = await db.getAllAsync<{
    id: string;
    full_name: string;
    student_number: string | null;
  }>(
    `SELECT id, full_name, student_number FROM students
     WHERE workspace_id = ? AND class_id = ? AND is_active = 1`,
    workspaceId,
    classId,
  );

  const sessions = await db.getAllAsync<{
    id: string;
    session_date: string;
  }>(
    `SELECT id, session_date FROM attendance_sessions
     WHERE workspace_id = ? AND class_id = ?
       AND session_date >= ? AND session_date <= ?
       AND COALESCE(subject_name, '') = COALESCE(?, '')`,
    workspaceId,
    classId,
    range.start,
    range.end,
    subject,
  );

  const sessionIds = sessions.map((s) => s.id);

  let records: {
    session_id: string;
    student_id: string;
    status: GuruAttendanceStatus;
  }[] = [];
  if (sessionIds.length > 0) {
    const placeholders = sessionIds.map(() => "?").join(",");
    records = await db.getAllAsync<{
      session_id: string;
      student_id: string;
      status: GuruAttendanceStatus;
    }>(
      `SELECT session_id, student_id, status FROM attendance_records WHERE session_id IN (${placeholders})`,
      ...sessionIds,
    );
  }

  const sessionIdsWithData = new Set(records.map((r) => r.session_id));
  const daysRecorded = new Set(
    sessions
      .filter((s) => sessionIdsWithData.has(s.id))
      .map((s) => s.session_date),
  ).size;

  const totals = emptyCounts();
  for (const r of records) addStatus(totals, r.status);

  const studentRecaps = students.map((s) => {
    const recs = records.filter((r) => r.student_id === s.id);
    const counts = emptyCounts();
    for (const r of recs) addStatus(counts, r.status);
    const denom = daysRecorded > 0 ? daysRecorded : 0;
    const pctHadir = denom > 0 ? Math.round((counts.hadir / denom) * 100) : 0;
    return {
      studentId: s.id,
      fullName: s.full_name,
      studentNumber: s.student_number,
      counts,
      daysWithRecord: recs.length > 0 ? daysRecorded : 0,
      pctHadir,
    };
  });

  return {
    periodType: meta.periodType,
    classId,
    className: guruClass?.name ?? "Kelas",
    periodLabel: meta.periodLabel,
    startDate: range.start,
    endDate: range.end,
    weekNumber: meta.weekNumber,
    subjectName: subject,
    daysRecorded,
    totalSessions: sessions.length,
    totals,
    students: studentRecaps,
  };
}

export async function localWeeklyRecap(
  workspaceId: string,
  classId: string,
  weekDate: string,
  subjectName?: string | null,
) {
  const { start, end, weekNumber } = getGuruWeekRange(weekDate);
  const subject = resolveSubject(subjectName);
  const userId = await requireUserId();
  const recap = await buildPeriodRecap(
    userId,
    workspaceId,
    classId,
    { start, end },
    {
      periodType: "weekly",
      periodLabel: `Minggu ${weekNumber} (${start} – ${end})`,
      weekNumber,
      subjectName,
    },
  );
  return { ok: true as const, data: { recap } };
}

export async function localMonthlyRecap(
  workspaceId: string,
  classId: string,
  month: string,
  subjectName?: string | null,
) {
  const { start, end, monthLabel } = getGuruMonthRange(month);
  const subject = resolveSubject(subjectName);
  const userId = await requireUserId();
  const recap = await buildPeriodRecap(
    userId,
    workspaceId,
    classId,
    { start, end },
    {
      periodType: "monthly",
      periodLabel: monthLabel,
      subjectName,
    },
  );
  return { ok: true as const, data: { recap } };
}

export async function localSemesterRecap(
  workspaceId: string,
  classId: string,
  semester: SemesterValue,
  subjectName?: string | null,
) {
  const { start, end } = semesterRange(semester);
  const subject = resolveSubject(subjectName);
  const userId = await requireUserId();
  const recap = await buildPeriodRecap(
    userId,
    workspaceId,
    classId,
    { start, end },
    {
      periodType: "semester",
      periodLabel: semesterLabel(semester),
      subjectName,
    },
  );
  return { ok: true as const, data: { recap } };
}

export async function localAcademicYearRecap(
  workspaceId: string,
  classId: string,
  academicYear: AcademicYearValue,
  subjectName?: string | null,
) {
  const { start, end } = academicYearRange(academicYear);
  const subject = resolveSubject(subjectName);
  const userId = await requireUserId();
  const recap = await buildPeriodRecap(
    userId,
    workspaceId,
    classId,
    { start, end },
    {
      periodType: "academicYear",
      periodLabel: academicYearLabel(academicYear),
      subjectName,
    },
  );
  return { ok: true as const, data: { recap } };
}

export async function localGetStudentAttendanceDetail(
  workspaceId: string,
  classId: string,
  studentId: string,
  subjectName?: string | null,
): Promise<
  | {
      ok: true;
      data: { detail: import("@/lib/types").GuruStudentAttendanceDetail };
    }
  | { ok: false; error: ApiError }
> {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);

  const student = await db.getFirstAsync<{
    full_name: string;
    student_number: string | null;
  }>(
    `SELECT full_name, student_number FROM students
     WHERE id = ? AND class_id = ? AND workspace_id = ? AND is_active = 1`,
    studentId,
    classId,
    workspaceId,
  );
  if (!student) return fail("not_found", "Siswa tidak ditemukan.");

  const baseParams = [studentId, workspaceId, classId] as const;
  const rows =
    subjectName === undefined
      ? await db.getAllAsync<{
          session_date: string;
          status: string;
          note: string | null;
          subject_name: string | null;
        }>(
          `SELECT sess.session_date, r.status, r.note, sess.subject_name
           FROM attendance_records r
           INNER JOIN attendance_sessions sess ON sess.id = r.session_id
           WHERE r.student_id = ?
             AND sess.workspace_id = ?
             AND sess.class_id = ?
           ORDER BY sess.session_date DESC
           LIMIT 120`,
          ...baseParams,
        )
      : await db.getAllAsync<{
          session_date: string;
          status: string;
          note: string | null;
          subject_name: string | null;
        }>(
          `SELECT sess.session_date, r.status, r.note, sess.subject_name
           FROM attendance_records r
           INNER JOIN attendance_sessions sess ON sess.id = r.session_id
           WHERE r.student_id = ?
             AND sess.workspace_id = ?
             AND sess.class_id = ?
             AND COALESCE(sess.subject_name, '') = COALESCE(?, '')
           ORDER BY sess.session_date DESC
           LIMIT 120`,
          ...baseParams,
          resolveSubject(subjectName),
        );

  const summary = emptyCounts();
  for (const row of rows) {
    addStatus(summary, row.status as GuruAttendanceStatus);
  }

  return {
    ok: true,
    data: {
      detail: {
        studentId,
        fullName: student.full_name,
        studentNumber: student.student_number,
        summary,
        totalRecords: rows.length,
        records: rows.map((row) => ({
          sessionDate: row.session_date,
          status: row.status as GuruAttendanceStatus,
          note: row.note,
          subjectName: row.subject_name,
        })),
      },
    },
  };
}

export async function localGetStudentGradeDetail(
  workspaceId: string,
  classId: string,
  studentId: string,
  subjectName?: string | null,
): Promise<
  | { ok: true; data: { detail: import("@/lib/types").GuruStudentGradeDetail } }
  | { ok: false; error: ApiError }
> {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);

  const student = await db.getFirstAsync<{
    full_name: string;
    student_number: string | null;
  }>(
    `SELECT full_name, student_number FROM students
     WHERE id = ? AND class_id = ? AND workspace_id = ? AND is_active = 1`,
    studentId,
    classId,
    workspaceId,
  );
  if (!student) return fail("not_found", "Siswa tidak ditemukan.");

  const baseParams = [studentId, workspaceId, classId] as const;
  const rows =
    subjectName === undefined
      ? await db.getAllAsync<{
          task_id: string;
          task_date: string;
          title: string;
          score: string | null;
        }>(
          `SELECT t.id AS task_id, t.task_date, t.title, s.score
           FROM grade_tasks t
           LEFT JOIN grade_scores s ON s.task_id = t.id AND s.student_id = ?
           WHERE t.workspace_id = ? AND t.class_id = ?
           ORDER BY t.task_date DESC, t.sort_order ASC, t.created_at DESC
           LIMIT 120`,
          ...baseParams,
        )
      : await db.getAllAsync<{
          task_id: string;
          task_date: string;
          title: string;
          score: string | null;
        }>(
          `SELECT t.id AS task_id, t.task_date, t.title, s.score
           FROM grade_tasks t
           LEFT JOIN grade_scores s ON s.task_id = t.id AND s.student_id = ?
           WHERE t.workspace_id = ? AND t.class_id = ?
             AND COALESCE(t.subject_name, '') = COALESCE(?, '')
           ORDER BY t.task_date DESC, t.sort_order ASC, t.created_at DESC
           LIMIT 120`,
          ...baseParams,
          resolveSubject(subjectName),
        );

  const scoredTasks = rows.filter((r) => r.score?.trim()).length;

  return {
    ok: true,
    data: {
      detail: {
        studentId,
        fullName: student.full_name,
        studentNumber: student.student_number,
        scoredTasks,
        totalRecords: rows.length,
        records: rows.map((row) => ({
          taskId: row.task_id,
          taskDate: row.task_date,
          title: row.title,
          score: row.score,
        })),
      },
    },
  };
}

export type LocalSyncStudent = {
  id: string;
  workspaceId: string;
  classId: string;
  fullName: string;
  studentNumber: string | null;
};

export type LocalSyncAssignment = {
  workspaceId: string;
  classId: string;
  subjectName: string;
};

export type LocalSyncSession = {
  workspaceId: string;
  classId: string;
  sessionDate: string;
  subjectName: string | null;
  submittedAt: string | null;
  records: {
    studentId: string;
    status: GuruAttendanceStatus;
    note: string | null;
  }[];
};

export type LocalSyncGradeTask = {
  id: string;
  workspaceId: string;
  classId: string;
  subjectName: string | null;
  taskDate: string;
  title: string;
  sortOrder: number;
};

export type LocalSyncGradeScore = {
  taskId: string;
  studentId: string;
  score: string | null;
};

export type LocalSyncSnapshot = {
  schemaVersion?: number;
  workspaces: GuruWorkspace[];
  classes: { workspaceId: string; id: string; name: string }[];
  students: LocalSyncStudent[];
  assignments: LocalSyncAssignment[];
  sessions: LocalSyncSession[];
  gradeTasks?: LocalSyncGradeTask[];
  gradeScores?: LocalSyncGradeScore[];
};

/** Snapshot SQLite untuk sinkron ke Cloud. */
export async function exportLocalSyncSnapshot(): Promise<LocalSyncSnapshot> {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);

  const wsRows = await db.getAllAsync<WorkspaceDbRow>(
    `SELECT * FROM workspaces ORDER BY created_at ASC`,
  );

  const workspaces: GuruWorkspace[] = wsRows.map(mapWorkspaceRow);

  const classRows = await db.getAllAsync<{
    id: string;
    workspace_id: string;
    name: string;
  }>(
    `SELECT id, workspace_id, name FROM classes WHERE is_active = 1 ORDER BY name ASC`,
  );

  const studentRows = await db.getAllAsync<{
    id: string;
    workspace_id: string;
    class_id: string;
    full_name: string;
    student_number: string | null;
  }>(
    `SELECT id, workspace_id, class_id, full_name, student_number
     FROM students WHERE is_active = 1`,
  );

  const assignRows = await db.getAllAsync<{
    workspace_id: string;
    class_id: string;
    subject_name: string | null;
  }>(
    `SELECT workspace_id, class_id, subject_name FROM assignments
     WHERE subject_name IS NOT NULL`,
  );

  const sessionRows = await db.getAllAsync<{
    id: string;
    workspace_id: string;
    class_id: string;
    session_date: string;
    subject_name: string | null;
    submitted_at: string | null;
  }>(`SELECT * FROM attendance_sessions ORDER BY session_date ASC`);

  const sessions: LocalSyncSession[] = [];
  for (const s of sessionRows) {
    const recs = await db.getAllAsync<{
      student_id: string;
      status: string;
      note: string | null;
    }>(
      `SELECT student_id, status, note FROM attendance_records WHERE session_id = ?`,
      s.id,
    );
    if (recs.length === 0) continue;
    sessions.push({
      workspaceId: s.workspace_id,
      classId: s.class_id,
      sessionDate: s.session_date,
      subjectName: s.subject_name,
      submittedAt: s.submitted_at,
      records: recs.map((r) => ({
        studentId: r.student_id,
        status: r.status as GuruAttendanceStatus,
        note: r.note,
      })),
    });
  }

  const gradeTaskRows = await db.getAllAsync<{
    id: string;
    workspace_id: string;
    class_id: string;
    subject_name: string | null;
    task_date: string;
    title: string;
    sort_order: number;
  }>(`SELECT id, workspace_id, class_id, subject_name, task_date, title, sort_order
      FROM grade_tasks ORDER BY task_date ASC, sort_order ASC`);

  const gradeScoreRows = await db.getAllAsync<{
    task_id: string;
    student_id: string;
    score: string | null;
  }>(`SELECT task_id, student_id, score FROM grade_scores`);

  return {
    schemaVersion: 1,
    workspaces,
    classes: classRows.map((c) => ({
      workspaceId: c.workspace_id,
      id: c.id,
      name: c.name,
    })),
    students: studentRows.map((s) => ({
      id: s.id,
      workspaceId: s.workspace_id,
      classId: s.class_id,
      fullName: s.full_name,
      studentNumber: s.student_number,
    })),
    assignments: assignRows.map((a) => ({
      workspaceId: a.workspace_id,
      classId: a.class_id,
      subjectName: a.subject_name!,
    })),
    sessions,
    gradeTasks: gradeTaskRows.map((t) => ({
      id: t.id,
      workspaceId: t.workspace_id,
      classId: t.class_id,
      subjectName: t.subject_name,
      taskDate: t.task_date,
      title: t.title,
      sortOrder: t.sort_order,
    })),
    gradeScores: gradeScoreRows.map((s) => ({
      taskId: s.task_id,
      studentId: s.student_id,
      score: s.score,
    })),
  };
}

/** Impor snapshot cloud ke SQLite (ganti data lokal). */
export async function importLocalSyncSnapshot(
  snapshot: LocalSyncSnapshot,
): Promise<{ ok: true } | { ok: false; error: ApiError }> {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);

  try {
    await db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM attendance_records`);
      await db.runAsync(`DELETE FROM attendance_sessions`);
      await db.runAsync(`DELETE FROM grade_scores`);
      await db.runAsync(`DELETE FROM grade_tasks`);
      await db.runAsync(`DELETE FROM assignments`);
      await db.runAsync(`DELETE FROM students`);
      await db.runAsync(`DELETE FROM classes`);
      await db.runAsync(`DELETE FROM workspaces`);

      for (const ws of snapshot.workspaces) {
        await db.runAsync(
          `INSERT INTO workspaces (
             id, name, city, npsn, province, address, school_level,
             contact_name, contact_phone, contact_email,
             identity_key, attendance_mode, created_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ws.id,
          ws.name,
          ws.city,
          ws.npsn,
          ws.province,
          ws.address,
          ws.schoolLevel,
          ws.contactName,
          ws.contactPhone,
          ws.contactEmail,
          ws.identityKey,
          ws.attendanceMode,
          ws.createdAt,
        );
      }

      const classModeByWs = new Map(
        snapshot.workspaces.map((w) => [w.id, w.attendanceMode]),
      );

      for (const c of snapshot.classes) {
        await db.runAsync(
          `INSERT INTO classes (id, workspace_id, name, label_color, is_active, created_at)
           VALUES (?, ?, ?, NULL, 1, ?)`,
          c.id,
          c.workspaceId,
          c.name,
          nowIso(),
        );

        if (classModeByWs.get(c.workspaceId) === "class") {
          const hasHomeroom = snapshot.assignments.some(
            (a) =>
              a.classId === c.id &&
              a.workspaceId === c.workspaceId &&
              !a.subjectName,
          );
          if (!hasHomeroom) {
            await db.runAsync(
              `INSERT INTO assignments (id, workspace_id, class_id, user_id, subject_name, label_color, created_at)
               VALUES (?, ?, ?, ?, NULL, NULL, ?)`,
              newId(),
              c.workspaceId,
              c.id,
              userId,
              nowIso(),
            );
          }
        }
      }

      for (const s of snapshot.students) {
        await db.runAsync(
          `INSERT INTO students (id, workspace_id, class_id, full_name, student_number, is_active, created_at)
           VALUES (?, ?, ?, ?, ?, 1, ?)`,
          s.id,
          s.workspaceId,
          s.classId,
          s.fullName,
          s.studentNumber,
          nowIso(),
        );
      }

      for (const a of snapshot.assignments) {
        await db.runAsync(
          `INSERT INTO assignments (id, workspace_id, class_id, user_id, subject_name, label_color, created_at)
           VALUES (?, ?, ?, ?, ?, NULL, ?)`,
          newId(),
          a.workspaceId,
          a.classId,
          userId,
          a.subjectName || null,
          nowIso(),
        );
      }

      for (const session of snapshot.sessions) {
        const sessionId = newId();
        await db.runAsync(
          `INSERT INTO attendance_sessions (id, workspace_id, class_id, session_date, subject_name, submitted_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          sessionId,
          session.workspaceId,
          session.classId,
          session.sessionDate,
          session.subjectName,
          session.submittedAt,
          nowIso(),
        );

        for (const r of session.records) {
          await db.runAsync(
            `INSERT INTO attendance_records (id, session_id, student_id, status, note)
             VALUES (?, ?, ?, ?, ?)`,
            newId(),
            sessionId,
            r.studentId,
            r.status,
            r.note,
          );
        }
      }

      for (const task of snapshot.gradeTasks ?? []) {
        await db.runAsync(
          `INSERT INTO grade_tasks
             (id, workspace_id, class_id, subject_name, task_date, title, sort_order, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          task.id,
          task.workspaceId,
          task.classId,
          task.subjectName,
          task.taskDate,
          task.title,
          task.sortOrder,
          nowIso(),
        );
      }

      for (const score of snapshot.gradeScores ?? []) {
        await db.runAsync(
          `INSERT INTO grade_scores (id, task_id, student_id, score)
           VALUES (?, ?, ?, ?)`,
          newId(),
          score.taskId,
          score.studentId,
          score.score,
        );
      }
    });

    return { ok: true };
  } catch (e) {
    const locale = await getAppLocale();
    return fail(
      "import_failed",
      e instanceof Error ? e.message : translate(locale, "cloud.restoreFailed"),
    );
  }
}
