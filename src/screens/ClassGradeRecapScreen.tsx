import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
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
import { GradeRecapListFilter } from "@/components/recap/GradeRecapListFilter";
import { GradeRecapStudentRow } from "@/components/recap/GradeRecapStudentRow";
import { GradeRecapSummaryBar } from "@/components/recap/GradeRecapSummaryBar";
import { GradeRecapTable } from "@/components/recap/GradeRecapTable";
import { RecapPeriodFilter } from "@/components/recap/RecapPeriodFilter";
import { FilterPicker } from "@/components/ui/FilterPicker";
import { SegmentedChoice } from "@/components/ui/SegmentedChoice";
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
import { useWorkspaceGradePredikat } from "@/context/WorkspaceGradePredikatContext";
import {
  apiGradeMonthlyRecap,
  apiGradeSemesterRecap,
  apiGradeWeeklyRecap,
  hasCloudSubscription,
} from "@/lib/guru-repository";
import { exportAndShareGuruGradeRecap } from "@/lib/grade-export";
import {
  filterGradeRecapStudents,
  formatTaskDateShort,
  getGradeListVisibleTasks,
  getStudentGradeListMatchEntries,
  isGradeListPredikatFilterActive,
  shouldUseGradeRecapSummary,
  summarizeStudentGrades,
  countStudentGradeBands,
  type GradeListFilter,
} from "@/lib/grade-recap-display";
import { getCachedSchoolLink } from "@/lib/school-link";
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
import { useListStyles } from "@/lib/use-themed-styles";
import { useTheme } from "@/context/AppPreferencesContext";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { screen, space } from "@/lib/theme";
import { goToSettingsTab } from "@/navigation/navHelpers";
import type { AppStackParamList } from "@/navigation/types";
import type { GuruAssignment, GuruGradePeriodRecap, GuruGradeStudentRecap } from "@/lib/types";

type PeriodKind = "weekly" | "monthly" | "semester";

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  attendanceMode: "class" | "subject";
  assignments: GuruAssignment[];
  onStudentDetail?: (
    student: GuruGradeStudentRecap,
    subjectName?: string | null,
  ) => void;
};

