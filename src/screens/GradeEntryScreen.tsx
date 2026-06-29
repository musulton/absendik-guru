import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { AttendanceSessionHeader } from "@/components/attendance/AttendanceSessionHeader";
import { GradeTaskCard } from "@/components/grades/GradeTaskCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ErrorBanner } from "@/components/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { OkBanner } from "@/components/ui/OkBanner";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useTheme } from "@/context/AppPreferencesContext";
import { useAdsOptional } from "@/context/AdContext";
import { useActionMenu } from "@/context/ActionMenuContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useListStyles } from "@/lib/use-themed-styles";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useScrollToListIndex } from "@/hooks/useScrollToListIndex";
import {
  useBlockingScreenLoad,
  useFetchLoadingState,
  useSchoolFetchOverlay,
  shouldShowFetchLoading,
  finishScreenFetch,
} from "@/hooks/useBlockingScreenLoad";
import { FetchLoadingOverlay } from "@/components/ui/FetchLoadingOverlay";
import { ScreenLoadingView } from "@/components/ui/ScreenLoadingView";
import {
  apiCreateGradeTask,
  apiDeleteGradeTask,
  apiGetGradeDay,
  apiListAssignments,
  apiListStudents,
  apiSaveGradeTask,
} from "@/lib/guru-repository";
import {
  addDaysIso,
  dateToIso,
  formatDateDisplay,
  isoToDate,
  isFutureIsoDate,
  todayInTimezone,
  todayJakarta,
  todayLocalDevice,
} from "@/lib/dates";
import { getCachedSchoolLink } from "@/lib/school-link";
import type { Locale } from "@/lib/i18n/translations";
import { SessionProgressStrip } from "@/components/session/SessionProgressStrip";
import { useSessionProgress } from "@/hooks/useSessionProgress";
import { useSessionStepPress } from "@/hooks/useSessionStepPress";
import { space } from "@/lib/theme";
import { useWorkspaceModules } from "@/context/WorkspaceModulesContext";
import { showGradesModuleMenu } from "@/navigation/classDetailMenu";
import { showAfterGradesSavePrompt } from "@/navigation/sessionFlow";
import { finishSessionFlow } from "@/navigation/sessionStepNav";
import type { HomeStackParamList } from "@/navigation/types";

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  subjectName?: string | null;
  initialSessionDate?: string;
  onStudentDetail?: (student: GuruGradeStudentRow) => void;
  onStudents: () => void;
  onGradeRecap: (assignments: GuruAssignment[]) => void;
  onEditClass: () => void;
  onAttendance?: (sessionDate: string) => void;
  onTeachingJournal?: (sessionDate: string) => void;
  onStudentNotes?: (sessionDate: string) => void;
};

function taskScoreSummary(
  taskId: string,
  students: GuruGradeStudentRow[],
  t: (key: "grades.scoreFilled", params: { filled: string; total: string }) => string,
  taskScores?: Record<string, string | null>,
) {
  const filled = students.filter((row) => {
    const score = taskScores?.[row.studentId] ?? row.scores[taskId];
    return score?.trim();
  }).length;
  return t("grades.scoreFilled", {
    filled: String(filled),
    total: String(students.length),
  });
}

function taskHasEnteredScores(
  taskId: string,
  students: GuruGradeStudentRow[],
  scoresByTask: Record<string, Record<string, string | null>>,
): boolean {
  const scores = scoresByTask[taskId];
  if (!scores) return false;
  return students.some((row) => {
    const value = scores[row.studentId];
    return value != null && String(value).trim() !== "";
  });
}

function canSaveGradeTask(
  taskId: string,
  title: string,
  students: GuruGradeStudentRow[],
  scoresByTask: Record<string, Record<string, string | null>>,
): boolean {
  return Boolean(title.trim()) && taskHasEnteredScores(taskId, students, scoresByTask);
}

