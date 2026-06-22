import { Alert } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { GuruClass, GuruWorkspace } from "@/lib/types";
import type { WorkspaceModules } from "@/lib/workspace-modules";
import type { HomeModule, HomeStackParamList } from "@/navigation/types";

type HomeNav = NativeStackNavigationProp<HomeStackParamList>;

export type HomeClassTarget = {
  classId: string;
  className: string;
  labelColor?: string | null;
  activeStudentCount: number;
};

export function listActiveHomeModules(modules: WorkspaceModules): HomeModule[] {
  const active: HomeModule[] = [];
  if (modules.attendance) active.push("attendance");
  if (modules.grades) active.push("grades");
  return active;
}

export function getHomeClassListCopy(
  modules: WorkspaceModules,
  isSubjectMode: boolean,
): { cardHintKey: TranslationKey; screenHintKey: TranslationKey } {
  const active = listActiveHomeModules(modules);
  if (active.length === 1 && active[0] === "attendance") {
    return {
      cardHintKey: "modules.attendance",
      screenHintKey: isSubjectMode
        ? "home.classesSubjectAttendanceHint"
        : "home.classesAttendanceHint",
    };
  }
  if (active.length === 1 && active[0] === "grades") {
    return {
      cardHintKey: "modules.grades",
      screenHintKey: isSubjectMode
        ? "home.classesSubjectGradesHint"
        : "home.classesGradesHint",
    };
  }
  return {
    cardHintKey: "home.tapClassPickModule",
    screenHintKey: isSubjectMode
      ? "home.classesSubjectHint"
      : "home.classesHint",
  };
}

export function promptAddStudentsForClass(
  t: (key: TranslationKey) => string,
  opts: { isSchoolWorkspace: boolean; onAddStudent: () => void },
): void {
  if (opts.isSchoolWorkspace) {
    Alert.alert(t("school.readonlyTitle"), t("school.noStudentsHint"));
    return;
  }
  Alert.alert(t("subjects.noStudents"), t("subjects.addStudent"), [
    { text: t("common.cancel"), style: "cancel" },
    { text: t("subjects.addStudent"), onPress: opts.onAddStudent },
  ]);
}

export function navigateHomeClassModule(
  navigation: HomeNav,
  workspace: GuruWorkspace,
  target: HomeClassTarget,
  module: HomeModule,
): void {
  if (workspace.attendanceMode === "subject") {
    navigation.navigate("SubjectList", {
      classId: target.classId,
      className: target.className,
      labelColor: target.labelColor,
      module,
    });
    return;
  }
  if (module === "attendance") {
    navigation.navigate("Attendance", {
      classId: target.classId,
      className: target.className,
    });
    return;
  }
  navigation.navigate("GradeEntry", {
    classId: target.classId,
    className: target.className,
  });
}

export function openHomeClassFromList(
  navigation: HomeNav,
  workspace: GuruWorkspace,
  modules: WorkspaceModules,
  guruClass: GuruClass,
  opts: {
    t: (key: TranslationKey) => string;
    isSchoolWorkspace: boolean;
    onAddStudent: () => void;
  },
): void {
  const target: HomeClassTarget = {
    classId: guruClass.id,
    className: guruClass.name,
    labelColor: guruClass.labelColor,
    activeStudentCount: guruClass.activeStudentCount,
  };
  const active = listActiveHomeModules(modules);

  if (active.length === 1) {
    if (target.activeStudentCount === 0) {
      promptAddStudentsForClass(opts.t, {
        isSchoolWorkspace: opts.isSchoolWorkspace,
        onAddStudent: opts.onAddStudent,
      });
      return;
    }
    navigateHomeClassModule(navigation, workspace, target, active[0]);
    return;
  }

  navigation.navigate("ClassModuleHub", target);
}
