import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SQLiteDatabase } from "expo-sqlite";

type LegacyDb = {
  workspaces: Array<{
    id: string;
    name: string;
    city: string | null;
    npsn: string | null;
    identityKey: string | null;
    attendanceMode: "class" | "subject";
    role: "owner" | "member";
    createdAt: string;
  }>;
  classes: Array<{
    id: string;
    workspaceId: string;
    name: string;
    isActive: boolean;
    activeStudentCount: number;
    createdAt: string;
  }>;
  students: Array<{
    id: string;
    workspaceId: string;
    classId: string;
    fullName: string;
    studentNumber: string | null;
    isActive: boolean;
    createdAt: string;
  }>;
  assignments: Array<{
    id: string;
    workspaceId: string;
    classId: string;
    userId: string;
    subjectName: string | null;
    createdAt: string;
  }>;
  sessions: Array<{
    id: string;
    workspaceId: string;
    classId: string;
    sessionDate: string;
    subjectName: string | null;
    submittedAt: string | null;
  }>;
  records: Array<{
    id: string;
    sessionId: string;
    studentId: string;
    status: string;
    note: string | null;
  }>;
};

function legacyKey(userId: string) {
  return `guru_local_db_v1_${userId}`;
}

/** Impor sekali dari JSON AsyncStorage (versi lama). */
export async function migrateLegacyAsyncStorageIfNeeded(
  db: SQLiteDatabase,
  userId: string,
): Promise<void> {
  const done = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM meta WHERE key = 'legacy_import_done'`,
  );
  if (done?.value === "1") return;

  const raw = await AsyncStorage.getItem(legacyKey(userId));
  if (!raw) {
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('legacy_import_done', '1')`,
    );
    return;
  }

  const legacy = JSON.parse(raw) as LegacyDb;

  await db.withTransactionAsync(async () => {
    for (const w of legacy.workspaces) {
      await db.runAsync(
        `INSERT OR IGNORE INTO workspaces (id, name, city, npsn, identity_key, attendance_mode, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        w.id,
        w.name,
        w.city,
        w.npsn,
        w.identityKey,
        w.attendanceMode,
        w.createdAt,
      );
    }
    for (const c of legacy.classes) {
      await db.runAsync(
        `INSERT OR IGNORE INTO classes (id, workspace_id, name, is_active, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        c.id,
        c.workspaceId,
        c.name,
        c.isActive ? 1 : 0,
        c.createdAt,
      );
    }
    for (const s of legacy.students) {
      await db.runAsync(
        `INSERT OR IGNORE INTO students (id, workspace_id, class_id, full_name, student_number, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        s.id,
        s.workspaceId,
        s.classId,
        s.fullName,
        s.studentNumber,
        s.isActive ? 1 : 0,
        s.createdAt,
      );
    }
    for (const a of legacy.assignments) {
      await db.runAsync(
        `INSERT OR IGNORE INTO assignments (id, workspace_id, class_id, user_id, subject_name, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        a.id,
        a.workspaceId,
        a.classId,
        a.userId,
        a.subjectName,
        a.createdAt,
      );
    }
    for (const sess of legacy.sessions) {
      await db.runAsync(
        `INSERT OR IGNORE INTO attendance_sessions (id, workspace_id, class_id, session_date, subject_name, submitted_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        sess.id,
        sess.workspaceId,
        sess.classId,
        sess.sessionDate,
        sess.subjectName,
        sess.submittedAt,
        sess.submittedAt ?? "",
      );
    }
    for (const r of legacy.records) {
      await db.runAsync(
        `INSERT OR IGNORE INTO attendance_records (id, session_id, student_id, status, note)
         VALUES (?, ?, ?, ?, ?)`,
        r.id,
        r.sessionId,
        r.studentId,
        r.status,
        r.note,
      );
    }
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('legacy_import_done', '1')`,
    );
  });

  await AsyncStorage.removeItem(legacyKey(userId));
}
