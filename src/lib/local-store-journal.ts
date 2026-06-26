import { getLocalDb } from "@/lib/local-db/connection";
import { supabase } from "@/lib/supabase";
import type { GuruTeachingJournalData, GuruTeachingJournalEntry } from "@/lib/types";
import { newLocalId } from "@/lib/new-id";

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("UNAUTHORIZED");
  return id;
}

function nowIso() {
  return new Date().toISOString();
}

function resolveSubject(subjectName?: string | null): string | null {
  if (subjectName === undefined) return null;
  return subjectName?.trim() || null;
}

function mapJournalRow(row: {
  id: string;
  class_id: string;
  session_date: string;
  subject_name: string | null;
  material: string | null;
  method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}): GuruTeachingJournalEntry {
  return {
    id: row.id,
    classId: row.class_id,
    sessionDate: row.session_date,
    subjectName: row.subject_name,
    material: row.material,
    method: row.method,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function localGetTeachingJournal(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const subject = resolveSubject(subjectName);

  const row = await db.getFirstAsync<{
    id: string;
    class_id: string;
    session_date: string;
    subject_name: string | null;
    material: string | null;
    method: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT id, class_id, session_date, subject_name, material, method, notes, created_at, updated_at
     FROM teaching_journal_entries
     WHERE workspace_id = ? AND class_id = ? AND session_date = ?
       AND COALESCE(subject_name, '') = COALESCE(?, '')`,
    workspaceId,
    classId,
    sessionDate,
    subject,
  );

  const data: GuruTeachingJournalData = {
    sessionDate,
    entry: row ? mapJournalRow(row) : null,
  };

  return { ok: true as const, data: { journal: data } };
}

export async function localSaveTeachingJournal(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  input: {
    material?: string | null;
    method?: string | null;
    notes?: string | null;
  },
  subjectName?: string | null,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const subject = resolveSubject(subjectName);
  const now = nowIso();
  const material = input.material?.trim() || null;
  const method = input.method?.trim() || null;
  const notes = input.notes?.trim() || null;

  const existing = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM teaching_journal_entries
     WHERE workspace_id = ? AND class_id = ? AND session_date = ?
       AND COALESCE(subject_name, '') = COALESCE(?, '')`,
    workspaceId,
    classId,
    sessionDate,
    subject,
  );

  if (existing) {
    await db.runAsync(
      `UPDATE teaching_journal_entries
       SET material = ?, method = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      material,
      method,
      notes,
      now,
      existing.id,
    );
  } else {
    await db.runAsync(
      `INSERT INTO teaching_journal_entries (
         id, workspace_id, class_id, session_date, subject_name,
         material, method, notes, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      newLocalId(),
      workspaceId,
      classId,
      sessionDate,
      subject,
      material,
      method,
      notes,
      now,
      now,
    );
  }

  return localGetTeachingJournal(workspaceId, classId, sessionDate, subjectName);
}

export async function localListTeachingJournalRecap(
  workspaceId: string,
  classId: string,
  params: {
    startDate: string;
    endDate: string;
    periodLabel: string;
    subjectName?: string | null;
  },
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const subject = resolveSubject(params.subjectName);

  const rows = await db.getAllAsync<{
    id: string;
    class_id: string;
    session_date: string;
    subject_name: string | null;
    material: string | null;
    method: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT id, class_id, session_date, subject_name, material, method, notes, created_at, updated_at
     FROM teaching_journal_entries
     WHERE workspace_id = ? AND class_id = ?
       AND session_date >= ? AND session_date <= ?
       AND COALESCE(subject_name, '') = COALESCE(?, '')
       AND (
         TRIM(COALESCE(material, '')) != ''
         OR TRIM(COALESCE(method, '')) != ''
         OR TRIM(COALESCE(notes, '')) != ''
       )
     ORDER BY session_date DESC`,
    workspaceId,
    classId,
    params.startDate,
    params.endDate,
    subject,
  );

  const entries = rows.map(mapJournalRow);

  return {
    ok: true as const,
    data: {
      recap: {
        periodLabel: params.periodLabel,
        startDate: params.startDate,
        endDate: params.endDate,
        subjectName: params.subjectName ?? null,
        totalSessions: entries.length,
        entries,
      },
    },
  };
}
