import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AdFooterStack } from "@/components/ads/AdFooterStack";
import { ErrorBanner } from "@/components/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AttendanceRecapTable } from "@/components/recap/AttendanceRecapTable";
import { RecapPeriodFilter } from "@/components/recap/RecapPeriodFilter";
import { RecapSummaryBar } from "@/components/recap/RecapSummaryBar";
import { FilterPicker } from "@/components/ui/FilterPicker";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import {
  useBlockingScreenLoad,
  useFetchLoadingState,
  useSchoolFetchOverlay,
  shouldShowFetchLoading,
  finishScreenFetch,
} from "@/hooks/useBlockingScreenLoad";
import { FetchLoadingOverlay } from "@/components/ui/FetchLoadingOverlay";
import { ScreenLoadingView } from "@/components/ui/ScreenLoadingView";
import { useAdsOptional } from "@/context/AdContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  apiMonthlyRecap,
  apiSemesterRecap,
  apiWeeklyRecap,
  hasCloudSubscription,
} from "@/lib/guru-repository";
import { exportAndShareGuruRecap } from "@/lib/recap-export";
import { recapNavPeriodLabel } from "@/lib/recap-period-label";
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
import { useListStyles } from "@/lib/use-themed-styles";
import { useTheme } from "@/context/AppPreferencesContext";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { screen, space } from "@/lib/theme";
import { goToSettingsTab } from "@/navigation/navHelpers";
import type { AppStackParamList } from "@/navigation/types";
import type {
  GuruAssignment,
  GuruPeriodRecap,
  GuruPeriodStudentRecap,
} from "@/lib/types";

type PeriodKind = "weekly" | "monthly" | "semester";

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  attendanceMode: "class" | "subject";
  assignments: GuruAssignment[];
  onStudentDetail?: (
    student: GuruPeriodStudentRecap,
    subjectName?: string | null,
  ) => void;
};

export function ClassRecapScreen({
  workspaceId,
  classId,
  className,
  attendanceMode,
  assignments,
  onStudentDetail,
}: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { colors, t } = useTheme();
  const { isSchoolWorkspace } = useWorkspace();
  const listStyles = useListStyles();

  useTranslatedScreenTitle(`${t("nav.recap")} — ${className}`);
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
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [recap, setRecap] = useState<GuruPeriodRecap | null>(null);
  const ads = useAdsOptional();

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
      let result;
      if (periodKind === "weekly") {
        result = await apiWeeklyRecap(
          workspaceId,
          classId,
          weekDate,
          subjectParam(),
        );
      } else if (periodKind === "monthly") {
        result = await apiMonthlyRecap(
          workspaceId,
          classId,
          month,
          subjectParam(),
        );
      } else {
        result = await apiSemesterRecap(
          workspaceId,
          classId,
          semester.year,
          semester.semester,
          subjectParam(),
        );
      }
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
  const showFetchOverlay = useSchoolFetchOverlay(loading) && recap != null;

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
      const result = await exportAndShareGuruRecap({
        workspaceId,
        classId,
        recap,
        weekDate,
        month,
        semesterYear: semester.year,
        semesterType: semester.semester,
        academicStartYear: 0,
        subjectName: subjectParam(),
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

  const subjectOptions = subjectAssignments.map((a) => ({
    key: a.subjectName!,
    label: a.subjectName!,
    colorId: a.labelColor,
  }));

  const navLabel = recapNavPeriodLabel(periodKind, {
    weekDate,
    month,
    semester,
  });

  const showActions = Boolean(recap);
  const showSubjectFilter =
    attendanceMode === "subject" && subjectOptions.length > 0;

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

  const listHeader = recap ? (
    <RecapSummaryBar
      recap={recap}
      metaLabel={t("recap.metaSummary", {
        students: recap.students.length,
        days: recap.daysRecorded,
      })}
    />
  ) : null;

  const openStudentDetail = useCallback(
    (student: GuruPeriodStudentRecap) => {
      onStudentDetail?.(student, subjectParam() ?? null);
    },
    [onStudentDetail, subjectKey, attendanceMode],
  );

  return (
    <StickyScreen
      footer={
        <AdFooterStack
          placement="recap"
          onUpgrade={() => goToSettingsTab(navigation)}
          actions={
            showActions ? (
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
      <View style={styles.page}>
        <View
          style={[
            styles.stickyFilters,
            {
              backgroundColor: colors.bg,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <RecapPeriodFilter
            periodKind={periodKind}
            onPeriodKindChange={setPeriodKind}
            periodOptions={periodOptions}
            navLabel={navLabel}
            onPrev={() => shiftPeriod(-1)}
            onNext={() => shiftPeriod(1)}
            subjectFilter={
              showSubjectFilter ? (
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
        </View>

        {showBlockingLoad ? (
          <ScreenLoadingView />
        ) : (
          <View style={styles.contentArea}>
            <ScrollView
              style={listStyles.list}
              contentContainerStyle={[
                styles.listContent,
                showActions && styles.listWithFooter,
              ]}
              showsVerticalScrollIndicator
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
            >
              {listHeader}
              {recap && recap.students.length > 0 ? (
                <AttendanceRecapTable
                  recap={recap}
                  onStudentPress={
                    onStudentDetail ? openStudentDetail : undefined
                  }
                />
              ) : (
                <EmptyState
                  icon="recap"
                  title={t("recap.emptyTitle")}
                  message={
                    periodKind === "weekly"
                      ? t("recap.emptyWeekly")
                      : periodKind === "monthly"
                        ? t("recap.emptyMonthly")
                        : t("recap.emptySemester")
                  }
                />
              )}
            </ScrollView>
            <FetchLoadingOverlay visible={showFetchOverlay} />
          </View>
        )}
      </View>
    </StickyScreen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, minHeight: 0 },
  stickyFilters: {
    flexShrink: 0,
    gap: 4,
    paddingHorizontal: screen.contentPadding,
    paddingTop: space.xs,
    paddingBottom: space.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentArea: {
    flex: 1,
    minHeight: 0,
    position: "relative",
  },
  listContent: {
    paddingHorizontal: screen.contentPadding,
    paddingTop: space.xs,
    paddingBottom: 16,
    flexGrow: 1,
  },
  listWithFooter: { paddingBottom: space.xs },
});
