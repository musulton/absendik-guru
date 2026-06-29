import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { RecapLineChart } from "@/components/recap/RecapLineChart";
import { fetchAttendanceMonthlyTrend } from "@/lib/recap-monthly-trend";
import { useTheme } from "@/context/AppPreferencesContext";
import type { MonthlyTrendPoint } from "@/lib/recap-monthly-trend";

type Props = {
  workspaceId: string;
  classId: string;
  month: string;
  subjectName?: string | null;
};

export function AttendanceMonthlyTrendChart({
  workspaceId,
  classId,
  month,
  subjectName,
}: Props) {
  const { colors, t } = useTheme();
  const [points, setPoints] = useState<MonthlyTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchAttendanceMonthlyTrend(
      workspaceId,
      classId,
      month,
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
  }, [workspaceId, classId, month, subjectName]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <RecapLineChart
      title={t("recap.chartAttendanceTrend")}
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
