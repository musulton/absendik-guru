import type { ReactNode } from "react";
import { GradeRecapChart } from "@/components/recap/GradeRecapChart";
import { RecapChartHero } from "@/components/recap/RecapChartHero";
import { RecapChartTabLayout } from "@/components/recap/RecapChartTabLayout";
import {
  DEFAULT_GRADE_PREDIKAT,
  summarizeStudentGrades,
  type SchoolGradePredikatSettings,
} from "@/lib/grade-recap-display";
import { useTheme } from "@/context/AppPreferencesContext";
import type { GuruGradePeriodRecap } from "@/lib/types";

type Props = {
  metaLabel: string;
  recap: GuruGradePeriodRecap;
  predikatSettings?: SchoolGradePredikatSettings;
  trend?: ReactNode;
};

function classAverage(recap: GuruGradePeriodRecap): number | null {
  const avgs = recap.students
    .map((student) => summarizeStudentGrades(student, recap.tasks).average)
    .filter((value): value is number => value != null && !Number.isNaN(value));
  if (!avgs.length) return null;
  const sum = avgs.reduce((acc, value) => acc + value, 0);
  return Math.round((sum / avgs.length) * 10) / 10;
}

export function GradeRecapChartTab({
  metaLabel,
  recap,
  predikatSettings = DEFAULT_GRADE_PREDIKAT,
  trend,
}: Props) {
  const { colors, t } = useTheme();
  const average = classAverage(recap);
  const scoredStudents = recap.students.filter(
    (student) => summarizeStudentGrades(student, recap.tasks).scored > 0,
  ).length;

  return (
    <RecapChartTabLayout metaLabel={metaLabel}>
      <RecapChartHero
        icon="grades"
        label={t("recap.chartHeroGrade")}
        value={average != null ? String(average) : "—"}
        hint={
          scoredStudents > 0
            ? t("recap.chartHeroGradeHint", { count: scoredStudents })
            : t("recap.chartEmpty")
        }
        accentColor={colors.primary}
      />
      <GradeRecapChart
        recap={recap}
        predikatSettings={predikatSettings}
        size="large"
      />
      {trend}
    </RecapChartTabLayout>
  );
}
