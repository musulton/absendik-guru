import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AdFooterStack } from "@/components/ads/AdFooterStack";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ClassContextHeader } from "@/components/ui/ClassContextHeader";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { SubjectListCard } from "@/components/ui/SubjectListCard";
import { ScreenHint } from "@/components/ui/ScreenHint";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useTheme } from "@/context/AppPreferencesContext";
import { useAddStudentsPrompt } from "@/context/AddStudentsPromptContext";
import { useActionMenu } from "@/context/ActionMenuContext";
import { useWorkspaceModules } from "@/context/WorkspaceModulesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useListMutations } from "@/hooks/useListMutations";
import { appendAssignmentToList } from "@/lib/list-mutation-events";
import {
  useBlockingScreenLoad,
  useFetchLoadingState,
  shouldShowFetchLoading,
  finishScreenFetch,
} from "@/hooks/useBlockingScreenLoad";
import { ScreenLoadingView } from "@/components/ui/ScreenLoadingView";
import { apiListAssignments, apiListStudents } from "@/lib/guru-repository";
import { useListStyles } from "@/lib/use-themed-styles";
import { space } from "@/lib/theme";
import { EmptyState } from "@/components/ui/EmptyState";
import type { GuruAssignment } from "@/lib/types";
import { goToSettingsTab } from "@/navigation/navHelpers";
import { showSubjectListModuleMenu } from "@/navigation/classDetailMenu";
import type { HomeModule, HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "SubjectList">;

type HomeProps = {
  purpose?: "home";
  module: HomeModule;
  classId: string;
  className: string;
  labelColor?: string | null;
  onAttendance: (subjectName: string) => void;
  onAddSubject: () => void;
  onEditSubject: (assignment: GuruAssignment) => void;
  onStudents: () => void;
  onRecap: (assignments: GuruAssignment[]) => void;
  onGrades: (subjectName: string) => void;
  onTeachingJournal: (subjectName: string) => void;
  onGradeRecap: (assignments: GuruAssignment[]) => void;
  onJournalRecap: (assignments: GuruAssignment[]) => void;
  onEditClass: () => void;
  onAddStudent: () => void;
};

type ManageProps = {
  purpose: "manage";
  classId: string;
  className: string;
  labelColor?: string | null;
  onAddSubject: () => void;
  onEditSubject: (assignment: GuruAssignment) => void;
};

type Props = HomeProps | ManageProps;

export function SubjectListScreen(props: Props) {
  const { classId, className, labelColor, purpose = "home" } = props;
  const isManage = purpose === "manage";
  const navigation = useNavigation<Nav>();
  const { modules } = useWorkspaceModules();
  const { workspace, isSchoolWorkspace, isLocalArchiveWorkspace } = useWorkspace();
  const isMutationLocked = isSchoolWorkspace || isLocalArchiveWorkspace;
  const { colors, t, isDark } = useTheme();
  const { showAddStudentsPrompt } = useAddStudentsPrompt();
  const { showActionMenu } = useActionMenu();
  const listStyles = useListStyles();
  const [loading, setLoading] = useFetchLoadingState();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const [assignments, setAssignments] = useState<GuruAssignment[]>([]);

  const load = useCallback(async (silent?: boolean) => {
    setError("");
    if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(true);
    try {
      const [stRes, asRes] = await Promise.all([
        apiListStudents(workspace.id, classId, { force: true }),
        apiListAssignments(workspace.id, classId, { force: true }),
      ]);
      if (!stRes.ok) {
        setError(stRes.error.message);
        return;
      }
      setStudentCount(stRes.data.students.length);
      if (asRes.ok) setAssignments(asRes.data.assignments);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
    } finally {
      finishScreenFetch({
        isSchoolWorkspace,
        silent,
        setLoading,
        setRefreshing,
      });
    }
  }, [workspace.id, classId, isSchoolWorkspace, setLoading, t]);

  const showBlockingLoad = useBlockingScreenLoad(
    loading,
    assignments.length > 0 || studentCount > 0,
  );

  useEffect(() => {
    void load();
  }, [load]);

  useRefreshOnFocus(() => {
    void load(true);
  });

  useListMutations((event) => {
    if (event.workspaceId !== workspace.id) return;
    switch (event.type) {
      case "student-created":
      case "student-deleted":
        if (event.classId !== classId) return;
        if (event.type === "student-created") {
          setStudentCount((count) => count + 1);
        } else {
          setStudentCount((count) => Math.max(0, count - 1));
        }
        break;
      case "assignment-created":
        if (event.classId !== classId) return;
        setAssignments((prev) => appendAssignmentToList(prev, event.assignment));
        break;
      case "assignment-deleted":
        if (event.classId !== classId) return;
        setAssignments((prev) =>
          prev.filter((row) => row.id !== event.assignmentId),
        );
        break;
      default:
        break;
    }
  });

  const showClassMenu = useCallback(() => {
    if (props.purpose !== "home") return;
    if (props.module === "studentNotes") return;
    showSubjectListModuleMenu(showActionMenu, t, {
      title: className,
      module: props.module,
      onRecap: () => props.onRecap(assignments),
      onGradeRecap: () => props.onGradeRecap(assignments),
      onJournalRecap: () => props.onJournalRecap(assignments),
      onEditClass: isMutationLocked ? undefined : props.onEditClass,
    });
  }, [
    className,
    t,
    assignments,
    isMutationLocked,
    props,
    showActionMenu,
  ]);

  useLayoutEffect(() => {
    if (props.purpose === "manage") {
      navigation.setOptions({
        headerRight: () => (
          <HeaderActions
            layoutKey={isMutationLocked ? "locked" : "full"}
            actions={[
              {
                icon: "plus",
                onPress: props.onAddSubject,
                hidden: isMutationLocked,
                accessibilityLabel: t("nav.addSubject"),
              },
            ]}
          />
        ),
      });
      return;
    }

    navigation.setOptions({
      headerRight: () => (
        <HeaderActions
          layoutKey={isMutationLocked ? "locked" : "full"}
          actions={[{ icon: "more", onPress: showClassMenu }]}
        />
      ),
    });
  }, [
    navigation,
    props,
    showClassMenu,
    isMutationLocked,
    isDark,
    t,
  ]);

  const promptNoStudents = useCallback(() => {
    if (props.purpose !== "home") return;
    showAddStudentsPrompt({
      isSchoolWorkspace: isMutationLocked,
      onAddStudent: props.onAddStudent,
    });
  }, [props, isMutationLocked, showAddStudentsPrompt]);

  const openAttendance = useCallback(
    (subjectName: string) => {
      if (props.purpose !== "home") return;
      if (studentCount === 0) {
        promptNoStudents();
        return;
      }
      props.onAttendance(subjectName);
    },
    [studentCount, promptNoStudents, props],
  );

  const openGrades = useCallback(
    (subjectName: string) => {
      if (props.purpose !== "home") return;
      if (studentCount === 0) {
        promptNoStudents();
        return;
      }
      props.onGrades(subjectName);
    },
    [studentCount, promptNoStudents, props],
  );

  const openJournal = useCallback(
    (subjectName: string) => {
      if (props.purpose !== "home") return;
      if (studentCount === 0) {
        promptNoStudents();
        return;
      }
      props.onTeachingJournal(subjectName);
    },
    [studentCount, promptNoStudents, props],
  );

  const showSubjectManage = useCallback(
    (assignment: GuruAssignment) => {
      if (isMutationLocked) return;
      props.onEditSubject(assignment);
    },
    [props.onEditSubject, isMutationLocked],
  );

  const renderItem = useCallback(
    ({ item }: { item: GuruAssignment }) => {
      if (props.purpose === "home") {
        if (props.module === "teachingJournal") {
          return (
            <SubjectListCard
              variant="navigate"
              title={item.subjectName!}
              labelColorId={item.labelColor}
              actionHint={t("home.tapSubjectForJournal")}
              onPress={() => openJournal(item.subjectName!)}
            />
          );
        }
        const isAttendance = props.module === "attendance";
        return (
          <SubjectListCard
            variant="navigate"
            title={item.subjectName!}
            labelColorId={item.labelColor}
            actionHint={
              isAttendance
                ? t("home.tapSubjectForAttendance")
                : t("home.tapSubjectForGrades")
            }
            onPress={() =>
              isAttendance
                ? openAttendance(item.subjectName!)
                : openGrades(item.subjectName!)
            }
          />
        );
      }

      return (
        <SubjectListCard
          variant="navigate"
          title={item.subjectName!}
          labelColorId={item.labelColor}
          actionHint={t("subjects.tapToManage")}
          onPress={() => showSubjectManage(item)}
        />
      );
    },
    [
      t,
      openAttendance,
      openGrades,
      openJournal,
      showSubjectManage,
      props,
    ],
  );

  const keyExtractor = useCallback((item: GuruAssignment) => item.id, []);

  const subjectAssignments = useMemo(
    () => assignments.filter((a) => a.subjectName),
    [assignments],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <ClassContextHeader
          className={className}
          labelColorId={labelColor}
          studentCount={studentCount}
          studentsLabel={t("common.students")}
          onPressStudents={
            props.purpose === "home" ? props.onStudents : undefined
          }
        />
        <ScreenHint>
          {isManage
            ? t("subjects.manageHint")
            : props.purpose === "home"
              ? props.module === "attendance"
                ? t("home.moduleSubjectAttendanceHint")
                : props.module === "grades"
                  ? t("home.moduleSubjectGradesHint")
                  : t("home.moduleSubjectJournalHint")
              : t("subjects.manageHint")}
        </ScreenHint>
        <ErrorBanner message={error} />
        {studentCount === 0 && isMutationLocked && !isManage ? (
          <ScreenHint>{t("school.noStudentsHint")}</ScreenHint>
        ) : null}
        <SectionLabel title={t("nav.subjectsSection")} />
      </View>
    ),
    [
      className,
      labelColor,
      studentCount,
      t,
      error,
      props,
      isMutationLocked,
      modules.attendance,
      modules.grades,
      isManage,
      purpose,
    ],
  );

  if (showBlockingLoad) {
    return (
      <View style={[listStyles.centered, { backgroundColor: colors.bg }]}>
        <ScreenLoadingView fill={false} />
      </View>
    );
  }

  return (
    <StickyScreen
      footer={
        <AdFooterStack
          placement={isManage ? "manage_hub" : "subject_list"}
          onUpgrade={() => goToSettingsTab(navigation)}
        />
      }
    >
      <FlatList
        style={[listStyles.list, { backgroundColor: colors.bg }]}
        contentContainerStyle={listStyles.listContent}
        data={subjectAssignments}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load(true);
            }}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <EmptyState icon="subject" message={t("subjects.empty")} />
        }
      />
    </StickyScreen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.xs, marginBottom: space.xs },
});
