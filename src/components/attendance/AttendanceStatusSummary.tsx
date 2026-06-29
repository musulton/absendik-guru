import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  ATTENDANCE_STATUS_ORDER,
  getAttendanceStatusLabel,
  getAttendanceStatusShort,
} from "@/lib/attendance-labels";
import { useTheme } from "@/context/AppPreferencesContext";
import { RECAP_STATUS_COLORS } from "@/lib/recap-display";
import type { Locale } from "@/lib/i18n/translations";
import { radius } from "@/lib/theme";
import type { GuruAttendanceStudent } from "@/lib/types";

type Props = {
  rows: GuruAttendanceStudent[];
  locale: Locale;
  compact?: boolean;
  /** Satu baris horizontal (mis. di samping tombol aksi). */
  nowrap?: boolean;
};

function AttendanceStatusSummaryInner({ rows, locale, compact, nowrap }: Props) {
  const { scale } = useTheme();
  const statusLabels = compact
    ? getAttendanceStatusShort(locale)
    : getAttendanceStatusLabel(locale);

  const textStyles = useMemo(
    () => ({
      chipText: { fontSize: scale(compact ? 10 : 12), fontWeight: "700" as const },
    }),
    [scale, compact],
  );

  const counts = useMemo(() => {
    const tally = { hadir: 0, sakit: 0, izin: 0, alpha: 0 };
    for (const row of rows) {
      if (row.status) tally[row.status] += 1;
    }
    return tally;
  }, [rows]);

  if (!rows.length) return null;

  return (
    <View
      style={[
        styles.wrap,
        compact && styles.wrapCompact,
        nowrap && styles.wrapNowrap,
      ]}
    >
      {ATTENDANCE_STATUS_ORDER.map((status) => {
        const palette = RECAP_STATUS_COLORS[status];
        return (
          <View
            key={status}
            style={[
              styles.chip,
              compact && styles.chipCompact,
              { backgroundColor: palette.bg, borderColor: palette.text },
            ]}
          >
            <Text style={[textStyles.chipText, { color: palette.text }]}>
              {`${statusLabels[status]} ${counts[status]}`}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export const AttendanceStatusSummary = memo(AttendanceStatusSummaryInner);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  wrapCompact: {
    marginBottom: 0,
  },
  wrapNowrap: {
    flexWrap: "nowrap",
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipCompact: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
});
