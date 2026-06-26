import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AdFooterStack } from "@/components/ads/AdFooterStack";
import { ScreenScroll } from "@/components/ScreenScroll";
import { ClassContextHeader } from "@/components/ui/ClassContextHeader";
import { HubNavCard } from "@/components/ui/HubNavCard";
import { ScreenHint } from "@/components/ui/ScreenHint";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useAddStudentsPrompt } from "@/context/AddStudentsPromptContext";
import { useTheme } from "@/context/AppPreferencesContext";
import { useActionMenu } from "@/context/ActionMenuContext";
import { useWorkspaceModules } from "@/context/WorkspaceModulesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useListMutations } from "@/hooks/useListMutations";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { apiListAssignments, apiListStudents } from "@/lib/guru-repository";
import { getModuleTheme } from "@/lib/module-theme";
import {
  getSessionEntryModule,
  moduleNeedsStudents,
  promptAddStudentsForClass,
} from "@/navigation/homeClassFlow";
import { showClassRecapPickerMenu } from "@/navigation/classDetailMenu";
import { goToSettingsTab } from "@/navigation/navHelpers";
import type { HomeModule } from "@/navigation/types";
import type { GuruAssignment } from "@/lib/types";
import { space } from "@/lib/theme";

type AddStudentOptions = {
  startSessionAfterCreate?: boolean;
};

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  labelColor?: string | null;
  activeStudentCount: number;
  onStartSession: () => void;
  onOpenModule: (module: HomeModule) => void;
  onOpenRecap: (
    kind: "attendance" | "grades" | "journal",
    assignments: GuruAssignment[],
  ) => void;
  onAddStudent: (options?: AddStudentOptions) => void;
};

const MODULE_ORDER: HomeModule[] = [
  "attendance",
  "teachingJournal",
  "grades",
  "studentNotes",
];

export function ClassModuleHubScreen({
  workspaceId,
  classId,
  className,
  labelColor,
  activeStudentCount,
  onStartSession,
  onOpenModule,
  onOpenRecap,
  onAddStudent,
}: Props) {
  const navigation = useNavigation();
  const { showActionMenu } = useActionMenu();
  const { showAddStudentsPrompt } = useAddStudentsPrompt();
  const { colors, t, isDark } = useTheme();
  const { modules } = useWorkspaceModules();
  const { isSchoolWorkspace } = useWorkspace();
  const [studentCount, setStudentCount] = useState(activeStudentCount);

  useEffect(() => {
    setStudentCount(activeStudentCount);
  }, [activeStudentCount, classId]);

  const refreshStudentCount = useCallback(async () => {
    const res = await apiListStudents(workspaceId, classId, { force: true });
    if (!res.ok) return;
    setStudentCount(
      res.data.students.filter((student) => student.isActive).length,
    );
  }, [workspaceId, classId]);

  useRefreshOnFocus(() => {
    void refreshStudentCount();
  });

  useListMutations((event) => {
    if (event.workspaceId !== workspaceId || event.classId !== classId) return;
    if (event.type === "student-created") {
      setStudentCount((count) => count + 1);
      return;
    }
    if (event.type === "student-deleted") {
      setStudentCount((count) => Math.max(0, count - 1));
    }
  });

  const sessionEntry = getSessionEntryModule(modules);
  const sessionTheme = sessionEntry
    ? getModuleTheme(sessionEntry, colors, isDark)
    : null;
  const hubTheme = getModuleTheme("attendance", colors, isDark);

  const directCards = MODULE_ORDER.filter((module) => modules[module]).map(
    (module) => {
      const theme = getModuleTheme(module, colors, isDark);
      return {
        module,
        icon: theme.icon,
        title:
          module === "attendance"
            ? t("modules.attendance")
            : module === "teachingJournal"
              ? t("modules.teachingJournal")
              : module === "grades"
                ? t("modules.grades")
                : t("modules.studentNotes"),
        accentColor: theme.accent,
        tintColor: theme.tint,
      };
    },
  );

  const hasRecap =
    modules.attendance || modules.grades || modules.teachingJournal;

  function promptAddStudent() {
    promptAddStudentsForClass(showAddStudentsPrompt, t, {
      isSchoolWorkspace,
      onAddStudent: () =>
        onAddStudent({ startSessionAfterCreate: true }),
    });
  }

  function handleStartSession() {
    if (!sessionEntry) return;
    if (moduleNeedsStudents(sessionEntry) && studentCount === 0) {
      promptAddStudent();
      return;
    }
    onStartSession();
  }

  function handleOpenModule(module: HomeModule) {
    if (moduleNeedsStudents(module) && studentCount === 0) {
      promptAddStudent();
      return;
    }
    onOpenModule(module);
  }

  function handleOpenRecap() {
    void apiListAssignments(workspaceId, classId).then((res) => {
      const assignments = res.ok ? res.data.assignments : [];
      showClassRecapPickerMenu(showActionMenu, t, {
        onAttendanceRecap: modules.attendance
          ? () => onOpenRecap("attendance", assignments)
          : undefined,
        onGradeRecap: modules.grades
          ? () => onOpenRecap("grades", assignments)
          : undefined,
        onJournalRecap: modules.teachingJournal
          ? () => onOpenRecap("journal", assignments)
          : undefined,
      });
    });
  }

  return (
    <StickyScreen
      footer={
        <AdFooterStack
          placement="class_hub"
          onUpgrade={() => goToSettingsTab(navigation)}
        />
      }
    >
      <ScreenScroll contentContainerStyle={styles.scrollContent}>
        <ClassContextHeader
          className={className}
          labelColorId={labelColor}
          studentCount={studentCount}
          studentsLabel={t("common.students")}
        />
        {sessionEntry && sessionTheme ? (
          <>
            <ScreenHint>{t("home.sessionFlowHint")}</ScreenHint>
            <HubNavCard
              icon={sessionTheme.icon}
              title={t("home.startSessionTitle")}
              subtitle={t("home.startSessionSub")}
              accentColor={sessionTheme.accent}
              tintColor={sessionTheme.tint}
              onPress={handleStartSession}
            />
            {hasRecap ? (
              <HubNavCard
                compact
                compactSubtitle
                icon="recap"
                title={t("home.recapTitle")}
                subtitle={t("home.recapSub")}
                accentColor={hubTheme.accent}
                tintColor={hubTheme.tint}
                onPress={handleOpenRecap}
              />
            ) : null}
          </>
        ) : (
          <ScreenHint>{t("home.noModulesHint")}</ScreenHint>
        )}
        {directCards.length > 0 ? (
          <>
            <SectionLabel title={t("home.directModuleSection")} dense />
            <View style={styles.list}>
              {directCards.map((card) => (
                <HubNavCard
                  key={card.module}
                  compact
                  icon={card.icon}
                  title={card.title}
                  accentColor={card.accentColor}
                  tintColor={card.tintColor}
                  onPress={() => handleOpenModule(card.module)}
                />
              ))}
            </View>
          </>
        ) : null}
      </ScreenScroll>
    </StickyScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: space.sm, gap: space.sm },
  list: { gap: 6 },
});
