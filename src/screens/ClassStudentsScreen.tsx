import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AdFooterStack } from "@/components/ads/AdFooterStack";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ErrorBanner } from "@/components/ErrorBanner";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { ScreenHint } from "@/components/ui/ScreenHint";
import { StudentListCard } from "@/components/ui/StudentListCard";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { useTheme } from "@/context/AppPreferencesContext";
import { useActionMenu } from "@/context/ActionMenuContext";
import { useWorkspaceModules } from "@/context/WorkspaceModulesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useListMutations } from "@/hooks/useListMutations";
import {
  appendStudentToList,
} from "@/lib/list-mutation-events";
import {
  useBlockingScreenLoad,
  useFetchLoadingState,
  shouldShowFetchLoading,
  finishScreenFetch,
} from "@/hooks/useBlockingScreenLoad";
import { ScreenLoadingView } from "@/components/ui/ScreenLoadingView";
import { apiListStudents } from "@/lib/guru-repository";
import {
  todayInTimezone,
  todayJakarta,
  todayLocalDevice,
} from "@/lib/dates";
import { getCachedSchoolLink } from "@/lib/school-link";
import { SessionProgressStrip } from "@/components/session/SessionProgressStrip";
import { useSessionProgress } from "@/hooks/useSessionProgress";
import { useSessionStepPress } from "@/hooks/useSessionStepPress";
import { showStudentNotesModuleMenu } from "@/navigation/classDetailMenu";
import { finishSessionFlow } from "@/navigation/sessionStepNav";
import { useListStyles } from "@/lib/use-themed-styles";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { EmptyState } from "@/components/ui/EmptyState";
import type { GuruStudent } from "@/lib/types";
import { space } from "@/lib/theme";
import type { HomeStackParamList, ManageStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<
  ManageStackParamList,
  "ClassStudents"
>;

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  purpose?: "home" | "manage" | "notes";
  onAddStudent: () => void;
  onEditStudent: (student: GuruStudent) => void;
  onStudentDetail?: (student: GuruStudent) => void;
  onStudentGradeDetail?: (student: GuruStudent) => void;
  onStudentNotes?: (student: GuruStudent) => void;
  onStudentNotesDetail?: (student: GuruStudent) => void;
  onUpgrade?: () => void;
  onSessionManageStudents?: () => void;
  onEditClass?: () => void;
};

