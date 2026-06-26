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
import { apiGetStudentNotesDetail } from "@/lib/guru-repository";
import { formatDateId } from "@/lib/dates";
import type { TranslationKey } from "@/lib/i18n/translations";
import {
  groupTranslationKey,
  resolveStudentNoteText,
} from "@/lib/student-note-presets";
import type {
  GuruStudentNoteCategory,
  GuruStudentNotesRecord,
} from "@/lib/types";
import { useListStyles } from "@/lib/use-themed-styles";
import { radius, space } from "@/lib/theme";

type Props = {
  workspaceId: string;
  classId: string;
  className: string;
  studentId: string;
  fullName: string;
  studentNumber: string;
};

function categoryColor(
  category: GuruStudentNoteCategory,
  colors: ReturnType<typeof useTheme>["colors"],
) {
  if (category === "positive") {
    return {
      bg: colors.successBg,
      text: colors.success,
      border: colors.success,
    };
  }
  if (category === "academic") {
    return {
      bg: colors.primaryMuted,
      text: colors.primary,
      border: colors.primaryBorder,
    };
  }
  if (category === "attendance") {
    return { bg: "#fffbeb", text: "#b45309", border: "#fcd34d" };
  }
  if (category === "attitude") {
    return { bg: "#fff7ed", text: "#c2410c", border: "#fdba74" };
  }
  return {
    bg: colors.bg,
    text: colors.textMuted,
    border: colors.border,
  };
}

function RecordRow({ record }: { record: GuruStudentNotesRecord }) {
  const { colors, font, scale, t } = useTheme();
  const palette = categoryColor(record.category, colors);
  const textStyles = useMemo(
    () => ({
      date: { fontWeight: "700" as const, fontSize: scale(13), flexShrink: 0 },
      badgeText: { fontSize: scale(11), fontWeight: "700" as const },
      body: { fontSize: scale(13), lineHeight: scale(18) },
    }),
    [scale],
  );
  const body = resolveStudentNoteText(
    record,
    t as (key: TranslationKey) => string,
  );

  return (
    <AccentCard
      accentColor={palette.text}
      tintColor={palette.bg}
      style={styles.recordOuter}
      contentStyle={styles.recordBody}
    >
      <View style={styles.recordTop}>
        <Text style={[font.caption, textStyles.date, { color: colors.text }]}>
          {formatDateId(record.noteDate)}
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: palette.bg, borderColor: palette.text },
          ]}
        >
          <Text style={[textStyles.badgeText, { color: palette.text }]}>
            {t(groupTranslationKey(record.category))}
          </Text>
        </View>
      </View>
      <Text style={[font.body, textStyles.body, { color: colors.text }]}>
        {body}
      </Text>
    </AccentCard>
  );
}

export function StudentNotesDetailScreen({
  workspaceId,
  classId,
  className,
  studentId,
  fullName,
  studentNumber,
}: Props) {
  const { colors, t } = useTheme();
  const { isSchoolWorkspace } = useWorkspace();
  const listStyles = useListStyles();
  const [loading, setLoading] = useFetchLoadingState(isSchoolWorkspace);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<GuruStudentNotesRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const load = useCallback(async (silent?: boolean) => {
    setError("");
    if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(true);
    try {
      const result = await apiGetStudentNotesDetail(
        workspaceId,
        classId,
        studentId,
      );
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setRecords(result.data.detail.records);
      setTotalRecords(result.data.detail.totalRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
    } finally {
      finishScreenFetch({ isSchoolWorkspace, silent, setLoading });
    }
  }, [workspaceId, classId, studentId, isSchoolWorkspace, setLoading, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useRefreshOnFocus(() => {
    void load(true);
  });

  const summaryText = t("studentNotesDetail.records").replace(
    "{count}",
    String(totalRecords),
  );
  const showListLoading = loading && records.length === 0 && !error;

  return (
    <StickyScreen>
      <View style={[styles.page, { backgroundColor: colors.bg }]}>
        <View style={styles.fixedHeader}>
          <StudentProfileHeader
            className={className}
            fullName={fullName}
            studentNumber={studentNumber}
          />
          <ErrorBanner message={error} />
          {!showListLoading ? (
            <StudentDetailSummaryBar text={summaryText} />
          ) : null}
          <SectionLabel dense title={t("studentNotesDetail.history")} />
        </View>

        {showListLoading ? (
          <ScreenLoadingView />
        ) : (
          <FlatList
            style={listStyles.list}
            contentContainerStyle={[listStyles.listContent, styles.listContent]}
            data={records}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RecordRow record={item} />}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews
            initialNumToRender={16}
            ListEmptyComponent={
              <EmptyState
                icon="studentNote"
                message={t("studentNotesDetail.empty")}
              />
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
    gap: 6,
  },
  recordTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
