import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { resolveLabelColor } from "@/lib/label-colors";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius, space } from "@/lib/theme";

type ActionProps = {
  variant?: "actions";
  fullName: string;
  studentNumber?: string | null;
  onAttendance: () => void;
  onGrades: () => void;
  onStudentNotes?: () => void;
  onStudentNotesHistory?: () => void;
  onManage?: () => void;
  attendanceLabel: string;
  gradesLabel: string;
  studentNotesLabel?: string;
  studentNotesHistoryLabel?: string;
  manageLabel?: string;
  showAttendance?: boolean;
  showGrades?: boolean;
  showStudentNotes?: boolean;
  showStudentNotesHistory?: boolean;
};

type NotesPickProps = {
  variant: "notes";
  fullName: string;
  studentNumber?: string | null;
  actionHint: string;
  onPress: () => void;
  onHistory?: () => void;
  historyLabel?: string;
};

type NavigateProps = {
  variant: "navigate";
  fullName: string;
  studentNumber?: string | null;
  actionHint: string;
  onPress: () => void;
};

type Props = ActionProps | NavigateProps | NotesPickProps;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StudentListCardInner(props: Props) {
  const { colors, font, scale } = useTheme();
  const textStyles = useMemo(
    () => ({
      avatarText: { fontSize: scale(12), fontWeight: "800" as const },
      name: { fontWeight: "700" as const },
    }),
    [scale],
  );

  if (props.variant === "navigate") {
    const { fullName, studentNumber, actionHint, onPress } = props;
    const palette = resolveLabelColor(null, fullName);

    return (
      <Pressable
        onPress={withHaptic(onPress)}
        style={({ pressed }) => [
          styles.cardNavigate,
          { backgroundColor: colors.surface, borderColor: colors.border },
          elevation(colors.cardShadow, "sm"),
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
      >
        <View style={styles.top}>
          <View style={styles.identityNavigate}>
            <View style={[styles.avatar, { backgroundColor: palette.bg }]}>
              <Text style={[textStyles.avatarText, { color: palette.text }]}>
                {initials(fullName)}
              </Text>
            </View>
            <View style={styles.nameWrap}>
              <Text style={[font.body, textStyles.name, { color: colors.text }]}>
                {fullName}
              </Text>
              {studentNumber ? (
                <Text style={[font.caption, { color: colors.textMuted }]}>
                  NIS {studentNumber}
                </Text>
              ) : null}
            </View>
          </View>
          <Icon name="chevronRight" size={20} color={colors.textMuted} />
        </View>
        <Text
          style={[font.caption, { color: colors.primary, fontWeight: "600" }]}
          numberOfLines={1}
        >
          {actionHint}
        </Text>
      </Pressable>
    );
  }

  if (props.variant === "notes") {
    const { fullName, studentNumber, actionHint, onPress, onHistory, historyLabel } =
      props;
    const palette = resolveLabelColor(null, fullName);

    return (
      <View
        style={[
          styles.cardNotes,
          { backgroundColor: colors.surface, borderColor: colors.border },
          elevation(colors.cardShadow, "sm"),
        ]}
      >
        <Pressable
          onPress={withHaptic(onPress)}
          style={({ pressed }) => [
            styles.identityNotes,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${fullName}. ${actionHint}`}
        >
          <View style={[styles.avatar, { backgroundColor: palette.bg }]}>
            <Text style={[textStyles.avatarText, { color: palette.text }]}>
              {initials(fullName)}
            </Text>
          </View>
          <View style={styles.nameWrap}>
            <Text style={[font.body, textStyles.name, { color: colors.text }]} numberOfLines={2}>
              {fullName}
            </Text>
            {studentNumber ? (
              <Text
                style={[font.caption, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                NIS {studentNumber}
              </Text>
            ) : null}
            <Text
              style={[
                font.caption,
                styles.notesActionHint,
                { color: colors.primary, fontSize: scale(11) },
              ]}
              numberOfLines={1}
            >
              {actionHint}
            </Text>
          </View>
        </Pressable>
        {onHistory ? (
          <Pressable
            style={({ pressed }) => [
              styles.historyBtn,
              { backgroundColor: colors.bg, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={withHaptic(onHistory)}
            accessibilityRole="button"
            accessibilityLabel={historyLabel}
          >
            <Icon name="recap" size={20} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
    );
  }

  const {
    fullName,
    studentNumber,
    onAttendance,
    onGrades,
    onStudentNotes,
    onStudentNotesHistory,
    onManage,
    attendanceLabel,
    gradesLabel,
    studentNotesLabel,
    studentNotesHistoryLabel,
    manageLabel,
    showAttendance = true,
    showGrades = true,
    showStudentNotes = false,
    showStudentNotesHistory = false,
  } = props;
  const palette = resolveLabelColor(null, fullName);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        elevation(colors.cardShadow, "sm"),
      ]}
    >
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: palette.bg }]}>
          <Text style={[textStyles.avatarText, { color: palette.text }]}>
            {initials(fullName)}
          </Text>
        </View>
        <View style={styles.nameWrap}>
          <Text style={[font.body, textStyles.name]} numberOfLines={2}>
            {fullName}
          </Text>
          {studentNumber ? (
            <Text
              style={[font.caption, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              NIS {studentNumber}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        {showAttendance ? (
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: colors.primaryMuted,
                borderColor: colors.primaryBorder,
              },
              pressed && styles.pressed,
            ]}
            onPress={withHaptic(onAttendance)}
            accessibilityRole="button"
            accessibilityLabel={attendanceLabel}
          >
            <Icon name="attendance" size={15} color={colors.primary} />
          </Pressable>
        ) : null}
        {showGrades ? (
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: colors.bg, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={withHaptic(onGrades)}
            accessibilityRole="button"
            accessibilityLabel={gradesLabel}
          >
            <Icon name="grades" size={15} color={colors.text} />
          </Pressable>
        ) : null}
        {showStudentNotesHistory && onStudentNotesHistory ? (
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: colors.bg, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={withHaptic(onStudentNotesHistory)}
            accessibilityRole="button"
            accessibilityLabel={studentNotesHistoryLabel}
          >
            <Icon name="recap" size={15} color={colors.text} />
          </Pressable>
        ) : null}
        {showStudentNotes && onStudentNotes ? (
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: colors.primaryMuted,
                borderColor: colors.primaryBorder,
              },
              pressed && styles.pressed,
            ]}
            onPress={withHaptic(onStudentNotes)}
            accessibilityRole="button"
            accessibilityLabel={studentNotesLabel}
          >
            <Icon name="studentNote" size={15} color={colors.primary} />
          </Pressable>
        ) : null}
        {onManage ? (
          <Pressable
            onPress={withHaptic(onManage)}
            hitSlop={6}
            style={({ pressed }) => [
              styles.iconBtn,
              { borderColor: colors.border },
              pressed && { backgroundColor: colors.primaryMuted },
            ]}
            accessibilityRole="button"
            accessibilityLabel={manageLabel}
          >
            <Icon name="more" size={15} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export const StudentListCard = memo(StudentListCardInner);

const styles = StyleSheet.create({
  cardNavigate: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    marginBottom: space.sm,
    gap: 8,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  identityNavigate: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    marginBottom: 4,
  },
  cardNotes: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    paddingVertical: 8,
    marginBottom: space.sm,
  },
  identityNotes: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  notesActionHint: { fontWeight: "600", marginTop: 2 },
  identity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  nameWrap: { flex: 1, minWidth: 0, gap: 0 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  historyBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pressed: { opacity: 0.88 },
});
