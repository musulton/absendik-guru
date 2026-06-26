import type * as SQLite from "expo-sqlite";

async function columnExists(
  db: SQLite.SQLiteDatabase,
  table: string,
  column: string,
): Promise<boolean> {
  const cols = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table})`,
  );
  return cols.some((c) => c.name === column);
}

async function addColumnIfMissing(
  db: SQLite.SQLiteDatabase,
  table: string,
  column: string,
  type: string,
): Promise<void> {
  if (!(await columnExists(db, table, column))) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

/** Migrasi inkremental setelah skema awal. */
export async function migrateLocalDbSchema(
  db: SQLite.SQLiteDatabase,
): Promise<void> {
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM meta WHERE key = 'schema_version'`,
  );
  const version = parseInt(row?.value ?? "1", 10);

  if (version < 2) {
    await addColumnIfMissing(db, "classes", "label_color", "TEXT");
    await addColumnIfMissing(db, "assignments", "label_color", "TEXT");
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '2')`,
    );
  }

  if (version < 3) {
    await addColumnIfMissing(db, "workspaces", "province", "TEXT");
    await addColumnIfMissing(db, "workspaces", "address", "TEXT");
    await addColumnIfMissing(db, "workspaces", "school_level", "TEXT");
    await addColumnIfMissing(db, "workspaces", "contact_name", "TEXT");
    await addColumnIfMissing(db, "workspaces", "contact_phone", "TEXT");
    await addColumnIfMissing(db, "workspaces", "contact_email", "TEXT");
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '3')`,
    );
  }

  if (version < 4) {
    await addColumnIfMissing(db, "attendance_sessions", "grade_label", "TEXT");
    await addColumnIfMissing(db, "attendance_records", "score", "TEXT");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS teaching_slots (
        id TEXT PRIMARY KEY NOT NULL,
        workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        subject_name TEXT,
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_teaching_slots_lookup
        ON teaching_slots(workspace_id, class_id, COALESCE(subject_name, ''));
    `);
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '4')`,
    );
  }

  if (version < 5) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS grade_tasks (
        id TEXT PRIMARY KEY NOT NULL,
        workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        subject_name TEXT,
        task_date TEXT NOT NULL,
        title TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_grade_tasks_lookup
        ON grade_tasks(workspace_id, class_id, task_date, COALESCE(subject_name, ''));
      CREATE TABLE IF NOT EXISTS grade_scores (
        id TEXT PRIMARY KEY NOT NULL,
        task_id TEXT NOT NULL REFERENCES grade_tasks(id) ON DELETE CASCADE,
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        score TEXT,
        UNIQUE(task_id, student_id)
      );
    `);
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '5')`,
    );
  }

  if (version < 6) {
    await addColumnIfMissing(
      db,
      "workspaces",
      "module_attendance_enabled",
      "INTEGER NOT NULL DEFAULT 1",
    );
    await addColumnIfMissing(
      db,
      "workspaces",
      "module_grades_enabled",
      "INTEGER NOT NULL DEFAULT 1",
    );
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '6')`,
    );
  }

  if (version < 7) {
    await addColumnIfMissing(db, "workspaces", "grade_predikat_json", "TEXT");
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '7')`,
    );
  }

  if (version < 8) {
    await addColumnIfMissing(
      db,
      "workspaces",
      "student_sort_mode",
      "TEXT NOT NULL DEFAULT 'name'",
    );
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '8')`,
    );
  }

  if (version < 9) {
    await addColumnIfMissing(
      db,
      "workspaces",
      "module_teaching_journal_enabled",
      "INTEGER NOT NULL DEFAULT 1",
    );
    await addColumnIfMissing(
      db,
      "workspaces",
      "module_student_notes_enabled",
      "INTEGER NOT NULL DEFAULT 1",
    );
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS teaching_journal_entries (
        id TEXT PRIMARY KEY NOT NULL,
        workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        session_date TEXT NOT NULL,
        subject_name TEXT,
        material TEXT,
        method TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_teaching_journal_unique
        ON teaching_journal_entries(
          workspace_id,
          class_id,
          session_date,
          COALESCE(subject_name, '')
        );
      CREATE TABLE IF NOT EXISTS student_notes (
        id TEXT PRIMARY KEY NOT NULL,
        workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        note_text TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_student_notes_lookup
        ON student_notes(workspace_id, class_id, student_id, created_at DESC);
    `);
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '9')`,
    );
  }

  if (version < 10) {
    const cols = await db.getAllAsync<{ name: string }>(
      `PRAGMA table_info(student_notes)`,
    );
    const colNames = new Set(cols.map((col) => col.name));
    if (!colNames.has("preset_key")) {
      await db.execAsync(`ALTER TABLE student_notes ADD COLUMN preset_key TEXT`);
    }
    if (!colNames.has("note_date")) {
      await db.execAsync(`ALTER TABLE student_notes ADD COLUMN note_date TEXT`);
    }
    await db.runAsync(
      `UPDATE student_notes SET note_date = substr(created_at, 1, 10) WHERE note_date IS NULL OR note_date = ''`,
    );
    await db.runAsync(
      `UPDATE student_notes SET category = 'attitude' WHERE category = 'attention'`,
    );
    await db.runAsync(
      `UPDATE student_notes SET category = 'other' WHERE category = 'counseling'`,
    );
    await db.runAsync(
      `INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', '10')`,
    );
  }
}
