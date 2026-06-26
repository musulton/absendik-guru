import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AdFooterStack } from "@/components/ads/AdFooterStack";
import { ErrorBanner } from "@/components/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterPicker } from "@/components/ui/FilterPicker";
import { PrimaryButton } from "@/components/PrimaryButton";
import { JournalRecapEntryRow } from "@/components/recap/JournalRecapEntryRow";
import { RecapPeriodFilter } from "@/components/recap/RecapPeriodFilter";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useAdsOptional } from "@/context/AdContext";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import {
  useBlockingScreenLoad,
  useFetchLoadingState,
  shouldShowFetchLoading,
  finishScreenFetch,
} from "@/hooks/useBlockingScreenLoad";
import { ScreenLoadingView } from "@/components/ui/ScreenLoadingView";
import { useWorkspace } from "@/context/WorkspaceContext";
import { apiTeachingJournalRecap, hasCloudSubscription } from "@/lib/guru-repository";
import {
  recapNavPeriodLabel,
  recapPeriodRange,
  type RecapPeriodKind,
} from "@/lib/recap-period-label";
import {
  currentSemester,
  nextSemester,
  prevSemester,
  type SemesterValue,
} from "@/lib/period-range";
import {
  addDaysIso,
  addMonthsYyyymm,
  currentMonthInTimezone,
  currentMonthJakarta,
  todayInTimezone,
  todayJakarta,
} from "@/lib/dates";
import { getCachedSchoolLink } from "@/lib/school-link";
import { exportAndShareGuruJournalRecap } from "@/lib/journal-export";
import { goToSettingsTab } from "@/navigation/navHelpers";
import type { HomeStackParamList } from "@/navigation/types";
import { useListStyles } from "@/lib/use-themed-styles";
import { useTheme } from "@/context/AppPreferencesContext";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { space } from "@/lib/theme";
import type { GuruAssignment, GuruTeachingJournalRecap } from "@/lib/types";

type PeriodKind = RecapPeriodKind;

type Nav = NativeStackNavigationProp<HomeStackParamList>;

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  attendanceMode: "class" | "subject";
  assignments: GuruAssignment[];
};

