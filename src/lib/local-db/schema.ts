/** Skema SQLite mode perangkat — selaras model Supabase guru_*. */
export const LOCAL_DB_SCHEMA_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  npsn TEXT,
  province TEXT,
  address TEXT,
  school_level TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  identity_key TEXT,
  attendance_mode TEXT NOT NULL DEFAULT 'class',
  module_attendance_enabled INTEGER NOT NULL DEFAULT 1,
  module_grades_enabled INTEGER NOT NULL DEFAULT 1,
  module_teaching_journal_enabled INTEGER NOT NULL DEFAULT 1,
  module_student_notes_enabled INTEGER NOT NULL DEFAULT 1,
  grade_predikat_json TEXT,
  student_sort_mode TEXT NOT NULL DEFAULT 'name',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY NOT NULL,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label_color TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  UNIQUE(workspace_id, name)
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY NOT NULL,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  student_number TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id, is_active);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY NOT NULL,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  subject_name TEXT,
  label_color TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session_date TEXT NOT NULL,
  subject_name TEXT,
  submitted_at TEXT,
  grade_label TEXT,
  created_at TEXT NOT NULL DEFAULT ''
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_session_unique
  ON attendance_sessions(
    workspace_id,
    class_id,
    session_date,
    COALESCE(subject_name, '')
  );

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY NOT NULL,
  session_id TEXT NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  score TEXT,
  UNIQUE(session_id, student_id)
);

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
  preset_key TEXT,
  note_text TEXT NOT NULL,
  note_date TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_student_notes_lookup
  ON student_notes(workspace_id, class_id, student_id, created_at DESC);

CREATE TABLE IF NOT EXISTS grade_scores (
  id TEXT PRIMARY KEY NOT NULL,
  task_id TEXT NOT NULL REFERENCES grade_tasks(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score TEXT,
  UNIQUE(task_id, student_id)
);
`;
