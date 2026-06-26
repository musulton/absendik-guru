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
  if (modules.teachingJournal) active.push("teachingJournal");
  if (modules.studentNotes) active.push("studentNotes");
  return active;
}

const SESSION_ORDER: HomeModule[] = [
  "attendance",
  "teachingJournal",
  "grades",
  "studentNotes",
];

/** Modul pertama dalam alur pertemuan yang aktif. */
export function getSessionEntryModule(
  modules: WorkspaceModules,
): HomeModule | null {
  return SESSION_ORDER.find((module) => modules[module]) ?? null;
}

export function moduleNeedsStudents(module: HomeModule): boolean {
  return (
    module === "attendance" ||
    module === "grades" ||
    module === "teachingJournal" ||
    module === "studentNotes"
  );
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
  if (active.length === 1 && active[0] === "teachingJournal") {
    return {
      cardHintKey: "modules.teachingJournal",
      screenHintKey: isSubjectMode
        ? "home.classesSubjectJournalHint"
        : "home.classesJournalHint",
    };
  }
  if (active.length === 1 && active[0] === "studentNotes") {
    return {
      cardHintKey: "modules.studentNotes",
      screenHintKey: "home.classesStudentNotesHint",
    };
  }
  return {
    cardHintKey: "home.tapClassStartSession",
    screenHintKey: isSubjectMode
      ? "home.classesSessionSubjectHint"
      : "home.classesSessionHint",
  };
}

export function promptAddStudentsForClass(
  show: (options: {
    isSchoolWorkspace: boolean;
    onAddStudent: () => void;
  }) => void,
  _t: (key: TranslationKey) => string,
  opts: { isSchoolWorkspace: boolean; onAddStudent: () => void },
): void {
  show(opts);
}

export function navigateHomeClassModule(
  navigation: HomeNav,
  workspace: GuruWorkspace,
  target: HomeClassTarget,
  module: HomeModule,
  opts?: { sessionFlow?: boolean },
): void {
  const flow = opts?.sessionFlow ? { sessionFlow: true as const } : {};
  if (module === "studentNotes") {
    navigation.navigate("ClassStudentsHome", {
      classId: target.classId,
      className: target.className,
      labelColor: target.labelColor,
      ...flow,
    });
    return;
  }

  if (workspace.attendanceMode === "subject") {
    navigation.navigate("SubjectList", {
      classId: target.classId,
      className: target.className,
      labelColor: target.labelColor,
      module,
      ...flow,
    });
    return;
  }

  if (module === "attendance") {
    navigation.navigate("Attendance", {
      classId: target.classId,
      className: target.className,
      labelColor: target.labelColor,
      ...flow,
    });
    return;
  }
  if (module === "teachingJournal") {
    navigation.navigate("TeachingJournal", {
      classId: target.classId,
      className: target.className,
      labelColor: target.labelColor,
      ...flow,
    });
    return;
  }
  navigation.navigate("GradeEntry", {
    classId: target.classId,
    className: target.className,
    labelColor: target.labelColor,
    ...flow,
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
    onAddStudent: (options?: { startSessionAfterCreate?: boolean }) => void;
    showAddStudentsPrompt: (options: {
      isSchoolWorkspace: boolean;
      onAddStudent: () => void;
    }) => void;
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
    const module = active[0];
    if (moduleNeedsStudents(module) && target.activeStudentCount === 0) {
      promptAddStudentsForClass(opts.showAddStudentsPrompt, opts.t, {
        isSchoolWorkspace: opts.isSchoolWorkspace,
        onAddStudent: () =>
          opts.onAddStudent({ startSessionAfterCreate: true }),
      });
      return;
    }
    navigateHomeClassModule(navigation, workspace, target, module);
    return;
  }

  navigation.navigate("ClassModuleHub", target);
}