export function ClassTeachingJournalRecapScreen({
  workspaceId,
  classId,
  className,
  attendanceMode,
  assignments,
}: Props) {
  const navigation = useNavigation<Nav>();
  const ads = useAdsOptional();
  const { colors, font, t } = useTheme();
  const { isSchoolWorkspace } = useWorkspace();
  const listStyles = useListStyles();

  useTranslatedScreenTitle(`${t("nav.journalRecap")} — ${className}`);
  const schoolTimezone = getCachedSchoolLink()?.timezone;
  const today =
    isSchoolWorkspace && schoolTimezone
      ? todayInTimezone(schoolTimezone)
      : todayJakarta();
  const initialMonth =
    isSchoolWorkspace && schoolTimezone
      ? currentMonthInTimezone(schoolTimezone)
      : currentMonthJakarta();
  const [subscribed, setSubscribed] = useState(false);
  const [periodKind, setPeriodKind] = useState<PeriodKind>("weekly");
  const [weekDate, setWeekDate] = useState(today);
  const [month, setMonth] = useState(initialMonth);
  const [semester, setSemester] = useState<SemesterValue>(currentSemester());
  const subjectAssignments = assignments.filter((a) => a.subjectName);
  const [subjectKey, setSubjectKey] = useState<string>(() => {
    if (attendanceMode !== "subject") return "";
    return subjectAssignments[0]?.subjectName ?? "";
  });
  const [loading, setLoading] = useFetchLoadingState();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [recap, setRecap] = useState<GuruTeachingJournalRecap | null>(null);

  useEffect(() => {
    void hasCloudSubscription().then(setSubscribed);
  }, []);

  const periodOptions = subscribed
    ? [
        { key: "weekly", label: t("recap.segmentWeekly") },
        { key: "monthly", label: t("recap.segmentMonthly") },
        { key: "semester", label: t("recap.segmentSemester") },
      ]
    : [
        { key: "weekly", label: t("recap.segmentWeekly") },
        { key: "monthly", label: t("recap.segmentMonthly") },
      ];

  const subjectParam = (): string | null | undefined => {
    if (attendanceMode === "class") return undefined;
    if (!subjectKey) return undefined;
    return subjectKey;
  };

  const load = useCallback(async (silent?: boolean) => {
    if (attendanceMode === "subject" && !subjectKey) {
      setLoading(false);
      setRefreshing(false);
      setRecap(null);
      setError(t("recap.needSubject"));
      return;
    }

    setError("");
    if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(true);
    try {
      const range = recapPeriodRange(periodKind, { weekDate, month, semester });
      const result = await apiTeachingJournalRecap(workspaceId, classId, {
        ...range,
        subjectName: subjectParam(),
      });
      if (!result.ok) {
        setError(result.error.message);
        setRecap(null);
        return;
      }
      setRecap(result.data.recap);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
      setRecap(null);
    } finally {
      finishScreenFetch({
        isSchoolWorkspace,
        silent,
        setLoading,
        setRefreshing,
      });
    }
  }, [
    workspaceId,
    classId,
    periodKind,
    weekDate,
    month,
    semester,
    subjectKey,
    attendanceMode,
    isSchoolWorkspace,
    t,
    setLoading,
  ]);

  const showBlockingLoad = useBlockingScreenLoad(loading, recap != null);

  useEffect(() => {
    void load();
  }, [load]);

  useRefreshOnFocus(() => {
    void load(true);
  });

  useEffect(() => {
    if (!subscribed && periodKind === "semester") {
      setPeriodKind("weekly");
    }
  }, [subscribed, periodKind]);

  async function handleExport() {
    if (!recap) return;
    setError("");
    setExporting(true);
    try {
      const result = await exportAndShareGuruJournalRecap({
        className,
        recap,
        periodType: periodKind,
        showSubjectColumn: attendanceMode === "class",
        weekDate,
        month,
        semesterYear: semester.year,
        semesterType: semester.semester,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      void ads?.requestInterstitial("recap_export");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("export.createFileFailed"),
      );
    } finally {
      setExporting(false);
    }
  }

  const periodLabel = recapNavPeriodLabel(periodKind, { weekDate, month, semester });
  const summaryText = recap
    ? t("journalRecap.sessionsRecorded", { count: recap.totalSessions })
    : null;

  const subjectOptions = subjectAssignments.map((a) => ({
    key: a.subjectName!,
    label: a.subjectName!,
    colorId: a.labelColor,
  }));

  const shiftPeriod = (direction: -1 | 1) => {
    if (periodKind === "weekly") {
      setWeekDate((d) => addDaysIso(d, direction * 7));
      return;
    }
    if (periodKind === "monthly") {
      setMonth((m) => addMonthsYyyymm(m, direction));
      return;
    }
    setSemester((s) => (direction < 0 ? prevSemester(s) : nextSemester(s)));
  };

  const renderItem = useCallback(
    ({ item }: { item: GuruTeachingJournalRecap["entries"][number] }) => (
      <JournalRecapEntryRow
        entry={item}
        showSubject={attendanceMode === "class"}
      />
    ),
    [attendanceMode],
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
          placement="recap"
          onUpgrade={() => goToSettingsTab(navigation)}
          actions={
            recap ? (
              <PrimaryButton
                title={t("grades.exportExcel")}
                size="compact"
                loading={exporting}
                onPress={() => void handleExport()}
              />
            ) : undefined
          }
        />
      }
    >
      <View style={[styles.page, { backgroundColor: colors.bg }]}>
        <View style={styles.header}>
          <RecapPeriodFilter
            periodKind={periodKind}
            onPeriodKindChange={setPeriodKind}
            periodOptions={periodOptions}
            navLabel={periodLabel}
            onPrev={() => shiftPeriod(-1)}
            onNext={() => shiftPeriod(1)}
            weekDate={weekDate}
            onWeekDateChange={setWeekDate}
            month={month}
            onMonthChange={setMonth}
            maxDate={today}
            subjectFilter={
              attendanceMode === "subject" && subjectOptions.length > 0 ? (
                <FilterPicker
                  inline
                  dense
                  label={t("recap.subjectLabel")}
                  modalTitle={t("recap.chooseSubject")}
                  options={subjectOptions}
                  value={subjectKey}
                  onChange={setSubjectKey}
                />
              ) : null
            }
          />
          <ErrorBanner message={error} />
          {summaryText ? (
            <Text
              style={[
                font.caption,
                styles.summary,
                { color: colors.textMuted, fontWeight: "600" },
              ]}
            >
              {summaryText}
            </Text>
          ) : null}
        </View>
        <FlatList
          style={listStyles.list}
          contentContainerStyle={[listStyles.listContent, styles.listContent]}
          data={recap?.entries ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load(true);
              }}
            />
          }
          ListEmptyComponent={
            <EmptyState icon="journal" message={t("journalRecap.empty")} />
          }
        />
      </View>
    </StickyScreen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  header: {
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    gap: space.sm,
    flexShrink: 0,
  },
  summary: { marginBottom: space.xs },
  listContent: { paddingTop: 0 },
});
