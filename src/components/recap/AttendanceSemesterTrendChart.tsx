import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { RecapLineChart } from "@/components/recap/RecapLineChart";
import { fetchAttendanceSemesterTrend } from "@/lib/recap-semester-trend";
import type { MonthlyTrendPoint } from "@/lib/recap-monthly-trend";
import type { SemesterValue } from "@/lib/period-range";
import { useTheme } from "@/context/AppPreferencesContext";

type Props = {
  workspaceId: string;
  classId: string;
  semester: SemesterValue;
  subjectName?: string | null;
};

export function AttendanceSemesterTrendChart({
  workspaceId,
  classId,
  semester,
  subjectName,
}: Props) {
  const { colors, locale, t } = useTheme();
  const [points, setPoints] = useState<MonthlyTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchAttendanceSemesterTrend(
      workspaceId,
      classId,
      semester,
      locale,
      subjectName,
    ).then((next) => {
      if (!cancelled) {
        setPoints(next);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, classId, semester.year, semester.semester, locale, subjectName]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <RecapLineChart
      title={t("recap.chartAttendanceSemesterTrend")}
      points={points}
      color={colors.success}
      yMax={100}
      emptyLabel={t("recap.chartEmpty")}
      size="large"
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
});
