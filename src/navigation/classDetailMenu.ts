import type { ActionMenuItem } from "@/components/ui/ActionMenuSheet";
import type { ShowActionMenuParams } from "@/context/ActionMenuContext";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { HomeModule } from "@/navigation/types";

type ShowMenu = (params: ShowActionMenuParams) => void;

/** Menu ⋮ layar absensi — hanya aksi terkait absensi. */
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

/** Menu ⋮ layar penilaian — hanya aksi terkait nilai. */
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

/** Menu ⋮ daftar mapel (mode home) — sesuai modul yang dipilih. */
export function showSubjectListModuleMenu(
  showMenu: ShowMenu,
  t: (key: TranslationKey) => string,
  opts: {
    title: string;
    module: HomeModule;
    onRecap: () => void;
    onGradeRecap: () => void;
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
  } else {
    items.push({
      id: "grade-recap",
      label: t("nav.gradeRecap"),
      icon: "gradeRecap",
      onPress: opts.onGradeRecap,
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
