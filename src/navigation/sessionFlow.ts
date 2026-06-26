import type { ShowActionMenuParams } from "@/context/ActionMenuContext";
import type { TranslationKey } from "@/lib/i18n/translations";
import { getModuleTheme } from "@/lib/module-theme";
import type { ThemeColors } from "@/lib/theme-palettes";
import type { WorkspaceModules } from "@/lib/workspace-modules-shared";

type TFn = (key: TranslationKey) => string;
type ShowMenu = (params: ShowActionMenuParams) => void;

export type SessionFlowNav = {
  onJournal?: () => void;
  onGrades?: () => void;
  onStudentNotes?: () => void;
  onFinishSession: () => void;
};

type ThemeCtx = { colors: ThemeColors; isDark: boolean };

function skipJournalAfterAttendance(
  showMenu: ShowMenu,
  t: TFn,
  modules: WorkspaceModules,
  nav: SessionFlowNav,
  theme: ThemeCtx,
) {
  if (modules.grades && nav.onGrades) {
    nav.onGrades();
    return;
  }
  showStudentNotesPrompt(showMenu, t, modules, nav, theme);
}

export function showAfterAttendanceSavePrompt(
  showMenu: ShowMenu,
  t: TFn,
  modules: WorkspaceModules,
  nav: SessionFlowNav,
  theme: ThemeCtx,
) {
  if (modules.teachingJournal && nav.onJournal) {
    const journalTheme = getModuleTheme(
      "teachingJournal",
      theme.colors,
      theme.isDark,
    );
    showMenu({
      title: t("sessionFlow.afterAttendanceTitle"),
      subtitle: t("sessionFlow.afterAttendanceBody"),
      dismissLabel:
        modules.grades && nav.onGrades
          ? t("sessionFlow.skipJournal")
          : t("sessionFlow.skip"),
      onDismiss: () =>
        skipJournalAfterAttendance(showMenu, t, modules, nav, theme),
      items: [
        {
          id: "journal",
          label: t("sessionFlow.continueJournal"),
          icon: journalTheme.icon,
          iconAccent: journalTheme.accent,
          iconTint: journalTheme.tint,
          onPress: nav.onJournal,
        },
      ],
    });
    return;
  }
  showAfterJournalSavePrompt(showMenu, t, modules, nav, theme);
}

export function showAfterJournalSavePrompt(
  showMenu: ShowMenu,
  t: TFn,
  modules: WorkspaceModules,
  nav: SessionFlowNav,
  theme: ThemeCtx,
) {
  if (modules.grades && nav.onGrades) {
    const gradesTheme = getModuleTheme("grades", theme.colors, theme.isDark);
    showMenu({
      title: t("sessionFlow.afterJournalTitle"),
      subtitle: t("sessionFlow.afterJournalBody"),
      dismissLabel: t("sessionFlow.done"),
      onDismiss: nav.onFinishSession,
      items: [
        {
          id: "grades",
          label: t("sessionFlow.continueGrades"),
          icon: gradesTheme.icon,
          iconAccent: gradesTheme.accent,
          iconTint: gradesTheme.tint,
          onPress: nav.onGrades,
        },
        {
          id: "skip-grades",
          label: t("sessionFlow.skip"),
          onPress: () => showStudentNotesPrompt(showMenu, t, modules, nav, theme),
        },
      ],
    });
    return;
  }
  showStudentNotesPrompt(showMenu, t, modules, nav, theme);
}

export function showAfterGradesSavePrompt(
  showMenu: ShowMenu,
  t: TFn,
  modules: WorkspaceModules,
  nav: SessionFlowNav,
  theme: ThemeCtx,
) {
  showStudentNotesPrompt(showMenu, t, modules, nav, theme);
}

export function showAfterStudentNoteSavePrompt(
  showMenu: ShowMenu,
  t: TFn,
  nav: { onAnotherStudent: () => void; onFinishSession: () => void },
) {
  showMenu({
    title: t("sessionFlow.afterNoteTitle"),
    subtitle: t("sessionFlow.afterNoteBody"),
    dismissLabel: t("sessionFlow.done"),
    onDismiss: nav.onFinishSession,
    items: [
      {
        id: "another-student",
        label: t("sessionFlow.pickAnotherStudent"),
        icon: "students",
        onPress: nav.onAnotherStudent,
      },
      {
        id: "finish-session",
        label: t("sessionFlow.finishSession"),
        icon: "check",
        onPress: nav.onFinishSession,
      },
    ],
  });
}

function showStudentNotesPrompt(
  showMenu: ShowMenu,
  t: TFn,
  modules: WorkspaceModules,
  nav: SessionFlowNav,
  theme: ThemeCtx,
) {
  if (!modules.studentNotes || !nav.onStudentNotes) {
    nav.onFinishSession();
    return;
  }

  const notesTheme = getModuleTheme("studentNotes", theme.colors, theme.isDark);
  showMenu({
    title: t("sessionFlow.afterGradesTitle"),
    subtitle: t("sessionFlow.afterGradesBody"),
    dismissLabel: t("sessionFlow.done"),
    onDismiss: nav.onFinishSession,
    items: [
      {
        id: "student-notes",
        label: t("sessionFlow.continueStudentNotes"),
        icon: notesTheme.icon,
        iconAccent: notesTheme.accent,
        iconTint: notesTheme.tint,
        onPress: nav.onStudentNotes,
      },
    ],
  });
}
