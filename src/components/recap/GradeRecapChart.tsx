import { useMemo } from "react";
import {
  countStudentAverageBandsFromRecap,
  DEFAULT_GRADE_PREDIKAT,
  GRADE_BAND_ORDER,
  GRADE_BAND_SHORT,
  RECAP_GRADE_COLORS,
  type SchoolGradePredikatSettings,
} from "@/lib/grade-recap-display";
import { useTheme } from "@/context/AppPreferencesContext";
import type { GuruGradePeriodRecap } from "@/lib/types";
import { RecapBarChart } from "@/components/recap/RecapBarChart";

type Props = {
  recap: GuruGradePeriodRecap;
  predikatSettings?: SchoolGradePredikatSettings;
  size?: "default" | "large";
};

export function GradeRecapChart({
  recap,
  predikatSettings = DEFAULT_GRADE_PREDIKAT,
  size = "default",
}: Props) {
  const { t } = useTheme();
  const bandCounts = countStudentAverageBandsFromRecap(recap, predikatSettings);

  const items = useMemo(
    () =>
      GRADE_BAND_ORDER.map((band) => ({
        key: band,
        label: GRADE_BAND_SHORT[band],
        value: bandCounts[band],
        color: RECAP_GRADE_COLORS[band].text,
      })),
    [bandCounts, predikatSettings],
  );

  return (
    <RecapBarChart title={t("recap.chartGrades")} items={items} size={size} />
  );
}
