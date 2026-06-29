import type { NavigatorScreenParams } from "@react-navigation/native";
import type { GuruAssignment } from "@/lib/types";

export type ClassRouteParams = {
  classId: string;
  className: string;
  labelColor?: string | null;
};

/** True bila guru masuk lewat "Mulai pertemuan" (bukan modul langsung). */
export type SessionFlowRouteParams = {
  sessionFlow?: boolean;
};

export type HomeModule =
  | "attendance"
  | "grades"
  | "teachingJournal"
  | "studentNotes";

export type HomeClassHubParams = {
  classId: string;
  className: string;
  labelColor?: string | null;
  activeStudentCount: number;
};

/** Beranda — modul guru. */
export type HomeStackParamList = {
  HomeHub: undefined;
  ClassModuleHub: HomeClassHubParams;
  SubjectList: ClassRouteParams & {
    module: HomeModule;
  } & SessionFlowRouteParams;
  Attendance: ClassRouteParams & {
    subjectName?: string | null;
    sessionDate?: string;
  } & SessionFlowRouteParams;
  TeachingJournal: ClassRouteParams & {
    subjectName?: string | null;
    sessionDate?: string;
  } & SessionFlowRouteParams;
  ClassStudentsHome: ClassRouteParams & {
    sessionDate?: string;
    subjectName?: string | null;
  } & SessionFlowRouteParams;
  StudentNotes: {
    classId: string;
    className: string;
    studentId: string;
    fullName: string;
    studentNumber: string;
    sessionDate?: string;
    subjectName?: string | null;
    labelColor?: string | null;
  } & SessionFlowRouteParams;
  StudentAttendanceDetail: {
    classId: string;
    className: string;
    studentId: string;
    fullName: string;
    studentNumber: string;
    subjectName?: string | null;
  };
  StudentGradeDetail: {
    classId: string;
    className: string;
    studentId: string;
    fullName: string;
    studentNumber: string;
    subjectName?: string | null;
  };
  ClassRecap: {
    classId: string;
    className: string;
    assignmentsJson: string;
  };
  GradeEntry: ClassRouteParams & {
    subjectName?: string | null;
    sessionDate?: string;
  } & SessionFlowRouteParams;
  ClassGradeRecap: {
    classId: string;
    className: string;
    assignmentsJson: string;
  };
  ClassTeachingJournalRecap: {
    classId: string;
    className: string;
    assignmentsJson: string;
  };
  StudentNotesDetail: {
    classId: string;
    className: string;
    studentId: string;
    fullName: string;
    studentNumber: string;
  };
  CreateStudent: {
    classId: string;
    className: string;
    labelColor?: string | null;
    startSessionAfterCreate?: boolean;
  };
  /** Stack pengelolaan — nested di Home. */
  Manage: NavigatorScreenParams<ManageStackParamList>;
  /** Stack pengaturan — nested di Home. */
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

/** Pengelolaan data kelas, mata pelajaran, siswa. */
export type ManageStackParamList = {
  ManageHub: undefined;
  ClassesManageList: undefined;
  CreateClass: undefined;
  EditClass: { classId: string; className: string };
  ClassPicker: { mode: "subjects" | "students" };
  SubjectManageList: ClassRouteParams;
  CreateSubject: { classId: string; className: string };
  EditSubject: {
    classId: string;
    className: string;
    assignmentId: string;
    subjectName: string;
    labelColor?: string | null;
    classLabelColor?: string | null;
  };
  ClassStudents: { classId: string; className: string; refreshAt?: number };
  CreateStudentManage: { classId: string; className: string };
  EditStudent: {
    classId: string;
    studentId: string;
    fullName: string;
    studentNumber: string;
  };
  GradePredikatSettings: undefined;
  StudentSortSettings: undefined;
};

/** Pengaturan aplikasi. */
export type SettingsStackParamList = {
  SettingsHub: undefined;
  About: undefined;
  OnboardingReplay: undefined;
};

/** @deprecated bottom tab dihapus — gunakan HomeStackParamList */
export type AppTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
};

/** @deprecated gunakan HomeStackParamList */
export type AppStackParamList = HomeStackParamList;

export type RootStackParamList = {
  Onboarding: { replay?: boolean } | undefined;
  WorkspacePicker: { manualPick?: boolean } | undefined;
  LocalArchivePicker: undefined;
  CreateWorkspace: undefined;
  AccountSettings: undefined;
  About: undefined;
  App: NavigatorScreenParams<HomeStackParamList> | undefined;
};

export type GuruAssignmentList = GuruAssignment[];
