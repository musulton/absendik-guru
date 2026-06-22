import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import {
  countStudentAverageBandsFromRecap,
  DEFAULT_GRADE_PREDIKAT,
  GRADE_BAND_ORDER,
  getGradeBandLabel,
  RECAP_GRADE_COLORS,
  type SchoolGradePredikatSettings,
} from "@/lib/grade-recap-display";
import { radius, space } from "@/lib/theme";
import type { GuruGradePeriodRecap } from "@/lib/types";

type Props = {
  recap: GuruGradePeriodRecap;
  metaLabel: string;
  predikatSettings?: SchoolGradePredikatSettings;
};

/** Ringkasan predikat siswa — selaras dengan RecapSummaryBar absensi. */
export function GradeRecapSummaryBar({
  recap,
  metaLabel,
  predikatSettings = DEFAULT_GRADE_PREDIKAT,
}: Props) {
  const { colors, font, scale } = useTheme();
  const bandCounts = countStudentAverageBandsFromRecap(recap, predikatSettings);

  return (
    <View style={styles.wrap}>
      <View style={styles.chips}>
        {GRADE_BAND_ORDER.map((band) => {
          const palette = RECAP_GRADE_COLORS[band];
          return (
            <View
              key={band}
              style={[styles.chip, { backgroundColor: palette.bg, borderColor: palette.text }]}
            >
              <Text
                style={[
                  font.caption,
                  styles.chipText,
                  { color: palette.text, fontSize: scale(10) },
                ]}
              >
                {getGradeBandLabel(band, predikatSettings)} {bandCounts[band]}
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
