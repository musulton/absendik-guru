import { useMemo } from "react";
import {
  ATTENDANCE_STATUS_ORDER,
  getAttendanceStatusShort,
} from "@/lib/attendance-labels";
import { RECAP_STATUS_COLORS } from "@/lib/recap-display";
import { useTheme } from "@/context/AppPreferencesContext";
import type { GuruStatusCounts } from "@/lib/types";
import { RecapBarChart } from "@/components/recap/RecapBarChart";

type Props = {
  totals: GuruStatusCounts;
  size?: "default" | "large";
};

export function AttendanceRecapChart({ totals, size = "default" }: Props) {
  const { locale, t } = useTheme();
  const labels = getAttendanceStatusShort(locale);

  const items = useMemo(
    () =>
      ATTENDANCE_STATUS_ORDER.map((status) => ({
        key: status,
        label: labels[status],
        value: totals[status],
        color: RECAP_STATUS_COLORS[status].text,
      })),
    [totals, labels],
  );

  return (
    <RecapBarChart
      title={t("recap.chartAttendance")}
      items={items}
      size={size}
    />
  );
}
