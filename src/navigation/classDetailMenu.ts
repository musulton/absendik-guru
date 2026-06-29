import type { ActionMenuItem } from "@/components/ui/ActionMenuSheet";
import type { ShowActionMenuParams } from "@/context/ActionMenuContext";
import type { TranslationKey } from "@/lib/i18n/translations";

type ShowMenu = (params: ShowActionMenuParams) => void;

/** Menu ⋮ layar absensi — hanya fitur terkait absensi. */
export function showAttendanceModuleMenu(
  showMenu: ShowMenu,
  t: (key: TranslationKey) => string,
  opts: {
    title: string;
    onManageStudents: () => void;
    onRecap: () => void;
    onEditClass?: () => void;
  },
) {
  const items: ActionMenuItem[] = [
    {
      id: "students",
      label: t("nav.students"),
      icon: "students",
      onPress: opts.onManageStudents,
    },
    {
      id: "recap",
      label: t("nav.recap"),
      icon: "recap",
      onPress: opts.onRecap,
    },
  ];
  if (opts.onEditClass) {
    items.push({
      id: "manage-class",
      label: t("nav.manageClass"),
      icon: "classes",
      onPress: opts.onEditClass,
    });
  }
  showMenu({ title: opts.title, items });
}

/** Menu ⋮ layar penilaian — hanya fitur terkait nilai. */
export function showGradesModuleMenu(
  showMenu: ShowMenu,
  t: (key: TranslationKey) => string,
  opts: {
    title: string;
    onManageStudents: () => void;
    onGradeRecap: () => void;
    onEditClass?: () => void;
  },
) {
  const items: ActionMenuItem[] = [
    {
      id: "students",
      label: t("nav.students"),
      icon: "students",
      onPress: opts.onManageStudents,
    },
    {
      id: "grade-recap",
      label: t("nav.gradeRecap"),
      icon: "gradeRecap",
      onPress: opts.onGradeRecap,
    },
  ];
  if (opts.onEditClass) {
    items.push({
      id: "manage-class",
      label: t("nav.manageClass"),
      icon: "classes",
      onPress: opts.onEditClass,
    });
  }
  showMenu({ title: opts.title, items });
}

/** Menu ⋮ layar jurnal mengajar — hanya fitur terkait jurnal. */
export function showTeachingJournalModuleMenu(
  showMenu: ShowMenu,
  t: (key: TranslationKey) => string,
  opts: {
    title: string;
    onManageStudents: () => void;
    onJournalRecap?: () => void;
    onEditClass?: () => void;
  },
) {
  const items: ActionMenuItem[] = [
    {
      id: "students",
      label: t("nav.students"),
      icon: "students",
      onPress: opts.onManageStudents,
    },
  ];
  if (opts.onJournalRecap) {
    items.push({
      id: "journal-recap",
      label: t("nav.journalRecap"),
      icon: "recap",
      onPress: opts.onJournalRecap,
    });
  }
  if (opts.onEditClass) {
    items.push({
      id: "manage-class",
      label: t("nav.manageClass"),
      icon: "classes",
      onPress: opts.onEditClass,
    });
  }
  showMenu({ title: opts.title, items });
}

/** Menu ⋮ layar catatan siswa — hanya fitur terkait catatan. */
export function showStudentNotesModuleMenu(
  showMenu: ShowMenu,
  t: (key: TranslationKey) => string,
  opts: {
    title: string;
    onManageStudents: () => void;
    onEditClass?: () => void;
  },
) {
  const items: ActionMenuItem[] = [
    {
      id: "students",
      label: t("nav.students"),
      icon: "students",
      onPress: opts.onManageStudents,
    },
  ];
  if (opts.onEditClass) {
    items.push({
      id: "manage-class",
      label: t("nav.manageClass"),
      icon: "classes",
      onPress: opts.onEditClass,
    });
  }
  showMenu({ title: opts.title, items });
}

/** Menu ⋮ daftar mata pelajaran (mode home) — rekap modul aktif + kelola kelas. */
export function showSubjectListModuleMenu(
  showMenu: ShowMenu,
  t: (key: TranslationKey) => string,
  opts: {
    title: string;
    module: import("@/navigation/types").HomeModule;
    onRecap: () => void;
    onGradeRecap: () => void;
    onJournalRecap?: () => void;
    onEditClass?: () => void;
  },
) {
  const items: ActionMenuItem[] = [];
  if (opts.module === "attendance") {
    items.push({
      id: "recap",
      label: t("nav.recap"),
      icon: "recap",
      onPress: opts.onRecap,
    });
  } else if (opts.module === "grades") {
    items.push({
      id: "grade-recap",
      label: t("nav.gradeRecap"),
      icon: "gradeRecap",
      onPress: opts.onGradeRecap,
    });
  } else if (opts.module === "teachingJournal" && opts.onJournalRecap) {
    items.push({
      id: "journal-recap",
      label: t("nav.journalRecap"),
      icon: "recap",
      onPress: opts.onJournalRecap,
    });
  }
  if (opts.onEditClass) {
    items.push({
      id: "manage-class",
      label: t("nav.manageClass"),
      icon: "classes",
      onPress: opts.onEditClass,
    });
  }
  showMenu({ title: opts.title, items });
}

type RecapKind = "attendance" | "grades" | "journal";

/** Popup pilih jenis rekap dari halaman kelas. */
export function showClassRecapPickerMenu(
  showMenu: ShowMenu,
  t: (key: TranslationKey) => string,
  opts: {
    onAttendanceRecap?: () => void;
    onGradeRecap?: () => void;
    onJournalRecap?: () => void;
  },
) {
  const items: ActionMenuItem[] = [];
  if (opts.onAttendanceRecap) {
    items.push({
      id: "recap-attendance",
      label: t("nav.recap"),
      icon: "recap",
      onPress: opts.onAttendanceRecap,
    });
  }
  if (opts.onGradeRecap) {
    items.push({
      id: "recap-grades",
      label: t("nav.gradeRecap"),
      icon: "gradeRecap",
      onPress: opts.onGradeRecap,
    });
  }
  if (opts.onJournalRecap) {
    items.push({
      id: "recap-journal",
      label: t("nav.journalRecap"),
      icon: "journal",
      onPress: opts.onJournalRecap,
    });
  }
  if (items.length === 0) return;
  if (items.length === 1) {
    items[0]!.onPress();
    return;
  }
  showMenu({
    title: t("home.recapPickerTitle"),
    subtitle: t("home.recapPickerSub"),
    items,
  });
}

export type { RecapKind };
