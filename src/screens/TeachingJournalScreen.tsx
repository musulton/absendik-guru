import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AttendanceSessionHeader } from "@/components/attendance/AttendanceSessionHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FormField } from "@/components/ui/FormField";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { OkBanner } from "@/components/ui/OkBanner";
import { ScreenHint } from "@/components/ui/ScreenHint";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useTheme } from "@/context/AppPreferencesContext";
import { useActionMenu } from "@/context/ActionMenuContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import {
  useBlockingScreenLoad,
  useFetchLoadingState,
  shouldShowFetchLoading,
  finishScreenFetch,
} from "@/hooks/useBlockingScreenLoad";
import { ScreenLoadingView } from "@/components/ui/ScreenLoadingView";
import {
  apiGetTeachingJournal,
  apiListAssignments,
  apiSaveTeachingJournal,
} from "@/lib/guru-repository";
import {
  addDaysIso,
  dateToIso,
  formatDateDisplay,
  isoToDate,
  isFutureIsoDate,
  todayJakarta,
  todayLocalDevice,
} from "@/lib/dates";
import type { Locale } from "@/lib/i18n/translations";
import { space } from "@/lib/theme";
import type { GuruAssignment } from "@/lib/types";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { SessionProgressStrip } from "@/components/session/SessionProgressStrip";
import { useWorkspaceModules } from "@/context/WorkspaceModulesContext";
import { useSessionProgress } from "@/hooks/useSessionProgress";
import { useSessionStepPress } from "@/hooks/useSessionStepPress";
import { showTeachingJournalModuleMenu } from "@/navigation/classDetailMenu";
import { showAfterJournalSavePrompt } from "@/navigation/sessionFlow";
import { finishSessionFlow } from "@/navigation/sessionStepNav";
import type { HomeStackParamList } from "@/navigation/types";

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  subjectName?: string | null;
  initialSessionDate?: string;
  onAttendance: (sessionDate: string) => void;
  onGrades: (sessionDate: string) => void;
  onStudents: () => void;
  onStudentNotes?: (sessionDate: string) => void;
  onJournalRecap?: (assignments: GuruAssignment[]) => void;
  onEditClass?: () => void;
};

export function TeachingJournalScreen({
  workspaceId,
  classId,
  className,
  subjectName,
  initialSessionDate,
  onAttendance,
  onGrades,
  onStudents,
  onStudentNotes,
  onJournalRecap,
  onEditClass,
}: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, "TeachingJournal">>();
  const { showActionMenu } = useActionMenu();
  const { modules } = useWorkspaceModules();
  const { colors, t, locale, isDark } = useTheme();
  const { isSchoolWorkspace, isLocalArchiveWorkspace } = useWorkspace();
  const isMutationLocked = isSchoolWorkspace || isLocalArchiveWorkspace;
  const today = isLocalArchiveWorkspace ? todayLocalDevice() : todayJakarta();
  const [sessionDate, setSessionDate] = useState(initialSessionDate ?? today);
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
  const [material, setMaterial] = useState("");
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");

  const isToday = sessionDate === today;
  const dateLabel = useMemo(
    () => formatDateDisplay(sessionDate, locale as Locale),
    [sessionDate, locale],
  );
  const screenTitle = subjectName
    ? `${t("nav.teachingJournal")} — ${subjectName}`
    : t("nav.teachingJournal");

  useTranslatedScreenTitle(screenTitle);

  const applySessionDate = useCallback(
    (nextDate: string) => {
      if (isFutureIsoDate(nextDate, today)) {
        setError(t("attendance.notFuture"));
        return;
      }
      setError("");
      setMessage("");
      setSessionDate(nextDate);
      setShowDatePicker(false);
    },
    [today, t],
  );

  const load = useCallback(async (silent?: boolean) => {
    setError("");
    if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(true);
    try {
      const res = await apiGetTeachingJournal(
        workspaceId,
        classId,
        sessionDate,
        subjectName,
      );
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      const entry = res.data.journal.entry;
      setMaterial(entry?.material ?? "");
      setMethod(entry?.method ?? "");
      setNotes(entry?.notes ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
    } finally {
      finishScreenFetch({ isSchoolWorkspace, silent, setLoading });
    }
  }, [workspaceId, classId, sessionDate, subjectName, isSchoolWorkspace, setLoading, t]);

  const showBlockingLoad = useBlockingScreenLoad(loading, Boolean(material || method || notes));

  useEffect(() => {
    void load();
  }, [load]);

  useRefreshOnFocus(() => {
    void load(true);
  });

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
                  showTeachingJournalModuleMenu(showActionMenu, t, {
                    title: className,
                    onManageStudents: onStudents,
                    onJournalRecap: onJournalRecap
                      ? () => onJournalRecap(assignments)
                      : undefined,
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
    onJournalRecap,
    onEditClass,
    isMutationLocked,
    t,
    isDark,
    showActionMenu,
  ]);

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");
    const result = await apiSaveTeachingJournal(
      workspaceId,
      classId,
      sessionDate,
      { material, method, notes },
      subjectName,
    );
    setSaving(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setMessage(t("teachingJournal.saved"));
    void reloadSessionProgress();
    if (sessionFlow) {
      showAfterJournalSavePrompt(
        showActionMenu,
        t,
        modules,
        {
          onGrades: modules.grades ? () => onGrades(sessionDate) : undefined,
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
  }

  if (showBlockingLoad) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenLoadingView />
      </View>
    );
  }

  return (
    <StickyScreen
      footer={
        <StickyActionBar>
          <PrimaryButton
            title={t("common.save")}
            loading={saving}
            onPress={() => void handleSave()}
          />
        </StickyActionBar>
      }
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {sessionFlow ? (
          <SessionProgressStrip
            progress={progress}
            pinned
            currentModule="teachingJournal"
            onStepPress={onSessionStepPress}
          />
        ) : null}
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
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
            onPrev={() => applySessionDate(addDaysIso(sessionDate, -1))}
            onNext={() => applySessionDate(addDaysIso(sessionDate, 1))}
            onTogglePicker={() => setShowDatePicker((v) => !v)}
            onGoToday={() => applySessionDate(today)}
            onDateChange={(event: DateTimePickerEvent, date?: Date) => {
              if (event.type === "dismissed") {
                setShowDatePicker(false);
                return;
              }
              if (date) applySessionDate(dateToIso(date));
            }}
          />
          <ScreenHint>{t("teachingJournal.hint")}</ScreenHint>
          <ErrorBanner message={error} />
          {message ? <OkBanner message={message} /> : null}
          <View style={styles.form}>
            <FormField
              label={t("teachingJournal.material")}
              value={material}
              onChangeText={setMaterial}
              placeholder={t("teachingJournal.materialPlaceholder")}
              multiline
            />
            <FormField
              label={t("teachingJournal.method")}
              value={method}
              onChangeText={setMethod}
              placeholder={t("teachingJournal.methodPlaceholder")}
              multiline
            />
            <FormField
              label={t("teachingJournal.notes")}
              value={notes}
              onChangeText={setNotes}
              placeholder={t("teachingJournal.notesPlaceholder")}
              multiline
              style={styles.notesInput}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </StickyScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space.md,
    gap: space.sm,
    paddingBottom: space.xl,
  },
  form: { gap: space.md, marginTop: space.sm },
  notesInput: { minHeight: 96, textAlignVertical: "top" },
});
