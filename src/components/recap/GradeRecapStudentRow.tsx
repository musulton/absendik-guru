import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AccentCard } from "@/components/ui/AccentCard";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import type {
  GradeBandCounts,
  GradeRecapStudentSummary,
} from "@/lib/grade-recap-display";
import type { GradeBand } from "@/lib/grade-predikat";
import {
  DEFAULT_GRADE_PREDIKAT,
  GRADE_BAND_ORDER,
  RECAP_GRADE_COLORS,
  formatTaskDateShort,
  getGradeAveragePalette,
  getGradeBandLabel,
  getGradeScorePalette,
  type SchoolGradePredikatSettings,
} from "@/lib/grade-recap-display";
import { radius, space } from "@/lib/theme";

export type GradeRecapEntry = {
  label: string;
  score: string;
  date: string;
  band?: GradeBand;
};

type Props = {
  fullName: string;
  studentNumber: string | null;
  entries: GradeRecapEntry[];
  summary?: GradeRecapStudentSummary | null;
  bandCounts?: GradeBandCounts | null;
  predikatSettings?: SchoolGradePredikatSettings;
  entryListMode?: boolean;
  onPress?: () => void;
};

function shortTaskLabel(label: string): string {
  const trimmed = label.trim();
  if (trimmed.length <= 8) return trimmed;
  return `${trimmed.slice(0, 7)}…`;
}

function useGradeRecapTextStyles() {
  const { scale } = useTheme();
  return useMemo(
    () => ({
      name: {
        fontSize: scale(14),
        fontWeight: "700" as const,
        lineHeight: scale(18),
      },
      nis: { fontSize: scale(12), lineHeight: scale(16) },
      avgValue: {
        fontSize: scale(15),
        fontWeight: "800" as const,
        lineHeight: scale(18),
      },
      fraction: {
        fontSize: scale(11),
        fontWeight: "600" as const,
        lineHeight: scale(15),
      },
      tileScore: {
        fontSize: scale(14),
        fontWeight: "800" as const,
        lineHeight: scale(17),
      },
      tileLabel: {
        fontSize: scale(10),
        lineHeight: scale(13),
        textAlign: "center" as const,
        fontWeight: "600" as const,
      },
      badgeText: { fontSize: scale(10), fontWeight: "700" as const },
    }),
    [scale],
  );
}

function GradeRecapSummaryStats({
  summary,
  bandCounts,
  predikatSettings = DEFAULT_GRADE_PREDIKAT,
}: {
  summary: GradeRecapStudentSummary;
  bandCounts?: GradeBandCounts | null;
  predikatSettings?: SchoolGradePredikatSettings;
}) {
  const { colors, font, t } = useTheme();
  const textStyles = useGradeRecapTextStyles();
  const hasAverage = summary.average != null;
  const avgPalette = getGradeAveragePalette(summary.average, predikatSettings);

  return (
    <View style={styles.summaryCol}>
      <View
        style={[
          styles.avgBadge,
          {
            backgroundColor: avgPalette?.bg ?? colors.bg,
            borderColor: avgPalette?.text ?? colors.border,
          },
        ]}
      >
        <Text
          style={[
            textStyles.avgValue,
            { color: avgPalette?.text ?? colors.textMuted },
          ]}
        >
          {hasAverage ? summary.average : "—"}
        </Text>
      </View>
      {bandCounts ? (
        <GradeRecapBandBadges
          counts={bandCounts}
          predikatSettings={predikatSettings}
        />
      ) : (
        <Text style={[font.caption, textStyles.fraction, { color: colors.textMuted }]}>
          {t("grades.recapTaskFraction", {
            scored: summary.scored,
            total: summary.total,
          })}
        </Text>
      )}
    </View>
  );
}

