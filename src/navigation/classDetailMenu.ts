import { Alert } from "react-native";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { HomeModule } from "@/navigation/types";

type MenuButton = {
  text: string;
  onPress?: () => void;
  style?: "cancel";
};

function showMenu(
  t: (key: TranslationKey) => string,
  title: string,
  items: MenuButton[],
) {
  Alert.alert(title, undefined, [
    ...items,
    { text: t("common.cancel"), style: "cancel" },
  ]);
}

/** Menu ⋮ layar absensi — hanya aksi terkait absensi. */
export function showAttendanceModuleMenu(
  t: (key: TranslationKey) => string,
  opts: {
    title: string;
    onManageStudents: () => void;
    onRecap: () => void;
    onEditClass?: () => void;
  },
) {
  const items: MenuButton[] = [
    { text: t("nav.students"), onPress: opts.onManageStudents },
    { text: t("nav.recap"), onPress: opts.onRecap },
  ];
  if (opts.onEditClass) {
    items.push({ text: t("nav.manageClass"), onPress: opts.onEditClass });
  }
  showMenu(t, opts.title, items);
}

/** Menu ⋮ layar penilaian — hanya aksi terkait nilai. */
export function showGradesModuleMenu(
  t: (key: TranslationKey) => string,
  opts: {
    title: string;
    onManageStudents: () => void;
    onGradeRecap: () => void;
    onEditClass?: () => void;
  },
) {
  const items: MenuButton[] = [
    { text: t("nav.students"), onPress: opts.onManageStudents },
    { text: t("nav.gradeRecap"), onPress: opts.onGradeRecap },
  ];
  if (opts.onEditClass) {
    items.push({ text: t("nav.manageClass"), onPress: opts.onEditClass });
  }
  showMenu(t, opts.title, items);
}

/** Menu ⋮ daftar mapel (mode home) — sesuai modul yang dipilih. */
export function showSubjectListModuleMenu(
  t: (key: TranslationKey) => string,
  opts: {
    title: string;
    module: HomeModule;
    onRecap: () => void;
    onGradeRecap: () => void;
    onEditClass?: () => void;
  },
) {
  const items: MenuButton[] = [];
  if (opts.module === "attendance") {
    items.push({ text: t("nav.recap"), onPress: opts.onRecap });
  } else {
    items.push({ text: t("nav.gradeRecap"), onPress: opts.onGradeRecap });
  }
  if (opts.onEditClass) {
    items.push({ text: t("nav.manageClass"), onPress: opts.onEditClass });
  }
  showMenu(t, opts.title, items);
}

/** @deprecated gunakan showAttendanceModuleMenu / showGradesModuleMenu */
export function showClassDetailMenu(
  t: (key: TranslationKey) => string,
  opts: {
    studentCount: number;
    onManageStudents: () => void;
    onRecap: () => void;
    onEditClass: () => void;
  },
) {
  const buttons: MenuButton[] = [];

  if (opts.studentCount > 0) {
    buttons.push({ text: t("nav.students"), onPress: opts.onManageStudents });
  }

  buttons.push(
    { text: t("classMenu.weeklyRecap"), onPress: opts.onRecap },
    { text: t("classMenu.editOrDelete"), onPress: opts.onEditClass },
  );

  showMenu(t, t("common.class"), buttons);
}
