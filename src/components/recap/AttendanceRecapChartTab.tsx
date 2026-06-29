import type { ReactNode } from "react";
import { AttendanceRecapChart } from "@/components/recap/AttendanceRecapChart";
import { RecapChartHero } from "@/components/recap/RecapChartHero";
import { RecapChartTabLayout } from "@/components/recap/RecapChartTabLayout";
import { useTheme } from "@/context/AppPreferencesContext";
import type { GuruStatusCounts } from "@/lib/types";

type Props = {
  metaLabel: string;
  totals: GuruStatusCounts;
  trend?: ReactNode;
};

function attendancePct(totals: GuruStatusCounts): number | null {
  const denom =
    totals.hadir + totals.sakit + totals.izin + totals.alpha;
  if (denom <= 0) return null;
  return Math.round((totals.hadir / denom) * 100);
}

export function AttendanceRecapChartTab({ metaLabel, totals, trend }: Props) {
  const { colors, t } = useTheme();
  const pct = attendancePct(totals);
  const totalRecords =
    totals.hadir + totals.sakit + totals.izin + totals.alpha;

  return (
    <RecapChartTabLayout metaLabel={metaLabel}>
      <RecapChartHero
        icon="attendance"
        label={t("recap.chartHeroAttendance")}
        value={pct != null ? `${pct}%` : "—"}
        hint={
          totalRecords > 0
            ? t("recap.chartHeroAttendanceHint", { count: totalRecords })
            : t("recap.chartEmpty")
        }
        accentColor={colors.success}
      />
      <AttendanceRecapChart totals={totals} size="large" />
      {trend}
    </RecapChartTabLayout>
  );
}
