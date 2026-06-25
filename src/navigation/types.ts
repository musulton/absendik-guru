import type { NavigatorScreenParams } from "@react-navigation/native";
import type { GuruAssignment } from "@/lib/types";

export type ClassRouteParams = {
  classId: string;
  className: string;
  labelColor?: string | null;
};

export type HomeModule = "attendance" | "grades";

export type HomeClassHubParams = {
  classId: string;
  className: string;
  labelColor?: string | null;
  activeStudentCount: number;
};

/** Beranda — absensi & penilaian. */
export type HomeStackParamList = {
  HomeHub: undefined;
  ClassModuleHub: HomeClassHubParams;
  SubjectList: ClassRouteParams & { module: HomeModule };
  Attendance: ClassRouteParams & { subjectName?: string | null };
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
  GradeEntry: ClassRouteParams & { subjectName?: string | null };
  ClassGradeRecap: {
    classId: string;
    className: string;
    assignmentsJson: string;
  };
  CreateStudent: { classId: string; className: string };
  /** Stack pengelolaan — nested di Home. */
  Manage: NavigatorScreenParams<ManageStackParamList>;
  /** Stack pengaturan — nested di Home. */
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

/** Pengelolaan data kelas, mapel, siswa. */
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
  Settings: undefined;
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
  App: undefined;
};

export type GuruAssignmentList = GuruAssignment[];
