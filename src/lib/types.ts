import type { SchoolGradePredikatSettings } from "@/lib/grade-predikat";

export type GuruLimits = {
  maxWorkspaces: number;
  maxClasses: number;
  maxSubjects: number;
  maxActiveStudents: number;
};

export type GuruUsage = {
  workspaceCount: number;
  classCount: number;
  subjectCount: number;
  activeStudentCount: number;
};

export type GuruAccount = {
  id: string;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
};

export type GuruSchoolLevel =
  | "sd"
  | "smp"
  | "sma"
  | "smk"
  | "madrasah"
  | "lainnya";

export type GuruWorkspace = {
  id: string;
  name: string;
  city: string | null;
  npsn: string | null;
  province: string | null;
  address: string | null;
  schoolLevel: GuruSchoolLevel | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  identityKey: string | null;
  attendanceMode: "class" | "subject";
  timezone?: string;
  role: "owner" | "member";
  createdAt: string;
  /** Diisi saat daftar sekolah (picker / ringkasan). */
  classCount?: number;
  subjectCount?: number;
  activeStudentCount?: number;
};

export type GuruStorageMode = "local" | "cloud";

export type GuruProDeviceStatus =
  | { ok: true; deviceId: string }
  | {
      ok: false;
      code: "device_required" | "device_conflict";
      message: string;
      registeredDeviceLabel: string | null;
      registeredAt: string | null;
    };

export type MeResponse = {
  account: GuruAccount;
  storageMode?: GuruStorageMode;
  /** Langganan berbayar aktif di perangkat ini — termasuk cek perangkat terdaftar. */
  cloudSubscriptionActive?: boolean;
  proSubscription?: GuruProSubscriptionStatus;
  proDevice?: GuruProDeviceStatus | null;
  limits: GuruLimits;
  usage: GuruUsage;
  schoolLink?: GuruSchoolLinkResponse;
};

export type SchoolLinkSummary = {
  workspaceId: string;
  schoolId: string;
  schoolName: string;
  attendanceMode: "class" | "subject";
  timezone?: string;
  gradePredikat?: SchoolGradePredikatSettings;
  classCount?: number;
  subjectCount?: number;
  activeStudentCount?: number;
};

export type GuruSchoolLinkStats = {
  classCount: number;
  subjectCount: number;
  activeStudentCount: number;
};

export type GuruSchoolLinkResponse =
  | { linked: false }
  | {
      linked: true;
      workspaceId: string;
      schoolId: string;
      schoolName: string;
      attendanceMode: "class" | "subject";
      timezone?: string;
      gradePredikat?: SchoolGradePredikatSettings;
      classes?: GuruClass[];
      stats?: GuruSchoolLinkStats;
    };

export type GuruProSubscriptionStatus = {
  active: boolean;
  platform: "android" | "ios" | null;
  productId: string | null;
  expiresAt: string | null;
  status: string | null;
};

export type SubscriptionStatusResponse = {
  subscription: GuruProSubscriptionStatus;
  cloudSubscriptionActive: boolean;
  proDevice?: GuruProDeviceStatus | null;
  androidProductId: string;
  billingConfigured: boolean;
};