export function ClassStudentsScreen({
  workspaceId,
  classId,
  className,
  purpose = "home",
  onAddStudent,
  onEditStudent,
  onStudentDetail,
  onStudentGradeDetail,
  onStudentNotes,
  onStudentNotesDetail,
  onUpgrade,
  onSessionManageStudents,
  onEditClass,
}: Props) {
  const isManage = purpose === "manage";
  const isNotes = purpose === "notes";
  const navigation = useNavigation<Nav>();
  const homeNavigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute();
  const notesRoute = useRoute<RouteProp<HomeStackParamList, "ClassStudentsHome">>();
  const routeParams = route.params as
    | { className?: string; refreshAt?: number }
    | undefined;
  const screenClassName = className ?? routeParams?.className ?? "";
  const listStyles = useListStyles();
  const { colors, t, isDark } = useTheme();
  const { showActionMenu } = useActionMenu();
  const { modules } = useWorkspaceModules();
  const { isSchoolWorkspace, isLocalArchiveWorkspace } = useWorkspace();
  const isMutationLocked = isSchoolWorkspace || isLocalArchiveWorkspace;

  useTranslatedScreenTitle(`${t("nav.students")} — ${screenClassName}`);
  const [loading, setLoading] = useFetchLoadingState();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [students, setStudents] = useState<GuruStudent[]>([]);
  const loadGeneration = useRef(0);

  const refreshAt = routeParams?.refreshAt;

  const sessionToday = useMemo(() => {
    const schoolTimezone = getCachedSchoolLink()?.timezone;
    if (isSchoolWorkspace && schoolTimezone) {
      return todayInTimezone(schoolTimezone);
    }
    if (isLocalArchiveWorkspace) return todayLocalDevice();
    return todayJakarta();
  }, [isSchoolWorkspace, isLocalArchiveWorkspace]);

  const sessionDate = isNotes
    ? (notesRoute.params.sessionDate ?? sessionToday)
    : sessionToday;
  const subjectName = isNotes ? (notesRoute.params.subjectName ?? null) : null;
  const labelColor = isNotes ? notesRoute.params.labelColor : undefined;
  const sessionFlow = isNotes && notesRoute.params.sessionFlow === true;

  const { progress } = useSessionProgress(
    workspaceId,
    classId,
    sessionDate,
    subjectName,
  );
  const onSessionStepPress = useSessionStepPress({
    classId,
    className,
    labelColor,
    subjectName,
    sessionDate,
    sessionFlow: sessionFlow || undefined,
  });

  const load = useCallback(async (silent?: boolean) => {
    const generation = ++loadGeneration.current;
    setError("");
    if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(true);
    try {
      const result = await apiListStudents(workspaceId, classId, { force: true });
      if (generation !== loadGeneration.current) return;
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setStudents(result.data.students);
    } catch (err) {
      if (generation === loadGeneration.current) {
        setError(err instanceof Error ? err.message : t("error.generic"));
      }
    } finally {
      finishScreenFetch({
        isSchoolWorkspace,
        silent,
        setLoading,
        setRefreshing,
      });
    }
  }, [workspaceId, classId, isSchoolWorkspace, setLoading, t]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load(true);
  }, [load]);

  const showBlockingLoad = useBlockingScreenLoad(loading, students.length > 0);

  useEffect(() => {
    void load();
  }, [load, refreshAt]);

  useListMutations((event) => {
    if (event.workspaceId !== workspaceId) return;
    switch (event.type) {
      case "student-created":
        if (event.classId !== classId) return;
        setStudents((prev) => appendStudentToList(prev, event.student, workspaceId));
        break;
      case "student-updated":
        if (event.classId !== classId) return;
        setStudents((prev) =>
          prev.map((row) => (row.id === event.student.id ? event.student : row)),
        );
        break;
      case "student-deleted":
        if (event.classId !== classId) return;
        setStudents((prev) => prev.filter((row) => row.id !== event.studentId));
        break;
      case "class-deleted":
        if (event.classId !== classId) return;
        setStudents([]);
        break;
      default:
        break;
    }
  });

  useRefreshOnFocus(() => {
    void load(true);
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderActions
          actions={
            isMutationLocked
              ? []
              : isNotes
                ? [
                    {
                      icon: "more" as const,
                      onPress: () => {
                        showStudentNotesModuleMenu(showActionMenu, t, {
                          title: className,
                          onManageStudents:
                            onSessionManageStudents ?? onAddStudent,
                          onEditClass: isMutationLocked ? undefined : onEditClass,
                        });
                      },
                    },
                    {
                      icon: "plus" as const,
                      onPress: onAddStudent,
                      accessibilityLabel: t("subjects.addStudent"),
                    },
                  ]
                : [
                    {
                      icon: "plus" as const,
                      onPress: onAddStudent,
                      accessibilityLabel: t("subjects.addStudent"),
                    },
                  ]
          }
        />
      ),
    });
  }, [
    navigation,
    onAddStudent,
    isMutationLocked,
    isDark,
    t,
    isNotes,
    className,
    showActionMenu,
    onSessionManageStudents,
    onEditClass,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: GuruStudent }) => {
      if (isManage) {
        return (
          <StudentListCard
            variant="navigate"
            fullName={item.fullName}
            studentNumber={item.studentNumber}
            actionHint={t("students.tapToEdit")}
            onPress={() => onEditStudent(item)}
          />
        );
      }

      if (isNotes) {
        return (
          <StudentListCard
            variant="notes"
            fullName={item.fullName}
            studentNumber={item.studentNumber}
            actionHint={t("studentNotes.tapToAdd")}
            historyLabel={t("studentNotesDetail.title")}
            onPress={() =>
              onStudentNotes ? onStudentNotes(item) : onEditStudent(item)
            }
            onHistory={
              onStudentNotesDetail ? () => onStudentNotesDetail(item) : undefined
            }
          />
        );
      }

      return (
        <StudentListCard
          fullName={item.fullName}
          studentNumber={item.studentNumber}
          studentNotesLabel={t("nav.studentNotes")}
          studentNotesHistoryLabel={t("studentNotesDetail.title")}
          showAttendance={modules.attendance}
          showGrades={modules.grades}
          showStudentNotes={modules.studentNotes && Boolean(onStudentNotes)}
          showStudentNotesHistory={
            modules.studentNotes && Boolean(onStudentNotesDetail)
          }
          onAttendance={() =>
            onStudentDetail
              ? onStudentDetail(item)
              : onEditStudent(item)
          }
          onGrades={() =>
            onStudentGradeDetail
              ? onStudentGradeDetail(item)
              : onEditStudent(item)
          }
          onStudentNotesHistory={
            onStudentNotesDetail ? () => onStudentNotesDetail(item) : undefined
          }
          onStudentNotes={() =>
            onStudentNotes
              ? onStudentNotes(item)
              : onEditStudent(item)
          }
        />
      );
    },
    [
      t,
      onStudentDetail,
      onStudentGradeDetail,
      onStudentNotes,
      onStudentNotesDetail,
      onEditStudent,
      modules.attendance,
      modules.grades,
      modules.studentNotes,
      isManage,
      isNotes,
    ],
  );

  const keyExtractor = useCallback((item: GuruStudent) => item.id, []);

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
        isNotes && sessionFlow ? (
          <StickyActionBar>
            <PrimaryButton
              title={t("sessionFlow.finishSession")}
              variant="secondary"
              onPress={() =>
                finishSessionFlow(homeNavigation, {
                  classId,
                  className,
                  labelColor: notesRoute.params.labelColor,
                  activeStudentCount: students.length,
                })
              }
            />
          </StickyActionBar>
        ) : isNotes ? null : (
          <AdFooterStack placement="class_students" onUpgrade={onUpgrade} />
        )
      }
    >
      <View style={styles.listWrap}>
        {isNotes && sessionFlow ? (
          <SessionProgressStrip
            progress={progress}
            pinned
            currentModule="studentNotes"
            onStepPress={onSessionStepPress}
          />
        ) : null}
        <FlatList
          style={[listStyles.list, styles.listFlex, { backgroundColor: colors.bg }]}
        contentContainerStyle={[listStyles.listContent, styles.listContent]}
        data={students}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator
        removeClippedSubviews
        initialNumToRender={16}
        maxToRenderPerBatch={20}
        windowSize={7}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <ScreenHint>
              {isManage
                ? t("students.manageHint")
                : isNotes
                  ? t("studentNotes.classHint")
                  : isLocalArchiveWorkspace
                  ? t("workspace.localArchiveBanner")
                  : isSchoolWorkspace
                    ? t("students.hintSchool")
                    : t("students.hint")}
            </ScreenHint>
            <ErrorBanner message={error} />
          </>
        }
        ListEmptyComponent={
          <EmptyState icon="students" message={t("students.empty")} />
        }
      />
      </View>
    </StickyScreen>
  );
}

const styles = StyleSheet.create({
  listWrap: { flex: 1 },
  listFlex: { flex: 1 },
  listContent: { paddingTop: space.sm },
});
