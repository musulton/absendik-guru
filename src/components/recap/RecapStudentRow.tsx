import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  ATTENDANCE_STATUS_ORDER,
  getAttendanceStatusLabel,
} from "@/lib/attendance-labels";
import { AccentCard } from "@/components/ui/AccentCard";
import { RECAP_STATUS_COLORS } from "@/lib/recap-display";
import { useTheme } from "@/context/AppPreferencesContext";
import { radius, space } from "@/lib/theme";
import type { GuruPeriodStudentRecap } from "@/lib/types";

type Props = {
  item: GuruPeriodStudentRecap;
};

export function RecapStudentRow({ item }: Props) {
  const { colors, font, scale, locale } = useTheme();
  const textStyles = useMemo(
    () => ({
      name: {
        fontSize: scale(14),
        fontWeight: "700" as const,
        lineHeight: scale(18),
      },
      pct: { fontSize: scale(12), lineHeight: scale(16), fontWeight: "600" as const },
      badgeText: { fontSize: scale(10), fontWeight: "700" as const },
    }),
    [scale],
  );
  const statusLabels = getAttendanceStatusLabel(locale);
  const accentColor =
    item.pctHadir >= 80
      ? colors.success
      : item.pctHadir >= 60
        ? colors.primary
        : colors.danger;
  const tintColor =
    item.pctHadir >= 80
      ? colors.successBg
      : item.pctHadir >= 60
        ? colors.primaryMuted
        : colors.dangerBg;

  return (
    <AccentCard
      accentColor={accentColor}
      tintColor={tintColor}
      style={styles.outer}
      contentStyle={styles.body}
    >
      <View style={styles.nameCol}>
        <Text style={[font.body, textStyles.name]} numberOfLines={1}>
          {item.fullName}
        </Text>
        <View style={[styles.pctPill, { backgroundColor: colors.surface, borderColor: accentColor }]}>
          <Text style={[font.caption, textStyles.pct, { color: accentColor }]}>
            {item.pctHadir}% {locale === "en" ? "present" : "hadir"}
          </Text>
        </View>
      </View>
      <View style={styles.counts}>
        {ATTENDANCE_STATUS_ORDER.map((status) => {
          const n = item.counts[status];
          if (n === 0) return null;
          const palette = RECAP_STATUS_COLORS[status];
          return (
            <View
              key={status}
              style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.text }]}
            >
              <Text style={[textStyles.badgeText, { color: palette.text }]}>
                {statusLabels[status]} {n}
              </Text>
            </View>
          );
        })}
      </View>
    </AccentCard>
  );
}

const styles = StyleSheet.create({
  outer: { marginBottom: space.sm },
  body: {
    paddingHorizontal: space.md,
    paddingVertical: 10,
    gap: space.sm,
  },
  nameCol: { gap: 4 },
  pctPill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.xs,
  },
  badge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