export type ApiError = {
  code: string;
  message: string;
  registeredDeviceLabel?: string | null;
  registeredAt?: string | null;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export type GuruClass = {
  id: string;
  name: string;
  /** Id palet warna label (lihat label-colors). */
  labelColor: string | null;
  isActive: boolean;
  activeStudentCount: number;
  createdAt: string;
};

export type GuruStudent = {
  id: string;
  classId: string;
  fullName: string;
  studentNumber: string | null;
  isActive: boolean;
  createdAt: string;
};

export type GuruAttendanceStatus = "hadir" | "sakit" | "izin" | "alpha";

export type GuruAttendanceStudent = {
  studentId: string;
  fullName: string;
  studentNumber: string | null;
  status: GuruAttendanceStatus | null;
  note: string | null;
};

export type GuruAttendanceSession = {
  id: string;
  classId: string;
  sessionDate: string;
  subjectName: string | null;
  submittedAt: string | null;
};

export type GuruGradeTask = {
  id: string;
  classId: string;
  subjectName: string | null;
  taskDate: string;
  title: string;
  sortOrder: number;
  createdAt: string;
};

export type GuruGradeStudentRow = {
  studentId: string;
  fullName: string;
  studentNumber: string | null;
  scores: Record<string, string | null>;
};

export type GuruGradeDayData = {
  taskDate: string;
  tasks: GuruGradeTask[];
  students: GuruGradeStudentRow[];
};

export type GuruGradeTaskRecap = {
  taskId: string;
  title: string;
  taskDate: string;
};

export type GuruGradeStudentRecap = {
  studentId: string;
  fullName: string;
  studentNumber: string | null;
  scores: Record<string, string | null>;
};

export type GuruGradePeriodRecap = {
  periodType: "weekly" | "monthly" | "semester";
  classId: string;
  className: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  subjectName: string | null;
  tasks: GuruGradeTaskRecap[];
  students: GuruGradeStudentRecap[];
};

/** ISO weekday: 1 = Senin … 7 = Minggu */
export type GuruTeachingSlot = {
  id: string;
  workspaceId: string;
  classId: string;
  subjectName: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string | null;
  createdAt: string;
};

export type TeachingSlotDraft = {
  id?: string;
  /** ISO weekday 1–7; satu entri bisa beberapa hari dengan jam sama. */
  daysOfWeek: number[];
  startTime: string;
  endTime?: string | null;
};

export type GuruAttendanceData = {
  session: GuruAttendanceSession | null;
  sessionDate: string;
  students: GuruAttendanceStudent[];
};

export type GuruTeachingJournalEntry = {
  id: string;
  classId: string;
  sessionDate: string;
  subjectName: string | null;
  material: string | null;
  method: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GuruTeachingJournalData = {
  sessionDate: string;
  entry: GuruTeachingJournalEntry | null;
};

export type GuruTeachingJournalRecap = {
  periodLabel: string;
  startDate: string;
  endDate: string;
  subjectName?: string | null;
  totalSessions: number;
  entries: GuruTeachingJournalEntry[];
};

export type GuruStudentNoteCategory =
  | "positive"
  | "academic"
  | "attendance"
  | "attitude"
  | "other";

export type GuruStudentNote = {
  id: string;
  classId: string;
  studentId: string;
  category: GuruStudentNoteCategory;
  presetKey?: string | null;
  noteText: string;
  noteDate: string;
  createdAt: string;
};

export type GuruAssignment = {
  id: string;
  classId: string;
  subjectName: string | null;
  /** UUID mata pelajaran sekolah — legacy school-link. */
  subjectId?: string | null;
  label: string;
  labelColor: string | null;
  createdAt: string;
};

export type GuruStatusCounts = {
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
};

export type GuruPeriodStudentRecap = {
  studentId: string;
  fullName: string;
  studentNumber: string | null;
  counts: GuruStatusCounts;
  daysWithRecord: number;
  pctHadir: number;
};

export type GuruPeriodRecap = {
  periodType: "weekly" | "monthly" | "semester" | "academicYear";
  classId: string;
  className: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  weekNumber?: number;
  subjectName: string | null;
  daysRecorded: number;
  totalSessions: number;
  totals: GuruStatusCounts;
  students: GuruPeriodStudentRecap[];
};

/** Alias kompatibilitas */
export type GuruWeeklyRecap = GuruPeriodRecap;
export type GuruWeeklyStudentRecap = GuruPeriodStudentRecap;

export type GuruStudentAttendanceRecord = {
  sessionDate: string;
  status: GuruAttendanceStatus;
  note: string | null;
  subjectName: string | null;
};

export type GuruStudentAttendanceDetail = {
  studentId: string;
  fullName: string;
  studentNumber: string | null;
  summary: GuruStatusCounts;
  totalRecords: number;
  records: GuruStudentAttendanceRecord[];
};

export type GuruStudentGradeRecord = {
  taskId: string;
  taskDate: string;
  title: string;
  score: string | null;
};

export type GuruStudentGradeDetail = {
  studentId: string;
  fullName: string;
  studentNumber: string | null;
  scoredTasks: number;
  totalRecords: number;
  records: GuruStudentGradeRecord[];
};

export type GuruStudentNotesRecord = {
  id: string;
  noteDate: string;
  category: GuruStudentNoteCategory;
  presetKey?: string | null;
  noteText: string;
};

export type GuruStudentNotesDetail = {
  studentId: string;
  fullName: string;
  studentNumber: string | null;
  totalRecords: number;
  records: GuruStudentNotesRecord[];
};
