import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AttendanceSessionHeader } from "@/components/attendance/AttendanceSessionHeader";
import { AttendanceStatusSummary } from "@/components/attendance/AttendanceStatusSummary";
import { AttendanceStudentRow } from "@/components/attendance/AttendanceStudentRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ActionChip } from "@/components/ui/ActionChip";
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
import { space } from "@/lib/theme";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useListMutations } from "@/hooks/useListMutations";
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
  apiGetAttendance,
  apiGetSchoolDayBlock,
  apiListAssignments,
  apiSaveAttendance,
  apiSubmitAttendance,
} from "@/lib/guru-repository";
import { formatSchoolDayBlockMessage } from "@/lib/school-day-block-mobile";
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
import type {
  GuruAssignment,
  GuruAttendanceStatus,
  GuruAttendanceStudent,
} from "@/lib/types";
import type { Locale } from "@/lib/i18n/translations";
import { SessionProgressStrip } from "@/components/session/SessionProgressStrip";
import { useWorkspaceModules } from "@/context/WorkspaceModulesContext";
import { useSessionProgress } from "@/hooks/useSessionProgress";
import { useSessionStepPress } from "@/hooks/useSessionStepPress";
import { showAttendanceModuleMenu } from "@/navigation/classDetailMenu";
import { showAfterAttendanceSavePrompt } from "@/navigation/sessionFlow";
import { finishSessionFlow } from "@/navigation/sessionStepNav";
import type { AppStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<AppStackParamList, "Attendance">;

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  subjectName?: string | null;
  onAddStudent: () => void;
  onStudentDetail: (student: GuruAttendanceStudent) => void;
  onStudents: () => void;
  onRecap: (assignments: GuruAssignment[]) => void;
  onEditClass: () => void;
  onTeachingJournal?: (sessionDate: string) => void;
  onGrades?: (sessionDate: string) => void;
  onStudentNotes?: (sessionDate: string) => void;
};

function statusPalette(
  status: GuruAttendanceStatus,
  colors: ReturnType<typeof useTheme>["colors"],
) {
  const map: Record<
    GuruAttendanceStatus,
    { bg: string; border: string; text: string }
  > = {
    hadir: {
      bg: colors.successBg,
      border: colors.success,
      text: colors.success,
    },
    sakit: { bg: "#fffbeb", border: "#fcd34d", text: "#b45309" },
    izin: {
      bg: colors.primaryMuted,
      border: colors.primaryBorder,
      text: colors.primary,
    },
    alpha: { bg: colors.dangerBg, border: colors.danger, text: colors.danger },
  };
  return map[status];
}

