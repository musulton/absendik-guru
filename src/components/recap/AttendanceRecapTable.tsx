import { memo, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  ATTENDANCE_STATUS_ORDER,
  getAttendanceStatusShort,
} from "@/lib/attendance-labels";
import { RECAP_STATUS_COLORS } from "@/lib/recap-display";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius, space } from "@/lib/theme";
import type { GuruPeriodRecap, GuruPeriodStudentRecap } from "@/lib/types";
import {
  useRecapTableLayout,
  useRecapTableStyles,
} from "@/components/recap/recap-table-layout";

type Props = {
  recap: GuruPeriodRecap;
  onStudentPress?: (student: GuruPeriodStudentRecap) => void;
};

function AttendanceRecapTableInner({ recap, onStudentPress }: Props) {
  const { colors, font, scale, locale, t } = useTheme();
  const ts = useRecapTableStyles();
  const textStyles = useMemo(
    () => ({
      valueText: {
        fontSize: scale(13),
        fontWeight: "800" as const,
        textAlign: "center" as const,
      },
      totalLabel: { fontSize: scale(12), fontWeight: "800" as const },
    }),
    [scale],
  );
  const statusShort = getAttendanceStatusShort(locale);
  const { students } = recap;
  const layout = useRecapTableLayout();
  const dataColWidth =
    layout.pctColWidth + layout.statusColWidth * ATTENDANCE_STATUS_ORDER.length;

  const rowStyle = (rowIndex: number) => ({
    height: layout.rowHeight,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: rowIndex % 2 === 1 ? colors.bg : colors.surface,
  });

  const renderNameCell = (student: GuruPeriodStudentRecap, rowIndex: number) => {
    const cell = (
      <View
        style={[
          ts.nameCell,
          rowStyle(rowIndex),
          styles.nameBorder,
          { borderRightColor: colors.border },
        ]}
      >
        <Text
          style={[
            font.caption,
            ts.studentName,
            onStudentPress ? { color: colors.primary } : { color: colors.text },
          ]}
          numberOfLines={2}
        >
          {student.fullName}
        </Text>
      </View>
    );

    if (!onStudentPress) {
      return <View key={student.studentId}>{cell}</View>;
    }

    return (
      <Pressable
        key={student.studentId}
        onPress={withHaptic(() => onStudentPress(student))}
        style={({ pressed }) => pressed && ts.pressed}
      >
        {cell}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
        elevation(colors.cardShadow, "sm"),
      ]}
    >
      <View style={ts.tableBody}>
        <View style={[ts.nameColumn, { width: layout.nameWidth }]}>
          <View
            style={[
              ts.headerBand,
              ts.nameCell,
              styles.headerCell,
              {
                height: layout.headerHeight,
                backgroundColor: colors.primaryMuted,
                borderBottomColor: colors.primaryBorder,
                borderRightColor: colors.border,
              },
            ]}
          >
            <Text style={[font.caption, ts.headerText, { color: colors.textMuted }]}>
              {t("recap.studentsCol")}
            </Text>
          </View>
          {students.map((student, rowIndex) => renderNameCell(student, rowIndex))}
          <View
            style={[
              ts.nameCell,
              {
                height: layout.rowHeight,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
                borderRightWidth: StyleSheet.hairlineWidth,
                borderRightColor: colors.border,
                backgroundColor: colors.primaryMuted,
              },
            ]}
          >
            <Text style={[font.caption, textStyles.totalLabel, { color: colors.primary }]}>
              {t("recap.totalRow")}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          style={ts.dataScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ minWidth: dataColWidth }}
        >
          <View style={ts.dataGrid}>
            <View
              style={[
                ts.dataRow,
                styles.headerCell,
                {
                  width: dataColWidth,
                  height: layout.headerHeight,
                  backgroundColor: colors.primaryMuted,
                  borderBottomColor: colors.primaryBorder,
                },
              ]}
            >
              <View
                style={[
                  ts.valueCell,
                  styles.dataBorder,
                  {
                    width: layout.pctColWidth,
                    borderRightColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[font.caption, ts.headerText, ts.headerCenter, { color: colors.textMuted }]}
                >
                  %
                </Text>
              </View>
              {ATTENDANCE_STATUS_ORDER.map((status, index) => (
                <View
                  key={status}
                  style={[
                    ts.valueCell,
                    styles.dataBorder,
                    {
                      width: layout.statusColWidth,
                      borderRightColor: colors.border,
                      borderRightWidth:
                        index < ATTENDANCE_STATUS_ORDER.length - 1
                          ? StyleSheet.hairlineWidth
                          : 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      font.caption,
                      ts.headerText,
                      ts.headerCenter,
                      { color: RECAP_STATUS_COLORS[status].text },
                    ]}
                  >
                    {statusShort[status]}
                  </Text>
                </View>
              ))}
            </View>

            {students.map((student, rowIndex) => (
              <View
                key={student.studentId}
                style={[ts.dataRow, rowStyle(rowIndex), { width: dataColWidth }]}
              >
                <View
                  style={[
                    ts.valueCell,
                    styles.dataBorder,
                    {
                      width: layout.pctColWidth,
                      borderRightColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      textStyles.valueText,
                      {
                        color:
                          student.pctHadir >= 80
                            ? colors.success
                            : student.pctHadir >= 60
                              ? colors.primary
                              : colors.danger,
                      },
                    ]}
                  >
                    {student.pctHadir}
                  </Text>
                </View>
                {ATTENDANCE_STATUS_ORDER.map((status, index) => {
                  const count = student.counts[status];
                  const palette = RECAP_STATUS_COLORS[status];
                  return (
                    <View
                      key={status}
                      style={[
                        ts.valueCell,
                        styles.dataBorder,
                        {
                          width: layout.statusColWidth,
                          borderRightColor: colors.border,
                          borderRightWidth:
                            index < ATTENDANCE_STATUS_ORDER.length - 1
                              ? StyleSheet.hairlineWidth
                              : 0,
                          backgroundColor: count > 0 ? palette.bg : undefined,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          textStyles.valueText,
                          { color: count > 0 ? palette.text : colors.textMuted },
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}

            <View
              style={[
                ts.dataRow,
                {
                  width: dataColWidth,
                  height: layout.rowHeight,
                  borderTopColor: colors.border,
                  borderTopWidth: StyleSheet.hairlineWidth,
                  backgroundColor: colors.primaryMuted,
                },
              ]}
            >
              <View
                style={[
                  ts.valueCell,
                  styles.dataBorder,
                  {
                    width: layout.pctColWidth,
                    borderRightColor: colors.border,
                  },
                ]}
              >
                <Text style={[textStyles.valueText, { color: colors.textMuted }]}>0</Text>
              </View>
              {ATTENDANCE_STATUS_ORDER.map((status, index) => {
                const count = recap.totals[status];
                const palette = RECAP_STATUS_COLORS[status];
                return (
                  <View
                    key={status}
                    style={[
                      ts.valueCell,
                      styles.dataBorder,
                      {
                        width: layout.statusColWidth,
                        borderRightColor: colors.border,
                        borderRightWidth:
                          index < ATTENDANCE_STATUS_ORDER.length - 1
                            ? StyleSheet.hairlineWidth
                            : 0,
                      },
                    ]}
                  >
                    <Text style={[textStyles.valueText, { color: palette.text }]}>
                      {count}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

export const AttendanceRecapTable = memo(AttendanceRecapTableInner);

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: radius.lg,
    marginBottom: space.sm,
    overflow: "hidden",
  },
  headerCell: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  nameBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  dataBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
  },
});
