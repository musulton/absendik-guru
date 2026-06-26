import { getLocalDb } from "@/lib/local-db/connection";
import { supabase } from "@/lib/supabase";
import {
  isStudentNotePresetKey,
  normalizeStudentNoteCategory,
  presetCategory,
  VALID_STUDENT_NOTE_CATEGORIES,
} from "@/lib/student-note-presets";
import type { GuruStudentNote, GuruStudentNoteCategory } from "@/lib/types";
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

function normalizeCategory(raw: string): GuruStudentNoteCategory | null {
  const category = normalizeStudentNoteCategory(raw);
  return VALID_STUDENT_NOTE_CATEGORIES.includes(category) ? category : null;
}

function mapNoteRow(row: {
  id: string;
  class_id: string;
  student_id: string;
  category: string;
  preset_key: string | null;
  note_text: string;
  note_date: string | null;
  created_at: string;
}): GuruStudentNote {
  return {
    id: row.id,
    classId: row.class_id,
    studentId: row.student_id,
    category: normalizeStudentNoteCategory(row.category),
    presetKey: row.preset_key,
    noteText: row.note_text,
    noteDate: row.note_date ?? row.created_at.slice(0, 10),
    createdAt: row.created_at,
  };
}

export async function localListStudentNotes(
  workspaceId: string,
  classId: string,
  studentId: string,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const rows = await db.getAllAsync<{
    id: string;
    class_id: string;
    student_id: string;
    category: string;
    preset_key: string | null;
    note_text: string;
    note_date: string | null;
    created_at: string;
  }>(
    `SELECT id, class_id, student_id, category, preset_key, note_text, note_date, created_at
     FROM student_notes
     WHERE workspace_id = ? AND class_id = ? AND student_id = ?
     ORDER BY note_date DESC, created_at DESC`,
    workspaceId,
    classId,
    studentId,
  );

  return {
    ok: true as const,
    data: { notes: rows.map(mapNoteRow) },
  };
}

export async function localCreateStudentNote(
  workspaceId: string,
  classId: string,
  studentId: string,
  input: {
    category: GuruStudentNoteCategory;
    presetKey?: string | null;
    noteText: string;
    noteDate: string;
  },
) {
  const category = normalizeCategory(input.category);
  const noteDate = input.noteDate.trim();
  const presetKey = input.presetKey?.trim() || null;
  const noteText = input.noteText.trim();

  if (!category) {
    return {
      ok: false as const,
      error: { code: "invalid", message: "Kategori catatan tidak valid." },
    };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(noteDate)) {
    return {
      ok: false as const,
      error: { code: "invalid", message: "Tanggal catatan tidak valid." },
    };
  }

  if (category === "other") {
    if (!noteText) {
      return {
        ok: false as const,
        error: { code: "invalid", message: "Isi catatan wajib diisi." },
      };
    }
  } else {
    if (!presetKey || !isStudentNotePresetKey(presetKey)) {
      return {
        ok: false as const,
        error: { code: "invalid", message: "Pilih salah satu jenis catatan." },
      };
    }
    if (presetCategory(presetKey) !== category) {
      return {
        ok: false as const,
        error: { code: "invalid", message: "Jenis catatan tidak sesuai kategori." },
      };
    }
  }

  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const note: GuruStudentNote = {
    id: newLocalId(),
    classId,
    studentId,
    category,
    presetKey: category === "other" ? null : presetKey,
    noteText: category === "other" ? noteText : "",
    noteDate,
    createdAt: nowIso(),
  };

  await db.runAsync(
    `INSERT INTO student_notes (id, workspace_id, class_id, student_id, category, preset_key, note_text, note_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    note.id,
    workspaceId,
    classId,
    studentId,
    note.category,
    note.presetKey,
    note.noteText,
    note.noteDate,
    note.createdAt,
  );

  return { ok: true as const, data: { note } };
}

export async function localDeleteStudentNote(
  workspaceId: string,
  classId: string,
  studentId: string,
  noteId: string,
) {
  const userId = await requireUserId();
  const db = await getLocalDb(userId);
  const result = await db.runAsync(
    `DELETE FROM student_notes
     WHERE id = ? AND workspace_id = ? AND class_id = ? AND student_id = ?`,
    noteId,
    workspaceId,
    classId,
    studentId,
  );
  if (!result.changes) {
    return {
      ok: false as const,
      error: { code: "not_found", message: "Catatan tidak ditemukan." },
    };
  }
  return { ok: true as const, data: { ok: true } };
}

export async function localGetStudentNotesDetail(
  workspaceId: string,
  classId: string,
  studentId: string,
) {
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
  if (!student) {
    return {
      ok: false as const,
      error: { code: "not_found", message: "Siswa tidak ditemukan." },
    };
  }

  const listResult = await localListStudentNotes(workspaceId, classId, studentId);
  if (!listResult.ok) return listResult;

  const records = listResult.data.notes.map((note) => ({
    id: note.id,
    noteDate: note.noteDate,
    category: note.category,
    presetKey: note.presetKey,
    noteText: note.noteText,
  }));

  return {
    ok: true as const,
    data: {
      detail: {
        studentId,
        fullName: student.full_name,
        studentNumber: student.student_number,
        totalRecords: records.length,
        records,
      },
    },
  };
}
