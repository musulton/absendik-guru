import { memo, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { formatIsoDateShort } from "@/lib/dates";
import { getGradeScorePalette, DEFAULT_GRADE_PREDIKAT, type SchoolGradePredikatSettings } from "@/lib/grade-recap-display";
import { elevation, radius, space } from "@/lib/theme";
import type { GuruGradePeriodRecap, GuruGradeStudentRecap } from "@/lib/types";
import {
  useRecapTableLayout,
  useRecapTableStyles,
} from "@/components/recap/recap-table-layout";

type Props = {
  recap: GuruGradePeriodRecap;
  predikatSettings?: SchoolGradePredikatSettings;
  onStudentPress?: (student: GuruGradeStudentRecap) => void;
};

function GradeRecapTableInner({
  recap,
  predikatSettings = DEFAULT_GRADE_PREDIKAT,
  onStudentPress,
}: Props) {
  const { colors, font, scale, t } = useTheme();
  const ts = useRecapTableStyles();
  const textStyles = useMemo(
    () => ({
      taskIndex: {
        fontSize: scale(12),
        fontWeight: "800" as const,
        lineHeight: scale(15),
      },
      taskDate: { fontSize: scale(10), lineHeight: scale(13), textAlign: "center" as const },
      scoreText: {
        fontSize: scale(13),
        fontWeight: "800" as const,
        textAlign: "center" as const,
      },
    }),
    [scale],
  );
  const { tasks, students } = recap;
  const layout = useRecapTableLayout();
  const dataWidth = Math.max(tasks.length, 1) * layout.taskColWidth;

  const rowStyle = (rowIndex: number) => ({
    height: layout.rowHeight,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: rowIndex % 2 === 1 ? colors.bg : colors.surface,
  });

  const renderNameCell = (student: GuruGradeStudentRecap, rowIndex: number) => {
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
          {students.map((student, rowIndex) =>
            renderNameCell(student, rowIndex),
          )}
        </View>

        <ScrollView
          horizontal
          style={ts.dataScroll}
          showsHorizontalScrollIndicator
          contentContainerStyle={{ minWidth: dataWidth }}
        >
          <View style={ts.dataGrid}>
            <View
              style={[
                ts.dataRow,
                styles.headerCell,
                {
                  width: dataWidth,
                  height: layout.headerHeight,
                  backgroundColor: colors.primaryMuted,
                  borderBottomColor: colors.primaryBorder,
                },
              ]}
            >
              {tasks.map((task, index) => (
                <View
                  key={task.taskId}
                  accessibilityLabel={task.title}
                  style={[
                    styles.taskHeaderCol,
                    {
                      width: layout.taskColWidth,
                      borderLeftColor: colors.border,
                      borderLeftWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <Text style={[textStyles.taskIndex, { color: colors.primary }]}>
                    {index + 1}
                  </Text>
                  <Text
                    style={[font.caption, textStyles.taskDate, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {formatIsoDateShort(task.taskDate)}
                  </Text>
                </View>
              ))}
            </View>

            {students.map((student, rowIndex) => (
              <View
                key={student.studentId}
                style={[ts.dataRow, rowStyle(rowIndex), { width: dataWidth }]}
              >
                {tasks.map((task, index) => {
                  const score = student.scores[task.taskId]?.trim();
                  const palette = getGradeScorePalette(score, predikatSettings);
                  return (
                    <View
                      key={task.taskId}
                      style={[
                        ts.valueCell,
                        styles.scoreCol,
                        {
                          width: layout.taskColWidth,
                          borderLeftColor: colors.border,
                          borderLeftWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                          backgroundColor: palette?.bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          textStyles.scoreText,
                          {
                            color: palette?.text ?? colors.textMuted,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {score || "—"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

export const GradeRecapTable = memo(GradeRecapTableInner);

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
  taskHeaderCol: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
    gap: 1,
  },
  scoreCol: {
    height: "100%",
  },
});
