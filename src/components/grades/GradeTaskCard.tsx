import { memo, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Icon } from "@/components/ui/Icon";
import { AccentCard } from "@/components/ui/AccentCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { radius, space } from "@/lib/theme";
import type { GuruGradeStudentRow, GuruGradeTask } from "@/lib/types";

type Props = {
  task: GuruGradeTask;
  expanded: boolean;
  readOnly: boolean;
  title: string;
  students: GuruGradeStudentRow[];
  saving: boolean;
  scoreSummary?: string | null;
  titlePlaceholder: string;
  titleLabel: string;
  studentColumnLabel: string;
  scoreColumnLabel: string;
  scorePlaceholder: string;
  saveLabel: string;
  editLabel: string;
  deleteLabel: string;
  /** Skor per siswa untuk tugas ini — isolasi re-render antar kartu. */
  taskScores?: Record<string, string | null>;
  onToggle: () => void;
  onTitleChange: (text: string) => void;
  onScoreChange: (studentId: string, score: string) => void;
  onSave: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onStudentDetail?: (student: GuruGradeStudentRow) => void;
  /** Dipanggil saat input judul/nilai difokus — untuk scroll ke field. */
  onInputFocus?: (studentIndex?: number) => void;
};

function GradeTaskCardInner({
  task,
  expanded,
  readOnly,
  title,
  students,
  saving,
  scoreSummary,
  titlePlaceholder,
  titleLabel,
  studentColumnLabel,
  scoreColumnLabel,
  scorePlaceholder,
  saveLabel,
  editLabel,
  deleteLabel,
  onToggle,
  onTitleChange,
  onScoreChange,
  onSave,
  onStartEdit,
  onDelete,
  onStudentDetail,
  onInputFocus,
  taskScores,
}: Props) {
  const { colors, font, scale } = useTheme();
  const textStyles = useMemo(
    () => ({
      headerTitle: {
        flex: 1,
        fontWeight: "700" as const,
        fontSize: scale(14),
        lineHeight: scale(18),
      },
      headerMeta: { fontSize: scale(11), lineHeight: scale(14) },
      titleInput: {
        fontSize: scale(14),
        fontWeight: "600" as const,
      },
      titleReadOnly: {
        fontSize: scale(14),
        fontWeight: "600" as const,
        lineHeight: scale(20),
      },
      studentName: { flex: 1, minWidth: 0, fontSize: scale(13), fontWeight: "600" as const },
      scoreInput: { fontSize: scale(13), fontWeight: "700" as const },
      scoreReadOnly: { fontSize: scale(13), fontWeight: "700" as const, textAlign: "center" as const },
    }),
    [scale],
  );
  const displayTitle = title.trim() || task.title;
  const accentColor = readOnly ? colors.primary : expanded ? colors.accent : colors.primary;

  return (
    <AccentCard
      accentColor={accentColor}
      tintColor={expanded ? colors.primaryMuted : undefined}
      style={styles.cardOuter}
    >
      <Pressable
        style={[
          styles.header,
          expanded && { backgroundColor: colors.primaryMuted },
        ]}
        onPress={withHaptic(onToggle)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <IconBadge
          icon={readOnly ? "check" : "grades"}
          backgroundColor={readOnly || !expanded ? colors.primaryMuted : colors.primary}
          color={readOnly || !expanded ? colors.primary : "#fff"}
          size="sm"
        />
        <View style={styles.headerText}>
          <Text style={[font.body, textStyles.headerTitle]} numberOfLines={2}>
            {displayTitle}
          </Text>
          {readOnly && scoreSummary && !expanded ? (
            <View style={[styles.metaPill, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <Icon name="students" size={12} color={colors.textMuted} />
              <Text
                style={[font.caption, textStyles.headerMeta, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {scoreSummary}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={[styles.chevronPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Icon
            name={expanded ? "chevronUp" : "chevronDown"}
            size={18}
            color={colors.textMuted}
          />
        </View>
      </Pressable>
      {expanded ? (
        <View style={[styles.body, { borderTopColor: colors.border }]}>
          {readOnly ? (
            <Text
              style={[font.body, textStyles.titleReadOnly, { color: colors.text }]}
              numberOfLines={3}
            >
              {displayTitle}
            </Text>
          ) : (
            <View style={styles.titleField}>
              <Text style={[font.label, styles.titleLabel, { color: colors.textMuted }]}>
                {titleLabel}
              </Text>
              <TextInput
                style={[
                  styles.titleInput,
                  textStyles.titleInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.primaryBorder,
                    color: colors.text,
                  },
                ]}
                placeholder={titlePlaceholder}
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={onTitleChange}
                onFocus={() => onInputFocus?.()}
              />
            </View>
          )}
          {students.length > 0 ? (
            <View style={styles.scoreSection}>
              <View style={styles.scoreHeader}>
                <Text
                  style={[
                    font.caption,
                    styles.scoreHeaderText,
                    { color: colors.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {studentColumnLabel}
                </Text>
                <Text
                  style={[
                    font.caption,
                    styles.scoreHeaderText,
                    styles.scoreHeaderValue,
                    { color: colors.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {scoreColumnLabel}
                </Text>
              </View>
              {students.map((row, index) => {
            const scoreValue =
              taskScores?.[row.studentId] ?? row.scores[task.id] ?? null;
            const hasScore = Boolean(scoreValue?.trim());
            return (
            <View
              key={row.studentId}
              style={styles.scoreRow}
            >
              {onStudentDetail ? (
                <Pressable
                  style={styles.nameWrap}
                  onPress={withHaptic(() => onStudentDetail(row))}
                >
                  <Text
                    style={[
                      font.caption,
                      textStyles.studentName,
                      { color: colors.primary },
                    ]}
                    numberOfLines={1}
                  >
                    {row.fullName}
                  </Text>
                </Pressable>
              ) : (
                <Text
                  style={[font.caption, textStyles.studentName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {row.fullName}
                </Text>
              )}
              {readOnly ? (
                <View
                  style={[
                    styles.scoreField,
                    styles.scoreFieldReadOnly,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      font.caption,
                      textStyles.scoreReadOnly,
                      { color: hasScore ? colors.text : colors.textMuted },
                    ]}
                  >
                    {scoreValue?.trim() || "—"}
                  </Text>
                </View>
              ) : (
                <TextInput
                  style={[
                    styles.scoreField,
                    textStyles.scoreInput,
                    {
                      backgroundColor: colors.surface,
                      borderColor: hasScore ? colors.accent : colors.primaryBorder,
                      color: colors.text,
                    },
                  ]}
                  placeholder={scorePlaceholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  value={scoreValue ?? ""}
                  onChangeText={(text) => onScoreChange(row.studentId, text)}
                  onFocus={() => onInputFocus?.(index)}
                  accessibilityLabel={`${scoreColumnLabel} ${row.fullName}`}
                />
              )}
            </View>
            );
          })}
            </View>
          ) : null}
          <View style={styles.actions}>
            <View style={styles.actionBtn}>
              {readOnly ? (
                <PrimaryButton
                  title={editLabel}
                  size="compact"
                  onPress={onStartEdit}
                />
              ) : (
                <PrimaryButton
                  title={saveLabel}
                  size="compact"
                  loading={saving}
                  onPress={onSave}
                />
              )}
            </View>
            <View style={styles.actionBtn}>
              <PrimaryButton
                title={deleteLabel}
                variant="secondary"
                size="compact"
                onPress={onDelete}
              />
            </View>
          </View>
        </View>
      ) : null}
    </AccentCard>
  );
}

export const GradeTaskCard = memo(GradeTaskCardInner);

const styles = StyleSheet.create({
  cardOuter: {
    marginBottom: space.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.sm,
    paddingVertical: 8,
    gap: space.xs,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chevronPill: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  body: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.sm,
    paddingBottom: space.xs,
  },
  titleField: {
    marginTop: space.xs,
    marginBottom: 2,
    gap: 2,
  },
  titleLabel: {
    fontWeight: "600",
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    minHeight: 36,
  },
  scoreSection: {
    marginTop: space.xs,
    gap: 0,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: 2,
    paddingHorizontal: 2,
    marginBottom: 2,
  },
  scoreHeaderText: {
    flex: 1,
    minWidth: 0,
    fontWeight: "700",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  scoreHeaderValue: {
    flex: 0,
    width: 64,
    textAlign: "center",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  nameWrap: { flex: 1, minWidth: 0 },
  scoreField: {
    width: 64,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minHeight: 34,
    textAlign: "center",
  },
  scoreFieldReadOnly: {
    alignItems: "center",
    justifyContent: "center",
  },
  scoreInput: {
    fontSize: 14,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: space.xs,
    marginTop: space.xs,
  },
  actionBtn: { flex: 1 },
});
