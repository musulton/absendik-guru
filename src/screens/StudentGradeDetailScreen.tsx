import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ErrorBanner } from "@/components/ErrorBanner";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AccentCard } from "@/components/ui/AccentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenLoadingView } from "@/components/ui/ScreenLoadingView";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { StudentDetailSummaryBar } from "@/components/ui/StudentDetailSummaryBar";
import { StudentProfileHeader } from "@/components/ui/StudentProfileHeader";
import { useTheme } from "@/context/AppPreferencesContext";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import {
  useFetchLoadingState,
  shouldShowFetchLoading,
} from "@/hooks/useBlockingScreenLoad";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useWorkspaceGradePredikat } from "@/context/WorkspaceGradePredikatContext";
import { apiGetStudentGradeDetail } from "@/lib/guru-repository";
import { formatDateId } from "@/lib/dates";
import { exportAndShareStudentGradeDetail } from "@/lib/grade-export";
import {
  countGradeBandsFromRecords,
  DEFAULT_GRADE_PREDIKAT,
  formatGradeBandCounts,
  getGradeScorePalette,
  type SchoolGradePredikatSettings,
} from "@/lib/grade-recap-display";
import { useListStyles } from "@/lib/use-themed-styles";
import { radius, space } from "@/lib/theme";
import type { GuruStudentGradeRecord } from "@/lib/types";

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  studentId: string;
  fullName: string;
  studentNumber: string;
  subjectName?: string | null;
};

const GradeRecordRow = memo(function GradeRecordRow({
  record,
  predikatSettings = DEFAULT_GRADE_PREDIKAT,
}: {
  record: GuruStudentGradeRecord;
  predikatSettings?: SchoolGradePredikatSettings;
}) {
  const { colors, font, scale } = useTheme();
  const textStyles = useMemo(
    () => ({
      title: { fontWeight: "700" as const, fontSize: scale(12) },
      scoreText: { fontSize: scale(12), fontWeight: "700" as const },
    }),
    [scale],
  );
  const score = record.score?.trim();
  const palette = getGradeScorePalette(score, predikatSettings);

  return (
    <AccentCard
      accentColor={palette?.text ?? colors.border}
      tintColor={palette?.bg}
      style={styles.recordOuter}
      contentStyle={styles.recordBody}
    >
      <View style={styles.recordMain}>
        <View style={styles.titleWrap}>
          <Text style={[font.caption, textStyles.title]} numberOfLines={1}>
            {record.title}
          </Text>
          <Text style={[font.caption, { color: colors.textMuted }]}>
            {formatDateId(record.taskDate)}
          </Text>
        </View>
        <View
          style={[
            styles.scoreBadge,
            {
              backgroundColor: palette?.bg ?? colors.bg,
              borderColor: palette?.text ?? colors.border,
            },
          ]}
        >
          <Text
            style={[
              textStyles.scoreText,
              { color: palette?.text ?? colors.textMuted },
            ]}
          >
            {score || "—"}
          </Text>
        </View>
      </View>
    </AccentCard>
  );
});

export function StudentGradeDetailScreen({
  workspaceId,
  classId,
  className,
  studentId,
  fullName,
  studentNumber,
  subjectName,
}: Props) {
  const { colors, t } = useTheme();
  const { isSchoolWorkspace } = useWorkspace();
  const { settings: predikatSettings } = useWorkspaceGradePredikat();
  const listStyles = useListStyles();
  const [loading, setLoading] = useFetchLoadingState();
  const [error, setError] = useState("");
  const [records, setRecords] = useState<GuruStudentGradeRecord[]>([]);
  const [scoredTasks, setScoredTasks] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async (silent?: boolean) => {
    setError("");
    if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(true);
    try {
      const result = await apiGetStudentGradeDetail(
        workspaceId,
        classId,
        studentId,
        subjectName,
      );
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      const { detail } = result.data;
      setRecords(detail.records);
      setScoredTasks(detail.scoredTasks);
      setTotalRecords(detail.totalRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
    } finally {
      if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(false);
    }
  }, [workspaceId, classId, studentId, subjectName, isSchoolWorkspace, setLoading, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useRefreshOnFocus(() => {
    void load(true);
  });

  const handleExport = useCallback(async () => {
    if (!records.length) return;
    setError("");
    setExporting(true);
    try {
      const result = await exportAndShareStudentGradeDetail({
        className,
        fullName,
        studentNumber: studentNumber || null,
        subjectName,
        records: records.map((r) => ({
          taskDate: formatDateId(r.taskDate),
          title: r.title,
          score: r.score,
        })),
      });
      if (!result.ok) setError(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("export.createFileFailed"));
    } finally {
      setExporting(false);
    }
  }, [records, className, fullName, studentNumber, subjectName, t]);

  const filterLabel = subjectName
    ? t("studentGradeDetail.filteredSubject").replace("{subject}", subjectName)
    : null;

  const bandSummary = formatGradeBandCounts(
    countGradeBandsFromRecords(records, predikatSettings),
    predikatSettings,
  );
  const recordsLabel = t("studentGradeDetail.records").replace(
    "{count}",
    String(totalRecords),
  );
  const summaryText = bandSummary
    ? `${bandSummary} · ${recordsLabel}`
    : `${t("studentGradeDetail.scoredCount", { count: scoredTasks })} · ${recordsLabel}`;

  const renderItem = useCallback(
    ({ item }: { item: GuruStudentGradeRecord }) => (
      <GradeRecordRow record={item} predikatSettings={predikatSettings} />
    ),
    [predikatSettings],
  );

  const keyExtractor = useCallback(
    (item: GuruStudentGradeRecord) => `${item.taskDate}-${item.taskId}`,
    [],
  );

  const showListLoading = loading && records.length === 0 && !error;

  return (
    <StickyScreen
      footer={
        records.length > 0 ? (
          <StickyActionBar>
            <PrimaryButton
              title={t("studentGradeDetail.exportExcel")}
              size="compact"
              loading={exporting}
              onPress={() => void handleExport()}
            />
          </StickyActionBar>
        ) : null
      }
    >
      <View style={[styles.page, { backgroundColor: colors.bg }]}>
        <View style={styles.fixedHeader}>
          <StudentProfileHeader
            className={className}
            fullName={fullName}
            studentNumber={studentNumber}
            filterLabel={filterLabel}
          />
          <ErrorBanner message={error} />
          {!showListLoading ? (
            <StudentDetailSummaryBar text={summaryText} />
          ) : null}
          <SectionLabel dense title={t("studentGradeDetail.history")} />
        </View>

        {showListLoading ? (
          <ScreenLoadingView />
        ) : (
          <FlatList
            style={listStyles.list}
            contentContainerStyle={[listStyles.listContent, styles.listContent]}
            data={records}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews
            initialNumToRender={14}
            maxToRenderPerBatch={16}
            windowSize={7}
            ListEmptyComponent={
              <EmptyState icon="grades" message={t("studentGradeDetail.empty")} />
            }
          />
        )}
      </View>
    </StickyScreen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  fixedHeader: {
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    gap: 2,
    flexShrink: 0,
  },
  listContent: { paddingTop: 0 },
  recordOuter: { marginBottom: space.sm },
  recordBody: {
    paddingHorizontal: space.md,
    paddingVertical: 10,
  },
  recordMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  titleWrap: { flex: 1, minWidth: 0, gap: 0 },
  scoreBadge: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 36,
    alignItems: "center",
    flexShrink: 0,
  },
});