export function ClassGradeRecapScreen({
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
  const { settings: predikatSettings, refreshSettings: refreshPredikatSettings } =
    useWorkspaceGradePredikat();
  const listStyles = useListStyles();
  const ads = useAdsOptional();

  useTranslatedScreenTitle(`${t("nav.gradeRecap")} — ${className}`);
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
  const [recap, setRecap] = useState<GuruGradePeriodRecap | null>(null);
  const [gradeView, setGradeView] = useState<"list" | "table">("list");
  const [listFilter, setListFilter] = useState<GradeListFilter>({
    query: "",
    predikat: "all",
  });

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
        result = await apiGradeWeeklyRecap(
          workspaceId,
          classId,
          weekDate,
          subjectParam(),
        );
      } else if (periodKind === "monthly") {
        result = await apiGradeMonthlyRecap(
          workspaceId,
          classId,
          month,
          subjectParam(),
        );
      } else {
        result = await apiGradeSemesterRecap(
          workspaceId,
          classId,
          semester.year,
          semester.semester,
          subjectParam(),
        );
      }
      if (!result.ok) {
        const message =
          isSchoolWorkspace &&
          (result.error.code === "network" ||
            result.error.code === "invalid_response" ||
            result.error.code === "unknown" ||
            result.error.code === "server_error")
            ? t("error.schoolGradeRecapLoadFailed")
            : result.error.message;
        setError(message);
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
    void refreshPredikatSettings();
  });

  useEffect(() => {
    if (!subscribed && periodKind === "semester") {
      setPeriodKind("weekly");
    }
  }, [subscribed, periodKind]);

  useEffect(() => {
    setGradeView("list");
    setListFilter({ query: "", predikat: "all" });
  }, [periodKind, weekDate, month, semester, subjectKey]);

  const filteredStudents = useMemo(() => {
    if (!recap) return [];
    return filterGradeRecapStudents(
      recap.students,
      recap.tasks,
      predikatSettings,
      listFilter,
    );
  }, [recap, predikatSettings, listFilter]);

  const predikatFilterActive = isGradeListPredikatFilterActive(listFilter);

  const visibleTasks = useMemo(() => {
    if (!recap) return [];
    return getGradeListVisibleTasks(
      recap.tasks,
      filteredStudents,
      predikatSettings,
      listFilter,
    );
  }, [recap, filteredStudents, predikatSettings, listFilter]);

  const filteredRecap = useMemo(() => {
    if (!recap) return null;
    return {
      ...recap,
      students: filteredStudents,
      tasks: visibleTasks,
    };
  }, [recap, filteredStudents, visibleTasks]);

  async function handleExport() {
    if (!recap) return;
    setError("");
    setExporting(true);
    try {
      const result = await exportAndShareGuruGradeRecap({
        recap,
        weekDate,
        month,
        semesterYear: semester.year,
        semesterType: semester.semester,
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

  const subjectOptions = useMemo(
    () =>
      subjectAssignments.map((a) => ({
        key: a.subjectName!,
        label: a.subjectName!,
        colorId: a.labelColor,
      })),
    [subjectAssignments],
  );

  const showSubjectFilter =
    attendanceMode === "subject" && subjectOptions.length > 0;

  const navLabel = recapNavPeriodLabel(periodKind, {
    weekDate,
    month,
    semester,
  });

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

  const useSummaryLayout =
    recap != null &&
    (predikatFilterActive ||
      shouldUseGradeRecapSummary(recap.tasks.length, periodKind));
  const showGradeViewToggle = recap != null && recap.tasks.length >= 2;

  const taskEntriesByStudent = useMemo(() => {
    if (!recap) return new Map<string, ReturnType<typeof buildGradeEntries>>();
    const map = new Map<string, ReturnType<typeof buildGradeEntries>>();
    for (const student of filteredStudents) {
      if (predikatFilterActive) {
        map.set(
          student.studentId,
          getStudentGradeListMatchEntries(
            student,
            recap.tasks,
            predikatSettings,
            listFilter,
          ).map((entry) => ({
            label: entry.title,
            score: entry.score,
            date: entry.taskDate,
            band: entry.band,
          })),
        );
      } else {
        map.set(student.studentId, buildGradeEntries(recap, student));
      }
    }
    return map;
  }, [recap, filteredStudents, predikatFilterActive, predikatSettings, listFilter]);

  const openStudentDetail = useCallback(
    (student: GuruGradeStudentRecap) => {
      onStudentDetail?.(student, subjectParam() ?? null);
    },
    [onStudentDetail, subjectKey, attendanceMode],
  );

  const renderStudent = useCallback(
    ({ item }: { item: GuruGradeStudentRecap }) => {
      if (!recap) return null;
      return (
        <GradeRecapStudentRow
          fullName={item.fullName}
          studentNumber={item.studentNumber}
          entries={taskEntriesByStudent.get(item.studentId) ?? []}
          summary={
            useSummaryLayout
              ? summarizeStudentGrades(item, recap.tasks)
              : null
          }
          bandCounts={
            useSummaryLayout && !predikatFilterActive
              ? countStudentGradeBands(item, recap.tasks, predikatSettings)
              : null
          }
          predikatSettings={predikatSettings}
          entryListMode={predikatFilterActive}
          onPress={onStudentDetail ? () => openStudentDetail(item) : undefined}
        />
      );
    },
    [
      recap,
      taskEntriesByStudent,
      useSummaryLayout,
      onStudentDetail,
      openStudentDetail,
      predikatSettings,
      predikatFilterActive,
    ],
  );

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        void load(true);
      }}
      tintColor={colors.primary}
    />
  );

  const listHeader = recap ? (
    <>
      <GradeRecapSummaryBar
        recap={recap}
        predikatSettings={predikatSettings}
        metaLabel={t("grades.recapMetaSummary", {
          students: recap.students.length,
          tasks: recap.tasks.length,
        })}
      />
      <GradeRecapListFilter
        collapsible
        inline
        settings={predikatSettings}
        value={listFilter}
        onChange={setListFilter}
        resultCount={filteredStudents.length}
        totalCount={recap.students.length}
      />
    </>
  ) : null;

  const gradeViewToggle = showGradeViewToggle ? (
    <SegmentedChoice
      minimal
      options={[
        { key: "list", label: t("grades.recapViewList") },
        { key: "table", label: t("grades.recapViewTable") },
      ]}
      value={gradeView}
      onChange={(key) => setGradeView(key as "list" | "table")}
    />
  ) : null;

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
            weekDate={weekDate}
            onWeekDateChange={setWeekDate}
            month={month}
            onMonthChange={setMonth}
            maxDate={today}
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
          {gradeViewToggle}
          <ErrorBanner message={error} />
        </View>

        {showBlockingLoad ? (
          <ScreenLoadingView />
        ) : (
          <View style={styles.contentArea}>
            {gradeView === "table" && filteredRecap && filteredRecap.tasks.length >= 2 ? (
              <ScrollView
                style={listStyles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator
                refreshControl={refreshControl}
              >
                {listHeader}
                {filteredStudents.length === 0 ? (
                  <EmptyState icon="gradeRecap" message={t("grades.listEmpty")} />
                ) : (
                  <GradeRecapTable
                    recap={filteredRecap}
                    predikatSettings={predikatSettings}
                    onStudentPress={onStudentDetail ? openStudentDetail : undefined}
                  />
                )}
              </ScrollView>
            ) : (
              <FlatList
                style={listStyles.list}
                contentContainerStyle={styles.listContent}
                data={filteredStudents}
                keyExtractor={(item) => item.studentId}
                showsVerticalScrollIndicator
                refreshControl={refreshControl}
                removeClippedSubviews
                initialNumToRender={14}
                maxToRenderPerBatch={20}
                windowSize={8}
                ListHeaderComponent={listHeader}
                renderItem={renderStudent}
                ListEmptyComponent={
                  <EmptyState
                    icon="gradeRecap"
                    message={
                      recap && recap.students.length > 0
                        ? t("grades.listEmpty")
                        : t("grades.recapEmpty")
                    }
                  />
                }
              />
            )}
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
});

function buildGradeEntries(
  recap: GuruGradePeriodRecap,
  item: GuruGradeStudentRecap,
) {
  return recap.tasks
    .map((task) => {
      const score = item.scores[task.taskId]?.trim();
      if (!score) return null;
      return { label: task.title, score, date: task.taskDate };
    })
    .filter(Boolean) as { label: string; score: string; date: string }[];
}