function GradeRecapBandBadges({
  counts,
  predikatSettings = DEFAULT_GRADE_PREDIKAT,
}: {
  counts: GradeBandCounts;
  predikatSettings?: SchoolGradePredikatSettings;
}) {
  const textStyles = useGradeRecapTextStyles();

  return (
    <View style={styles.badgeRow}>
      {GRADE_BAND_ORDER.map((band) => {
        const n = counts[band];
        if (n === 0) return null;
        const palette = RECAP_GRADE_COLORS[band];
        return (
          <View
            key={band}
            style={[styles.badge, { backgroundColor: palette.bg }]}
          >
            <Text style={[textStyles.badgeText, { color: palette.text }]}>
              {getGradeBandLabel(band, predikatSettings)} {n}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function GradeRecapEntryList({
  entries,
  predikatSettings = DEFAULT_GRADE_PREDIKAT,
}: {
  entries: GradeRecapEntry[];
  predikatSettings?: SchoolGradePredikatSettings;
}) {
  const { colors, font } = useTheme();
  const textStyles = useGradeRecapTextStyles();

  return (
    <View style={styles.entryList}>
      {entries.map((entry) => {
        const palette = getGradeScorePalette(entry.score, predikatSettings);
        return (
          <View key={`${entry.date}-${entry.label}`} style={styles.entryRow}>
            <View style={styles.entryMain}>
              <Text
                style={[font.caption, textStyles.name, { color: colors.text }]}
                numberOfLines={2}
              >
                {entry.label}
              </Text>
              <Text style={[font.caption, textStyles.nis, { color: colors.textMuted }]}>
                {formatTaskDateShort(entry.date)}
                {entry.band
                  ? ` · ${getGradeBandLabel(entry.band, predikatSettings)}`
                  : ""}
              </Text>
            </View>
            <View
              style={[
                styles.avgBadge,
                {
                  backgroundColor: palette?.bg ?? colors.bg,
                  borderColor: palette?.text ?? colors.border,
                },
              ]}
            >
              <Text
                style={[
                  textStyles.avgValue,
                  { color: palette?.text ?? colors.textMuted },
                ]}
              >
                {entry.score}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function GradeRecapScoreTiles({
  entries,
  predikatSettings = DEFAULT_GRADE_PREDIKAT,
}: {
  entries: GradeRecapEntry[];
  predikatSettings?: SchoolGradePredikatSettings;
}) {
  const { colors, font } = useTheme();
  const textStyles = useGradeRecapTextStyles();

  return (
    <View style={styles.tilesRow}>
      {entries.map((entry) => {
        const palette = getGradeScorePalette(entry.score, predikatSettings);
        return (
          <View
            key={`${entry.date}-${entry.label}`}
            style={[
              styles.tile,
              {
                backgroundColor: palette?.bg ?? colors.bg,
                borderColor: palette?.text ?? colors.border,
              },
            ]}
          >
            <Text
              style={[
                textStyles.tileScore,
                { color: palette?.text ?? colors.text },
              ]}
              numberOfLines={1}
            >
              {entry.score}
            </Text>
            <Text
              style={[font.caption, textStyles.tileLabel, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {shortTaskLabel(entry.label)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function GradeRecapStudentRowInner({
  fullName,
  studentNumber,
  entries,
  summary,
  bandCounts,
  predikatSettings = DEFAULT_GRADE_PREDIKAT,
  entryListMode = false,
  onPress,
}: Props) {
  const { colors, font } = useTheme();
  const textStyles = useGradeRecapTextStyles();
  const avgPalette = summary ? getGradeAveragePalette(summary.average, predikatSettings) : null;
  const accentColor = avgPalette?.text ?? colors.primary;

  const trailing = summary ? (
    <GradeRecapSummaryStats
      summary={summary}
      bandCounts={bandCounts}
      predikatSettings={predikatSettings}
    />
  ) : entries.length === 0 ? (
    <Text style={[font.caption, { color: colors.textMuted }]}>—</Text>
  ) : (
    <GradeRecapScoreTiles
      entries={entries}
      predikatSettings={predikatSettings}
    />
  );

  const content = (
    <AccentCard
      accentColor={accentColor}
      tintColor={avgPalette?.bg ?? colors.primaryMuted}
      style={styles.cardOuter}
      contentStyle={[
        styles.cardInner,
        entryListMode && styles.cardStacked,
      ]}
    >
      <View style={styles.main}>
        <View style={styles.headerRow}>
          <View style={styles.mainText}>
            <Text
              style={[
                font.body,
                textStyles.name,
                onPress ? { color: colors.primary } : { color: colors.text },
              ]}
              numberOfLines={1}
            >
              {fullName}
            </Text>
            {studentNumber ? (
              <Text style={[font.caption, textStyles.nis, { color: colors.textMuted }]}>
                {studentNumber}
              </Text>
            ) : null}
          </View>
          <View style={styles.trailing}>
            {trailing}
            {onPress ? (
              <Icon name="chevronRight" size={18} color={colors.textMuted} />
            ) : null}
          </View>
        </View>
        {entryListMode && entries.length > 0 ? (
          <GradeRecapEntryList
            entries={entries}
            predikatSettings={predikatSettings}
          />
        ) : null}
      </View>
    </AccentCard>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={withHaptic(onPress)}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export const GradeRecapStudentRow = memo(GradeRecapStudentRowInner);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.sm,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.998 }] },
  cardOuter: {
    marginBottom: 0,
  },
  cardInner: {
    paddingVertical: 10,
    paddingHorizontal: space.md,
  },
  cardStacked: {
    paddingVertical: 12,
  },
  main: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  mainText: {
    flex: 1,
    minWidth: 0,
    gap: 0,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    paddingTop: 2,
  },
  summaryCol: {
    alignItems: "flex-end",
    gap: 2,
  },
  avgBadge: {
    minWidth: 42,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  tilesRow: {
    flexDirection: "row",
    gap: space.xs,
    justifyContent: "flex-end",
  },
  tile: {
    width: 48,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 2,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    justifyContent: "flex-end",
    maxWidth: 168,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  entryList: {
    gap: 6,
    paddingTop: 2,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  entryMain: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
});