export function GradeEntryScreen({
  workspaceId,
  classId,
  className,
  subjectName,
  initialSessionDate,
  onStudentDetail,
  onStudents,
  onGradeRecap,
  onEditClass,
  onAttendance,
  onTeachingJournal,
  onStudentNotes,
}: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, "GradeEntry">>();
  const { modules } = useWorkspaceModules();
  const listStyles = useListStyles();
  const { showActionMenu } = useActionMenu();
  const { colors, font, scale, t, locale, isDark } = useTheme();
  const { isSchoolWorkspace, isLocalArchiveWorkspace } = useWorkspace();
  const isMutationLocked = isSchoolWorkspace || isLocalArchiveWorkspace;
  const ads = useAdsOptional();
  const savedThisVisit = useRef(false);
  const schoolTimezone = getCachedSchoolLink()?.timezone;
  const today =
    isSchoolWorkspace && schoolTimezone
      ? todayInTimezone(schoolTimezone)
      : isLocalArchiveWorkspace
        ? todayLocalDevice()
        : todayJakarta();
  const [taskDate, setTaskDate] = useState(initialSessionDate ?? today);
  const sessionFlow = route.params.sessionFlow === true;
  const { progress } = useSessionProgress(
    workspaceId,
    classId,
    taskDate,
    subjectName,
  );
  const onSessionStepPress = useSessionStepPress({
    classId,
    className,
    labelColor: route.params.labelColor,
    subjectName,
    sessionDate: taskDate,
    sessionFlow,
  });

  const handleSessionNext = useCallback(() => {
    if (modules.studentNotes && onStudentNotes) {
      showAfterGradesSavePrompt(
        showActionMenu,
        t,
        modules,
        {
          onStudentNotes: () => onStudentNotes(taskDate),
          onFinishSession: () =>
            finishSessionFlow(navigation, {
              classId,
              className,
              labelColor: route.params.labelColor,
            }),
        },
        { colors, isDark },
      );
      return;
    }
    finishSessionFlow(navigation, {
      classId,
      className,
      labelColor: route.params.labelColor,
    });
  }, [
    modules,
    onStudentNotes,
    showActionMenu,
    t,
    taskDate,
    colors,
    isDark,
    navigation,
    classId,
    className,
    route.params.labelColor,
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useFetchLoadingState();
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tasks, setTasks] = useState<GuruGradeTask[]>([]);
  const [students, setStudents] = useState<GuruGradeStudentRow[]>([]);
  const [scoresByTask, setScoresByTask] = useState<
    Record<string, Record<string, string | null>>
  >({});
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingTaskIds, setEditingTaskIds] = useState<Set<string>>(() => new Set());
  const hintStyle = useMemo(
    () => ({ fontSize: scale(11), lineHeight: scale(15), marginBottom: 2 }),
    [scale],
  );
  const getTaskIndex = useCallback(
    (taskId: string) => tasks.findIndex((task) => task.id === taskId),
    [tasks],
  );
  const { listRef, scrollToKey, onScrollToIndexFailed } =
    useScrollToListIndex<GuruGradeTask>(getTaskIndex);
  const scrollToTaskInput = useCallback(
    (taskId: string, studentIndex?: number) => {
      const viewOffset =
        studentIndex != null && studentIndex >= 0
          ? 44 + studentIndex * 28
          : undefined;
      scrollToKey(taskId, { viewPosition: 0, viewOffset });
    },
    [scrollToKey],
  );
  const isToday = taskDate === today;
  const dateLabel = useMemo(
    () => formatDateDisplay(taskDate, locale as Locale),
    [taskDate, locale],
  );
  const screenTitle = subjectName
    ? `${t("nav.grades")} — ${subjectName}`
    : t("nav.grades");

  useTranslatedScreenTitle(screenTitle);

  const applyTaskDate = useCallback(
    (nextDate: string) => {
      if (isFutureIsoDate(nextDate, today)) {
        setError(t("attendance.notFuture"));
        return;
      }
      setError("");
      setMessage("");
      setTaskDate(nextDate);
      setExpandedTaskId(null);
      setEditingTaskIds(new Set());
      setShowDatePicker(false);
    },
    [today, t],
  );

  const load = useCallback(async (silent?: boolean) => {
    setError("");
    if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(true);
    try {
      const gradeRes = await apiGetGradeDay(workspaceId, classId, taskDate, subjectName);
      if (!gradeRes.ok) {
        const message =
          isSchoolWorkspace &&
          (gradeRes.error.code === "network" ||
            gradeRes.error.code === "invalid_response" ||
            gradeRes.error.code === "unknown" ||
            gradeRes.error.code === "server_error" ||
            gradeRes.error.code === "forbidden")
            ? t("error.schoolGradesLoadFailed")
            : gradeRes.error.message;
        setError(message);
        return;
      }
      const { gradeDay } = gradeRes.data;
      setTasks(gradeDay.tasks);
      setTitles(
        Object.fromEntries(gradeDay.tasks.map((task) => [task.id, task.title])),
      );

      const nextScores: Record<string, Record<string, string | null>> = {};
      for (const task of gradeDay.tasks) {
        nextScores[task.id] = {};
      }

      if (gradeDay.students.length > 0) {
        setStudents(gradeDay.students);
        for (const row of gradeDay.students) {
          for (const [taskId, score] of Object.entries(row.scores)) {
            nextScores[taskId] = nextScores[taskId] ?? {};
            nextScores[taskId][row.studentId] = score;
          }
        }
      } else {
        const stRes = await apiListStudents(workspaceId, classId);
        if (!stRes.ok) {
          setError(stRes.error.message);
          return;
        }
        setStudents(
          stRes.data.students.map((s) => ({
            studentId: s.id,
            fullName: s.fullName,
            studentNumber: s.studentNumber,
            scores: Object.fromEntries(gradeDay.tasks.map((task) => [task.id, null])),
          })),
        );
      }
      setScoresByTask(nextScores);
      setExpandedTaskId((prev) => {
        if (prev && gradeDay.tasks.some((task) => task.id === prev)) return prev;
        return null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
    } finally {
      finishScreenFetch({ isSchoolWorkspace, silent, setLoading });
    }
  }, [workspaceId, classId, taskDate, subjectName, isSchoolWorkspace, setLoading, t]);

  const showBlockingLoad = useBlockingScreenLoad(
    loading,
    tasks.length > 0 || students.length > 0,
  );
  const showFetchOverlay =
    useSchoolFetchOverlay(loading) &&
    (tasks.length > 0 || students.length > 0);

  useEffect(() => {
    void load();
  }, [load]);

  useRefreshOnFocus(() => {
    void load(true);
  });

  // Iklan layar penuh hanya saat keluar layar setelah menyimpan nilai.
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", () => {
      if (!savedThisVisit.current) return;
      savedThisVisit.current = false;
      void ads?.requestInterstitial("grade_saved");
    });
    return unsub;
  }, [navigation, ads]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderActions
          actions={[
            {
              icon: "more",
              onPress: () => {
                void apiListAssignments(workspaceId, classId).then((res) => {
                  const assignments = res.ok ? res.data.assignments : [];
                  showGradesModuleMenu(showActionMenu, t, {
                    title: className,
                    onManageStudents: onStudents,
                    onGradeRecap: () => onGradeRecap(assignments),
                    onEditClass: isMutationLocked ? undefined : onEditClass,
                  });
                });
              },
            },
          ]}
        />
      ),
    });
  }, [
    navigation,
    className,
    workspaceId,
    classId,
    onStudents,
    onGradeRecap,
    onEditClass,
    isMutationLocked,
    t,
    isDark,
    showActionMenu,
    taskDate,
  ]);

  const shiftDate = useCallback(
    (days: number) => {
      applyTaskDate(addDaysIso(taskDate, days));
    },
    [applyTaskDate, taskDate],
  );

  const handleDatePickerChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === "android") {
        setShowDatePicker(false);
        if (event.type === "dismissed" || !date) return;
        applyTaskDate(dateToIso(date));
        return;
      }
      if (event.type === "dismissed" || !date) return;
      applyTaskDate(dateToIso(date));
    },
    [applyTaskDate],
  );

  const setScore = useCallback(
    (taskId: string, studentId: string, score: string) => {
      setScoresByTask((prev) => ({
        ...prev,
        [taskId]: { ...prev[taskId], [studentId]: score },
      }));
    },
    [],
  );

  const handleAddTask = useCallback(async () => {
    setError("");
    setMessage("");
    setCreatingTask(true);
    try {
      const result = await apiCreateGradeTask(
        workspaceId,
        classId,
        taskDate,
        subjectName,
      );
      if (!result.ok) {
        const message =
          isSchoolWorkspace &&
          (result.error.code === "network" ||
            result.error.code === "invalid_response" ||
            result.error.code === "unknown" ||
            result.error.code === "server_error")
            ? t("error.schoolGradesSaveFailed")
            : result.error.message;
        setError(message);
        return;
      }
      const newTaskId = result.data.task.id;
      setEditingTaskIds((prev) => new Set(prev).add(newTaskId));
      setExpandedTaskId(newTaskId);
      setMessage(t("grades.taskAdded"));
      void load(true);
    } finally {
      setCreatingTask(false);
    }
  }, [workspaceId, classId, taskDate, subjectName, t, load, isSchoolWorkspace]);

  const handleSaveTask = useCallback(
    async (taskId: string) => {
      const title = titles[taskId]?.trim();
      if (!title) {
        setError(t("grades.titleRequired"));
        return;
      }
      if (!taskHasEnteredScores(taskId, students, scoresByTask)) {
        setError(t("grades.scoreRequired"));
        return;
      }
      setError("");
      setMessage("");
      setSavingTaskId(taskId);
      const result = await apiSaveGradeTask(workspaceId, classId, taskId, {
        title,
        scores: students.map((row) => ({
          studentId: row.studentId,
          score: scoresByTask[taskId]?.[row.studentId] ?? row.scores[taskId],
        })),
      });
      setSavingTaskId(null);
      if (!result.ok) {
        const message =
          isSchoolWorkspace &&
          (result.error.code === "network" ||
            result.error.code === "invalid_response" ||
            result.error.code === "unknown" ||
            result.error.code === "server_error")
            ? t("error.schoolGradesSaveFailed")
            : result.error.message;
        setError(message);
        return;
      }
      setEditingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      setExpandedTaskId(null);
      setMessage(t("grades.saved"));
      savedThisVisit.current = true;
    },
    [
      titles,
      t,
      workspaceId,
      classId,
      students,
      scoresByTask,
      isSchoolWorkspace,
    ],
  );

  const handleStartEditTask = useCallback((taskId: string) => {
    setError("");
    setMessage("");
    setEditingTaskIds((prev) => new Set(prev).add(taskId));
    setExpandedTaskId(taskId);
  }, []);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      setError("");
      const result = await apiDeleteGradeTask(workspaceId, classId, taskId);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      if (expandedTaskId === taskId) setExpandedTaskId(null);
      setEditingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      void load(true);
    },
    [workspaceId, classId, expandedTaskId, load],
  );

  const confirmDeleteTask = useCallback(
    (task: GuruGradeTask) => {
      Alert.alert(t("grades.deleteTitle"), t("grades.deleteBody", { title: task.title }), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("grades.deleteAction"),
          style: "destructive",
          onPress: () => void handleDeleteTask(task.id),
        },
      ]);
    },
    [t, handleDeleteTask],
  );

  const renderItem = useCallback(
    ({ item }: { item: GuruGradeTask }) => {
      const readOnly = !editingTaskIds.has(item.id);
      const taskTitle = titles[item.id] ?? item.title;
      return (
        <GradeTaskCard
          task={item}
          expanded={expandedTaskId === item.id}
          readOnly={readOnly}
          title={taskTitle}
          students={students}
          taskScores={scoresByTask[item.id]}
          saving={savingTaskId === item.id}
          saveDisabled={
            !canSaveGradeTask(item.id, taskTitle, students, scoresByTask)
          }
          scoreSummary={taskScoreSummary(item.id, students, t, scoresByTask[item.id])}
          titlePlaceholder={t("grades.titlePlaceholder")}
          titleLabel={t("grades.titleLabel")}
          studentColumnLabel={t("grades.studentColumnLabel")}
          scoreColumnLabel={t("grades.scoreColumnLabel")}
          scorePlaceholder={t("grades.scorePlaceholder")}
          saveLabel={t("common.save")}
          editLabel={t("grades.edit")}
          deleteLabel={t("grades.deleteAction")}
          onToggle={() =>
            setExpandedTaskId((prev) => (prev === item.id ? null : item.id))
          }
          onTitleChange={(text) =>
            setTitles((prev) => ({ ...prev, [item.id]: text }))
          }
          onScoreChange={(studentId, score) =>
            setScore(item.id, studentId, score)
          }
          onSave={() => void handleSaveTask(item.id)}
          onStartEdit={() => handleStartEditTask(item.id)}
          onDelete={() => confirmDeleteTask(item)}
          onStudentDetail={onStudentDetail}
          onInputFocus={(studentIndex) => scrollToTaskInput(item.id, studentIndex)}
        />
      );
    },
    [
      editingTaskIds,
      expandedTaskId,
      titles,
      students,
      scoresByTask,
      savingTaskId,
      t,
      setScore,
      handleSaveTask,
      handleStartEditTask,
      confirmDeleteTask,
      onStudentDetail,
      scrollToTaskInput,
    ],
  );

  const hasSavedTasks = tasks.length > 0 && editingTaskIds.size < tasks.length;
  const isEditingTask = expandedTaskId != null && editingTaskIds.has(expandedTaskId);
  const hintMessage = useMemo(() => {
    if (isEditingTask) return t("grades.editingHint");
    if (hasSavedTasks && tasks.length > 0) return t("grades.readOnlyHint");
    return null;
  }, [isEditingTask, hasSavedTasks, tasks.length, t]);

  const keyExtractor = useCallback((item: GuruGradeTask) => item.id, []);

  const listHeader = useMemo(
    () => (
      <View style={styles.pageHeader}>
        <AttendanceSessionHeader
          className={className}
          subjectName={subjectName}
          isToday={isToday}
          dateLabel={dateLabel}
          todayPrefix={t("attendance.today")}
          goTodayLabel={t("attendance.goToday")}
          showDatePicker={showDatePicker}
          pickerDate={isoToDate(taskDate)}
          maxDate={isoToDate(today)}
          onPrev={() => shiftDate(-1)}
          onNext={() => shiftDate(1)}
          onTogglePicker={() => setShowDatePicker((open) => !open)}
          onGoToday={() => applyTaskDate(today)}
          onDateChange={handleDatePickerChange}
        />
        {hintMessage ? (
          <Text style={[font.caption, hintStyle, { color: colors.textMuted }]}>
            {hintMessage}
          </Text>
        ) : null}
        <ErrorBanner message={error} />
        <OkBanner message={message} />
      </View>
    ),
    [
      className,
      subjectName,
      isToday,
      dateLabel,
      t,
      showDatePicker,
      taskDate,
      today,
      shiftDate,
      applyTaskDate,
      handleDatePickerChange,
      hintMessage,
      font,
      hintStyle,
      colors,
      error,
      message,
    ],
  );

  if (showBlockingLoad) {
    return (
      <View style={[listStyles.centered, { backgroundColor: colors.bg }]}>
        <ScreenLoadingView fill={false} />
      </View>
    );
  }

  const emptyStudents = students.length === 0;
  const showSessionNextCta = sessionFlow;

  return (
    <StickyScreen
      keyboardAvoiding
      footer={
        emptyStudents ? null : (
          <StickyActionBar>
            {showSessionNextCta ? (
              <View style={styles.footerRow}>
                <View style={styles.footerBtn}>
                  <PrimaryButton
                    title={t("sessionFlow.nextStep")}
                    variant="secondary"
                    onPress={handleSessionNext}
                  />
                </View>
                <View style={styles.footerBtn}>
                  <PrimaryButton
                    title={t("grades.addTask")}
                    loading={creatingTask}
                    disabled={creatingTask}
                    onPress={() => void handleAddTask()}
                  />
                </View>
              </View>
            ) : (
              <PrimaryButton
                title={t("grades.addTask")}
                size="compact"
                loading={creatingTask}
                disabled={creatingTask}
                onPress={() => void handleAddTask()}
              />
            )}
          </StickyActionBar>
        )
      }
    >
      <View style={[styles.page, { backgroundColor: colors.bg }]}>
        {sessionFlow ? (
          <SessionProgressStrip
            progress={progress}
            pinned
            currentModule="grades"
            onStepPress={onSessionStepPress}
          />
        ) : null}
        <FlatList
          ref={listRef}
          style={styles.list}
          contentContainerStyle={[styles.listContent, styles.listWithFooter]}
          data={tasks}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          onScrollToIndexFailed={onScrollToIndexFailed}
          removeClippedSubviews
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            emptyStudents ? (
              <EmptyState icon="students" message={t("attendance.noStudents")} />
            ) : (
              <EmptyState icon="grades" message={t("grades.noTasks")} />
            )
          }
        />
        <FetchLoadingOverlay visible={showFetchOverlay} />
      </View>
    </StickyScreen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, position: "relative" },
  list: { flex: 1 },
  pageHeader: {
    paddingTop: space.sm,
    gap: space.sm,
    marginBottom: space.xs,
  },
  listContent: {
    paddingHorizontal: space.md,
    paddingBottom: 16,
    flexGrow: 1,
  },
  listWithFooter: { paddingBottom: space.xs },
  footerRow: { flexDirection: "row", gap: space.sm },
  footerBtn: { flex: 1 },
});
