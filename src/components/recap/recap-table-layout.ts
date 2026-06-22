import { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { scaleFontSize, screen, space } from "@/lib/theme";

/** Layout tabel rekap absensi & nilai — cukup padat tanpa terlalu kecil. */
export function useRecapTableLayout() {
  const { width: screenWidth } = useWindowDimensions();
  const tableWidth = screenWidth - screen.contentPadding * 2;
  const nameWidth = Math.round(
    Math.min(Math.max(tableWidth * 0.4, 140), 172),
  );

  return {
    tableWidth,
    nameWidth,
    rowHeight: 48,
    headerHeight: 44,
    pctColWidth: 40,
    statusColWidth: 36,
    taskColWidth: 52,
  };
}

export function useRecapTableStyles() {
  const { fontSize } = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        tableBody: {
          flexDirection: "row",
          alignItems: "flex-start",
        },
        nameColumn: {
          flexShrink: 0,
        },
        dataScroll: {
          flex: 1,
          minWidth: 0,
        },
        dataGrid: {
          flexDirection: "column",
        },
        headerBand: {
          justifyContent: "center",
          paddingHorizontal: space.sm,
        },
        headerText: {
          fontSize: scaleFontSize(11, fontSize),
          fontWeight: "700",
          lineHeight: scaleFontSize(14, fontSize),
        },
        headerCenter: {
          textAlign: "center",
          width: "100%",
        },
        nameCell: {
          paddingHorizontal: space.sm,
          paddingVertical: 6,
          justifyContent: "center",
        },
        studentName: {
          fontSize: scaleFontSize(13, fontSize),
          fontWeight: "700",
          lineHeight: scaleFontSize(18, fontSize),
        },
        valueCell: {
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 4,
          paddingVertical: 6,
        },
        dataRow: {
          flexDirection: "row",
          alignItems: "stretch",
        },
        pressed: { opacity: 0.88 },
      }),
    [fontSize],
  );
}
