import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { ErrorBanner } from "@/components/ErrorBanner";
import { AccentCard } from "@/components/ui/AccentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenLoadingView } from "@/components/ui/ScreenLoadingView";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { StudentDetailSummaryBar } from "@/components/ui/StudentDetailSummaryBar";
import { StudentProfileHeader } from "@/components/ui/StudentProfileHeader";
import { useTheme } from "@/context/AppPreferencesContext";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import {
  useFetchLoadingState,
  shouldShowFetchLoading,
  finishScreenFetch,
} from "@/hooks/useBlockingScreenLoad";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getAttendanceStatusLabel } from "@/lib/attendance-labels";
import { apiGetStudentAttendanceDetail } from "@/lib/guru-repository";
import { formatDateId } from "@/lib/dates";
import { formatStatusCounts, RECAP_STATUS_COLORS } from "@/lib/recap-display";
import { useListStyles } from "@/lib/use-themed-styles";
import { radius, space } from "@/lib/theme";
import type {
  GuruStudentAttendanceDetail,
  GuruStudentAttendanceRecord,
} from "@/lib/types";

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  studentId: string;
  fullName: string;
  studentNumber: string;
  subjectName?: string | null;
};

function RecordRow({ record }: { record: GuruStudentAttendanceRecord }) {
  const { colors, font, scale, locale } = useTheme();
  const textStyles = useMemo(
    () => ({
      date: { fontWeight: "700" as const, fontSize: scale(13), flexShrink: 0 },
      subject: { flex: 1, minWidth: 0, fontSize: scale(12) },
      badgeText: { fontSize: scale(11), fontWeight: "700" as const },
      note: { fontSize: scale(12), lineHeight: scale(17) },
    }),
    [scale],
  );
  const palette = RECAP_STATUS_COLORS[record.status];
  const statusLabels = getAttendanceStatusLabel(locale);
  const note = record.note?.trim();

  return (
    <AccentCard
      accentColor={palette.text}
      tintColor={palette.bg}
      style={styles.recordOuter}
      contentStyle={styles.recordBody}
    >
      <View style={styles.recordMain}>
        <Text style={[font.caption, textStyles.date]} numberOfLines={1}>
          {formatDateId(record.sessionDate)}
        </Text>
        {record.subjectName ? (
          <Text
            style={[font.caption, textStyles.subject, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {record.subjectName}
          </Text>
        ) : null}
        <View
          style={[
            styles.badge,
            { backgroundColor: palette.bg, borderColor: palette.text },
          ]}
        >
          <Text style={[textStyles.badgeText, { color: palette.text }]}>
            {statusLabels[record.status]}
          </Text>
        </View>
      </View>
      {note ? (
        <Text style={[font.caption, textStyles.note, { color: colors.textMuted }]}>
          {note}
        </Text>
      ) : null}
    </AccentCard>
  );
}

export function StudentAttendanceDetailScreen({
  workspaceId,
  classId,
  className,
  studentId,
  fullName,
  studentNumber,
  subjectName,
}: Props) {
  const { colors, t, locale } = useTheme();
  const { isSchoolWorkspace } = useWorkspace();
  const listStyles = useListStyles();
  const [loading, setLoading] = useFetchLoadingState();
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<GuruStudentAttendanceDetail | null>(null);

  const load = useCallback(async (silent?: boolean) => {
    setError("");
    if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(true);
    try {
      const result = await apiGetStudentAttendanceDetail(
        workspaceId,
        classId,
        studentId,
        subjectName,
      );
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setDetail(result.data.detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
    } finally {
      finishScreenFetch({ isSchoolWorkspace, silent, setLoading });
    }
  }, [workspaceId, classId, studentId, subjectName, isSchoolWorkspace, setLoading, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useRefreshOnFocus(() => {
    void load(true);
  });

  const summary = detail?.summary;
  const records = detail?.records ?? [];
  const filterLabel = subjectName
    ? t("studentDetail.filteredSubject").replace("{subject}", subjectName)
    : null;
  const summaryText = summary
    ? `${formatStatusCounts(summary, locale)} · ${t("studentDetail.records").replace("{count}", String(detail?.totalRecords ?? 0))}`
    : null;
  const showListLoading = loading && detail == null && !error;

  return (
    <StickyScreen>
      <View style={[styles.page, { backgroundColor: colors.bg }]}>
        <View style={styles.fixedHeader}>
          <StudentProfileHeader
            className={className}
            fullName={fullName}
            studentNumber={studentNumber}
            filterLabel={filterLabel}
          />
          <ErrorBanner message={error} />
          {!showListLoading && summaryText ? (
            <StudentDetailSummaryBar text={summaryText} />
          ) : null}
          <SectionLabel dense title={t("studentDetail.history")} />
        </View>

        {showListLoading ? (
          <ScreenLoadingView />
        ) : (
          <FlatList
            style={listStyles.list}
            contentContainerStyle={[listStyles.listContent, styles.listContent]}
            data={records}
            keyExtractor={(item, index) =>
              `${item.sessionDate}-${item.subjectName ?? ""}-${index}`
            }
            removeClippedSubviews
            initialNumToRender={16}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <EmptyState icon="attendance" message={t("studentDetail.empty")} />
            }
            renderItem={({ item }) => <RecordRow record={item} />}
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
    gap: 6,
  },
  recordMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    flexWrap: "wrap",
  },
  badge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
});