export function AttendanceScreen({
  workspaceId,
  classId,
  className,
  subjectName,
  onAddStudent,
  onStudentDetail,
  onStudents,
  onRecap,
  onEditClass,
  onTeachingJournal,
  onGrades,
  onStudentNotes,
}: Props) {
  const navigation = useNavigation<Nav>();
  const { modules } = useWorkspaceModules();
  const route = useRoute<RouteProp<AppStackParamList, "Attendance">>();
  const { isSchoolWorkspace, isLocalArchiveWorkspace } = useWorkspace();
  const isMutationLocked = isSchoolWorkspace || isLocalArchiveWorkspace;
  const listStyles = useListStyles();
  const { showActionMenu } = useActionMenu();
  const { colors, font, scale, t, locale, isDark } = useTheme();
  const hintStyle = useMemo(
    () => ({ fontSize: scale(11), lineHeight: scale(15), marginBottom: 2 }),
    [scale],
  );
  const ads = useAdsOptional();
  const savedThisVisit = useRef(false);
  const schoolTimezone = getCachedSchoolLink()?.timezone;
  const today =
    isSchoolWorkspace && schoolTimezone
      ? todayInTimezone(schoolTimezone)
      : isLocalArchiveWorkspace
        ? todayLocalDevice()
        : todayJakarta();
  const [sessionDate, setSessionDate] = useState(
    route.params.sessionDate ?? today,
  );
  const sessionFlow = route.params.sessionFlow === true;
  const { progress, reload: reloadSessionProgress } = useSessionProgress(
    workspaceId,
    classId,
    sessionDate,
    subjectName,
  );
  const onSessionStepPress = useSessionStepPress({
    classId,
    className,
    labelColor: route.params.labelColor,
    subjectName,
    sessionDate,
    sessionFlow,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useFetchLoadingState();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  const [editing, setEditing] = useState(true);
  const [dayBlockMessage, setDayBlockMessage] = useState("");
  const [rows, setRows] = useState<GuruAttendanceStudent[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(
    () => new Set(),
  );
  const getStudentIndex = useCallback(
    (studentId: string) => rows.findIndex((r) => r.studentId === studentId),
    [rows],
  );
  const { listRef, scrollToKey, onScrollToIndexFailed } =
    useScrollToListIndex<GuruAttendanceStudent>(getStudentIndex);
  const isToday = sessionDate === today;
  const readOnly = Boolean(dayBlockMessage) || (hasSaved && !editing);
  const dateLabel = useMemo(
    () => formatDateDisplay(sessionDate, locale as Locale),
    [sessionDate, locale],
  );
  const screenTitle = route.params.subjectName
    ? `${t("nav.attendance")} — ${route.params.subjectName}`
    : isToday
      ? t("nav.attendanceToday")
      : t("nav.attendance");

  useTranslatedScreenTitle(screenTitle);

  const getStatusPalette = useCallback(
    (status: GuruAttendanceStatus) => statusPalette(status, colors),
    [colors],
  );

  const applySessionDate = useCallback(
    (nextDate: string) => {
      if (isFutureIsoDate(nextDate, today)) {
        setError(t("attendance.notFuture"));
        return;
      }
      setError("");
      setMessage("");
      setSessionDate(nextDate);
      setExpandedNotes(new Set());
      setShowDatePicker(false);
    },
    [today, t],
  );

  const load = useCallback(
    async (silent?: boolean) => {
      setError("");
      if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(true);
      try {
        const [result, dayBlock] = await Promise.all([
          apiGetAttendance(workspaceId, classId, sessionDate, subjectName),
          isSchoolWorkspace
            ? apiGetSchoolDayBlock(workspaceId, sessionDate)
            : Promise.resolve(null),
        ]);
        setDayBlockMessage(dayBlock ? formatSchoolDayBlockMessage(dayBlock) : "");
        if (!result.ok) {
          setError(result.error.message);
          return;
        }
        const { attendance } = result.data;
        setRows(attendance.students);
        const saved = Boolean(attendance.session);
        setHasSaved(saved);
        setEditing(!saved);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error.generic"));
      } finally {
        finishScreenFetch({ isSchoolWorkspace, silent, setLoading });
      }
    },
    [
      workspaceId,
      classId,
      sessionDate,
      subjectName,
      isSchoolWorkspace,
      setLoading,
      t,
    ],
  );

  const showBlockingLoad = useBlockingScreenLoad(loading, rows.length > 0);
  const showFetchOverlay = useSchoolFetchOverlay(loading) && rows.length > 0;

  useEffect(() => {
    void load();
  }, [load]);

  useListMutations((event) => {
    if (event.workspaceId !== workspaceId || event.classId !== classId) return;
    if (event.type === "student-created" || event.type === "student-deleted") {
      void load(true);
    }
  });

  useRefreshOnFocus(() => {
    void load(true);
  });

  // Iklan layar penuh hanya saat keluar layar setelah menyimpan — bukan saat input.
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", () => {
      if (!savedThisVisit.current) return;
      savedThisVisit.current = false;
      void ads?.requestInterstitial("attendance_saved");
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
                  showAttendanceModuleMenu(showActionMenu, t, {
                    title: className,
                    onManageStudents: onStudents,
                    onRecap: () => onRecap(assignments),
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
    classId,
    className,
    route.params.labelColor,
    className,
    workspaceId,
    classId,
    onStudents,
    onRecap,
    onEditClass,
    isMutationLocked,
    t,
    isDark,
    showActionMenu,
    sessionDate,
    sessionFlow,
  ]);

  const setAllPresent = useCallback(() => {
    if (readOnly) return;
    setRows((prev) => prev.map((r) => ({ ...r, status: "hadir" as const })));
  }, [readOnly]);

  const setStatus = useCallback(
    (studentId: string, status: GuruAttendanceStatus) => {
      if (readOnly) return;
      setRows((prev) =>
        prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)),
      );
    },
    [readOnly],
  );

  const setNote = useCallback(
    (studentId: string, note: string) => {
      if (readOnly) return;
      setRows((prev) =>
        prev.map((r) => (r.studentId === studentId ? { ...r, note } : r)),
      );
    },
    [readOnly],
  );

  const toggleNote = useCallback(
    (studentId: string) => {
      if (readOnly) return;
      setExpandedNotes((prev) => {
        const next = new Set(prev);
        if (next.has(studentId)) next.delete(studentId);
        else next.add(studentId);
        return next;
      });
    },
    [readOnly],
  );

  const shiftDate = useCallback(
    (days: number) => {
      applySessionDate(addDaysIso(sessionDate, days));
    },
    [applySessionDate, sessionDate],
  );

  const handleDatePickerChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === "android") {
        setShowDatePicker(false);
        if (event.type === "dismissed" || !date) return;
        applySessionDate(dateToIso(date));
        return;
      }
      if (event.type === "dismissed" || !date) return;
      applySessionDate(dateToIso(date));
    },
    [applySessionDate],
  );

  const recordsPayload = useCallback(
    () =>
      rows.map((r) => ({
        studentId: r.studentId,
        status: r.status!,
        note: r.note?.trim() ? r.note.trim() : undefined,
      })),
    [rows],
  );

  const handleSave = useCallback(async () => {
    if (dayBlockMessage) {
      setError(dayBlockMessage);
      return;
    }
    if (!rows.length) {
      setError(t("attendance.noStudents"));
      return;
    }
    if (rows.some((r) => !r.status)) {
      setError(t("attendance.incompleteStatus"));
      return;
    }
    setError("");
    setMessage("");
    setSaving(true);
    const result = await apiSaveAttendance(
      workspaceId,
      classId,
      sessionDate,
      recordsPayload(),
      subjectName,
    );
    if (!result.ok) {
      setSaving(false);
      setError(result.error.message);
      return;
    }
    if (!isSchoolWorkspace) {
      const submitResult = await apiSubmitAttendance(
        workspaceId,
        classId,
        sessionDate,
        subjectName,
      );
      if (!submitResult.ok) {
        setSaving(false);
        setError(submitResult.error.message);
        return;
      }
      setRows(submitResult.data.attendance.students);
    } else {
      setRows(result.data.attendance.students);
    }
    setSaving(false);
    setHasSaved(true);
    setEditing(false);
    savedThisVisit.current = true;
    setMessage(t("attendance.saved"));
    setExpandedNotes(new Set());
    void reloadSessionProgress();
    if (sessionFlow) {
      showAfterAttendanceSavePrompt(
        showActionMenu,
        t,
        modules,
        {
          onJournal:
            modules.teachingJournal && onTeachingJournal
              ? () => onTeachingJournal(sessionDate)
              : undefined,
          onGrades:
            modules.grades && onGrades
              ? () => onGrades(sessionDate)
              : undefined,
          onStudentNotes:
            modules.studentNotes && onStudentNotes
              ? () => onStudentNotes(sessionDate)
              : undefined,
          onFinishSession: () =>
            finishSessionFlow(navigation, {
              classId,
              className,
              labelColor: route.params.labelColor,
            }),
        },
        { colors, isDark },
      );
    }
  }, [
    rows,
    t,
    workspaceId,
    classId,
    className,
    sessionDate,
    recordsPayload,
    subjectName,
    isSchoolWorkspace,
    dayBlockMessage,
    modules,
    onTeachingJournal,
    onGrades,
    onStudentNotes,
    reloadSessionProgress,
    showActionMenu,
    colors,
    isDark,
    sessionFlow,
    navigation,
    route.params.labelColor,
  ]);

  const handleStartEdit = useCallback(() => {
    setError("");
    setMessage("");
    setEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setError("");
    setMessage("");
    setExpandedNotes(new Set());
    void load(true);
  }, [load]);

  const handleNoteFocus = useCallback(
    (studentId: string) => {
      scrollToKey(studentId, { viewPosition: 0.55 });
    },
    [scrollToKey],
  );

  const renderItem = useCallback(
    ({ item }: { item: GuruAttendanceStudent }) => (
      <AttendanceStudentRow
        item={item}
        noteOpen={expandedNotes.has(item.studentId)}
        readOnly={readOnly}
        locale={locale as Locale}
        notePlaceholder={t("attendance.notePlaceholder")}
        noteToggleLabel={t("attendance.noteToggle")}
        noteHideLabel={t("attendance.noteHide")}
        statusPalette={getStatusPalette}
        onStudentDetail={onStudentDetail}
        onSetStatus={setStatus}
        onSetNote={setNote}
        onToggleNote={toggleNote}
        onNoteFocus={() => handleNoteFocus(item.studentId)}
      />
    ),
    [
      expandedNotes,
      locale,
      t,
      getStatusPalette,
      readOnly,
      onStudentDetail,
      setStatus,
      setNote,
      toggleNote,
      handleNoteFocus,
    ],
  );

  const keyExtractor = useCallback(
    (item: GuruAttendanceStudent) => item.studentId,
    [],
  );

  const hintMessage = useMemo(() => {
    if (dayBlockMessage) return dayBlockMessage;
    if (hasSaved && !editing) return t("attendance.readOnlyHint");
    if (hasSaved && editing) return t("attendance.editingHint");
    return null;
  }, [dayBlockMessage, hasSaved, editing, t]);

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
          pickerDate={isoToDate(sessionDate)}
          maxDate={isoToDate(today)}
          onPrev={() => shiftDate(-1)}
          onNext={() => shiftDate(1)}
          onTogglePicker={() => setShowDatePicker((open) => !open)}
          onGoToday={() => applySessionDate(today)}
          onDateChange={handleDatePickerChange}
        />
        {rows.length > 0 ? (
          <View style={styles.summaryRow}>
            <View style={styles.summaryChips}>
              <AttendanceStatusSummary
                rows={rows}
                locale={locale as Locale}
                compact
                nowrap
              />
            </View>
            {!readOnly ? (
              <ActionChip
                compact
                icon="check"
                label={t("attendance.setAllPresent")}
                onPress={setAllPresent}
                backgroundColor={colors.successBg}
                borderColor={colors.success}
                iconColor={colors.success}
              />
            ) : null}
          </View>
        ) : null}
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
      setAllPresent,
      hintMessage,
      font,
      colors,
      showDatePicker,
      sessionDate,
      today,
      shiftDate,
      applySessionDate,
      handleDatePickerChange,
      rows,
      locale,
      error,
      message,
      readOnly,
    ],
  );

  if (showBlockingLoad) {
    return (
      <View style={[listStyles.centered, { backgroundColor: colors.bg }]}>
        <ScreenLoadingView fill={false} />
      </View>
    );
  }

  const emptyStudents = rows.length === 0;

  return (
    <StickyScreen
      keyboardAvoiding
      footer={
        emptyStudents && !isMutationLocked ? (
          <StickyActionBar>
            <PrimaryButton
              title={t("attendance.addStudent")}
              onPress={onAddStudent}
            />
          </StickyActionBar>
        ) : emptyStudents ? null : dayBlockMessage ? null : readOnly ? (
          <StickyActionBar>
            <PrimaryButton
              title={t("attendance.edit")}
              onPress={handleStartEdit}
            />
          </StickyActionBar>
        ) : (
          <StickyActionBar>
            {hasSaved ? (
              <View style={styles.footerRow}>
                <View style={styles.footerBtn}>
                  <PrimaryButton
                    title={t("common.cancel")}
                    variant="secondary"
                    onPress={() => void handleCancelEdit()}
                  />
                </View>
                <View style={styles.footerBtn}>
                  <PrimaryButton
                    title={t("attendance.save")}
                    loading={saving}
                    onPress={() => void handleSave()}
                  />
                </View>
              </View>
            ) : (
              <PrimaryButton
                title={t("attendance.save")}
                loading={saving}
                onPress={() => void handleSave()}
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
            currentModule="attendance"
            onStepPress={onSessionStepPress}
          />
        ) : null}
        <FlatList
          ref={listRef}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            !emptyStudents && styles.listWithFooter,
          ]}
          data={rows}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          onScrollToIndexFailed={onScrollToIndexFailed}
          showsVerticalScrollIndicator
          removeClippedSubviews
          initialNumToRender={12}
          maxToRenderPerBatch={16}
          windowSize={7}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <EmptyState icon="students" message={t("attendance.noStudents")} />
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
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  summaryChips: {
    flex: 1,
    minWidth: 0,
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
