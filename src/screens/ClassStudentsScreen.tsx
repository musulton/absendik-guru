import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AdFooterStack } from "@/components/ads/AdFooterStack";
import { ErrorBanner } from "@/components/ErrorBanner";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { ScreenHint } from "@/components/ui/ScreenHint";
import { StudentListCard } from "@/components/ui/StudentListCard";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useTheme } from "@/context/AppPreferencesContext";
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
} from "@/hooks/useBlockingScreenLoad";
import { ScreenLoadingView } from "@/components/ui/ScreenLoadingView";
import { apiListStudents } from "@/lib/guru-repository";
import { useListStyles } from "@/lib/use-themed-styles";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { EmptyState } from "@/components/ui/EmptyState";
import type { GuruStudent } from "@/lib/types";
import { space } from "@/lib/theme";
import type { ManageStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<
  ManageStackParamList,
  "ClassStudents"
>;

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  purpose?: "home" | "manage";
  onAddStudent: () => void;
  onEditStudent: (student: GuruStudent) => void;
  onStudentDetail?: (student: GuruStudent) => void;
  onStudentGradeDetail?: (student: GuruStudent) => void;
  onUpgrade?: () => void;
};

export function ClassStudentsScreen({
  workspaceId,
  classId,
  purpose = "home",
  onAddStudent,
  onEditStudent,
  onStudentDetail,
  onStudentGradeDetail,
  onUpgrade,
}: Props) {
  const isManage = purpose === "manage";
  const navigation = useNavigation<Nav>();
  const route =
    useRoute<RouteProp<ManageStackParamList, "ClassStudents">>();
  const listStyles = useListStyles();
  const { colors, t, isDark } = useTheme();
  const { modules } = useWorkspaceModules();
  const { isSchoolWorkspace, isLocalArchiveWorkspace } = useWorkspace();
  const isMutationLocked = isSchoolWorkspace || isLocalArchiveWorkspace;

  useTranslatedScreenTitle(
    `${t("nav.students")} — ${route.params.className}`,
  );
  const [loading, setLoading] = useFetchLoadingState();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [students, setStudents] = useState<GuruStudent[]>([]);
  const loadGeneration = useRef(0);

  const refreshAt = route.params.refreshAt;

  const load = useCallback(async (silent?: boolean) => {
    const generation = ++loadGeneration.current;
    setError("");
    if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(true);
    const result = await apiListStudents(workspaceId, classId, { force: true });
    if (generation !== loadGeneration.current) return;
    if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(false);
    setRefreshing(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setStudents(result.data.students);
  }, [workspaceId, classId, isSchoolWorkspace, setLoading]);

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
  }, { staleMs: 0 });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderActions
          actions={
            isMutationLocked
              ? []
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
  }, [navigation, onAddStudent, isMutationLocked, isDark, t]);

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

      return (
        <StudentListCard
          fullName={item.fullName}
          studentNumber={item.studentNumber}
          attendanceLabel={t("studentDetail.title")}
          gradesLabel={t("studentGradeDetail.title")}
          showAttendance={modules.attendance}
          showGrades={modules.grades}
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
        />
      );
    },
    [
      t,
      onStudentDetail,
      onStudentGradeDetail,
      onEditStudent,
      modules.attendance,
      modules.grades,
      isManage,
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
        <AdFooterStack placement="class_students" onUpgrade={onUpgrade} />
      }
    >
      <FlatList
        style={[listStyles.list, { backgroundColor: colors.bg }]}
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
    </StickyScreen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingTop: space.sm },
});
