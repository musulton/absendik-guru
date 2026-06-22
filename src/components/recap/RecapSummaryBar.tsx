import { StyleSheet, Text, View } from "react-native";
import {
  ATTENDANCE_STATUS_ORDER,
  getAttendanceStatusLabel,
} from "@/lib/attendance-labels";
import { useTheme } from "@/context/AppPreferencesContext";
import { RECAP_STATUS_COLORS } from "@/lib/recap-display";
import { radius, space } from "@/lib/theme";
import type { GuruPeriodRecap } from "@/lib/types";

type Props = {
  recap: GuruPeriodRecap;
  metaLabel: string;
};

export function RecapSummaryBar({ recap, metaLabel }: Props) {
  const { colors, font, scale, locale } = useTheme();
  const statusLabels = getAttendanceStatusLabel(locale);

  return (
    <View style={styles.wrap}>
      <View style={styles.chips}>
        {ATTENDANCE_STATUS_ORDER.map((status) => {
          const palette = RECAP_STATUS_COLORS[status];
          return (
            <View
              key={status}
              style={[styles.chip, { backgroundColor: palette.bg, borderColor: palette.text }]}
            >
              <Text style={[font.caption, styles.chipText, { color: palette.text, fontSize: scale(10) }]}>
                {statusLabels[status]} {recap.totals[status]}
              </Text>
            </View>
          );
        })}
      </View>
      <Text
        style={[
          font.caption,
          styles.meta,
          { color: colors.textMuted, fontSize: scale(11), lineHeight: scale(15) },
        ]}
      >
        {metaLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
    marginBottom: space.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  chipText: {
    fontWeight: "700",
  },
  meta: {
    fontWeight: "600",
  },
});
