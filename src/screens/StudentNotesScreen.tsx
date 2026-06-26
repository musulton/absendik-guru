import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AttendanceSessionHeader } from "@/components/attendance/AttendanceSessionHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { OkBanner } from "@/components/ui/OkBanner";
import { ScreenHint } from "@/components/ui/ScreenHint";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { StudentProfileHeader } from "@/components/ui/StudentProfileHeader";
import { StudentNoteOptionPicker } from "@/components/student-notes/StudentNoteOptionPicker";
import { useTheme } from "@/context/AppPreferencesContext";
import { useActionMenu } from "@/context/ActionMenuContext";
import { apiCreateStudentNote } from "@/lib/guru-repository";
import {
  addDaysIso,
  dateToIso,
  formatDateDisplay,
  isoToDate,
  todayInTimezone,
  todayJakarta,
  todayLocalDevice,
} from "@/lib/dates";
import { getCachedSchoolLink } from "@/lib/school-link";
import { SessionProgressStrip } from "@/components/session/SessionProgressStrip";
import { useSessionProgress } from "@/hooks/useSessionProgress";
import { useSessionStepPress } from "@/hooks/useSessionStepPress";
import { useWorkspaceModules } from "@/context/WorkspaceModulesContext";
import { showStudentNotesModuleMenu } from "@/navigation/classDetailMenu";
import { showAfterStudentNoteSavePrompt } from "@/navigation/sessionFlow";
import { finishSessionFlow } from "@/navigation/sessionStepNav";
import type { HomeStackParamList } from "@/navigation/types";
import { useWorkspace } from "@/context/WorkspaceContext";
import type { Locale, TranslationKey } from "@/lib/i18n/translations";
import {
  presetCategory,
  type GuruStudentNotePresetKey,
} from "@/lib/student-note-presets";
import { radius, space } from "@/lib/theme";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { ErrorBanner } from "@/components/ErrorBanner";

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  studentId: string;
  fullName: string;
  studentNumber: string;
  onManageStudents?: () => void;
  onEditClass?: () => void;
};

export function StudentNotesScreen({
  workspaceId,
  classId,
  className,
  studentId,
  fullName,
  studentNumber,
  onManageStudents,
  onEditClass,
}: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, "StudentNotes">>();
  const { showActionMenu } = useActionMenu();
  const { modules } = useWorkspaceModules();
  const { colors, font, t, locale } = useTheme();
  const { isSchoolWorkspace, isLocalArchiveWorkspace } = useWorkspace();
  const today = useMemo(() => {
    const schoolTimezone = getCachedSchoolLink()?.timezone;
    if (isSchoolWorkspace && schoolTimezone) {
      return todayInTimezone(schoolTimezone);
    }
    if (isLocalArchiveWorkspace) return todayLocalDevice();
    return todayJakarta();
  }, [isSchoolWorkspace, isLocalArchiveWorkspace]);
  const initialDate = route.params.sessionDate ?? today;
  const subjectName = route.params.subjectName ?? null;
  const labelColor = route.params.labelColor;
  const sessionFlow = route.params.sessionFlow === true;

  const [noteDate, setNoteDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isToday = noteDate === today;
  const dateLabel = useMemo(
    () => formatDateDisplay(noteDate, locale as Locale),
    [noteDate, locale],
  );

  const { progress } = useSessionProgress(
    workspaceId,
    classId,
    noteDate,
    subjectName,
  );
  const onSessionStepPress = useSessionStepPress({
    classId,
    className,
    labelColor,
    subjectName,
    sessionDate: noteDate,
    sessionFlow,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedPresets, setSelectedPresets] = useState<
    Set<GuruStudentNotePresetKey>
  >(() => new Set());
  const [otherSelected, setOtherSelected] = useState(false);
  const [otherText, setOtherText] = useState("");

  useTranslatedScreenTitle(fullName);

  const applyNoteDate = useCallback((next: string) => {
    setNoteDate(next);
    setShowDatePicker(false);
  }, []);

  const togglePreset = useCallback((preset: GuruStudentNotePresetKey) => {
    setSelectedPresets((prev) => {
      const next = new Set(prev);
      if (next.has(preset)) next.delete(preset);
      else next.add(preset);
      return next;
    });
    setError("");
  }, []);

  const toggleOther = useCallback(() => {
    setOtherSelected((prev) => !prev);
    setError("");
  }, []);

  function resetForm() {
    setSelectedPresets(new Set());
    setOtherSelected(false);
    setOtherText("");
  }

  async function handleSave() {
    const presets = [...selectedPresets];
    const hasPresets = presets.length > 0;
    const hasOther = otherSelected && otherText.trim().length > 0;

    if (!hasPresets && !otherSelected) {
      setError(t("studentNotes.selectRequired"));
      return;
    }
    if (otherSelected && !otherText.trim()) {
      setError(t("studentNotes.otherRequired"));
      return;
    }
    if (!hasPresets && !hasOther) {
      setError(t("studentNotes.selectRequired"));
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    for (const preset of presets) {
      const result = await apiCreateStudentNote(
        workspaceId,
        classId,
        studentId,
        {
          category: presetCategory(preset),
          presetKey: preset,
          noteText: "",
          noteDate,
        },
      );
      if (!result.ok) {
        setSaving(false);
        setError(result.error.message);
        return;
      }
    }

    if (hasOther) {
      const result = await apiCreateStudentNote(
        workspaceId,
        classId,
        studentId,
        {
          category: "other",
          presetKey: null,
          noteText: otherText,
          noteDate,
        },
      );
      if (!result.ok) {
        setSaving(false);
        setError(result.error.message);
        return;
      }
    }

    setSaving(false);
    resetForm();
    setMessage(t("studentNotes.saved"));
    if (sessionFlow) {
      showAfterStudentNoteSavePrompt(showActionMenu, t, {
        onAnotherStudent: () => navigation.goBack(),
        onFinishSession: () =>
          finishSessionFlow(navigation, {
            classId,
            className,
            labelColor,
          }),
      });
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderActions
          actions={[
            {
              icon: "more",
              onPress: () => {
                showStudentNotesModuleMenu(showActionMenu, t, {
                  title: fullName,
                  onManageStudents:
                    onManageStudents ?? (() => navigation.goBack()),
                  onEditClass,
                });
              },
            },
          ]}
        />
      ),
    });
  }, [
    navigation,
    fullName,
    showActionMenu,
    t,
    onManageStudents,
    onEditClass,
  ]);

  return (
    <StickyScreen
      footer={
        <StickyActionBar>
          <PrimaryButton
            title={t("studentNotes.save")}
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
            currentModule="studentNotes"
            onStepPress={onSessionStepPress}
          />
        ) : null}
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.bg }}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <StudentProfileHeader
            className={className}
            fullName={fullName}
            studentNumber={studentNumber || null}
          />
          <AttendanceSessionHeader
            className={className}
            subjectName={subjectName}
            isToday={isToday}
            dateLabel={dateLabel}
            todayPrefix={t("attendance.today")}
            goTodayLabel={t("attendance.goToday")}
            showDatePicker={showDatePicker}
            pickerDate={isoToDate(noteDate)}
            maxDate={isoToDate(today)}
            onPrev={() => applyNoteDate(addDaysIso(noteDate, -1))}
            onNext={() => applyNoteDate(addDaysIso(noteDate, 1))}
            onTogglePicker={() => setShowDatePicker((v) => !v)}
            onGoToday={() => applyNoteDate(today)}
            onDateChange={(event: DateTimePickerEvent, date?: Date) => {
              if (event.type === "dismissed") {
                setShowDatePicker(false);
                return;
              }
              if (date) applyNoteDate(dateToIso(date));
            }}
          />
          <ScreenHint>{t("studentNotes.hint")}</ScreenHint>
          <ErrorBanner message={error} />
          {message ? <OkBanner message={message} /> : null}
          <SectionLabel title={t("studentNotes.addSection")} />
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                font.label,
                { color: colors.text, marginBottom: space.sm },
              ]}
            >
              {t("studentNotes.optionLabel")}
            </Text>
            <StudentNoteOptionPicker
              selectedPresets={selectedPresets}
              otherText={otherText}
              otherSelected={otherSelected}
              onTogglePreset={togglePreset}
              onToggleOther={toggleOther}
              onOtherTextChange={setOtherText}
              t={t as (key: TranslationKey) => string}
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
  formCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.md,
  },
});
