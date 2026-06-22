import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { LabelBadge } from "@/components/ui/LabelBadge";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius, space } from "@/lib/theme";

type ActionProps = {
  variant: "actions";
  name: string;
  labelColorId?: string | null;
  studentCount: number;
  studentsLabel: string;
  attendanceLabel: string;
  gradesLabel: string;
  manageLabel: string;
  onAttendance: () => void;
  onGrades: () => void;
  onManage: () => void;
  onLongPress?: () => void;
  showAttendance?: boolean;
  showGrades?: boolean;
};

type NavigateProps = {
  variant: "navigate";
  name: string;
  labelColorId?: string | null;
  studentCount: number;
  studentsLabel: string;
  actionHint: string;
  onPress: () => void;
};

type Props = ActionProps | NavigateProps;

function ClassListCardInner(props: Props) {
  const { colors, font, scale } = useTheme();
  const studentMetaStyle = useMemo(
    () => ({ fontSize: scale(11), lineHeight: scale(14) }),
    [scale],
  );

  if (props.variant === "navigate") {
    const { name, labelColorId, studentCount, studentsLabel, actionHint, onPress } =
      props;

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
          <View style={styles.titleWrap}>
            <LabelBadge label={name} colorId={labelColorId} seed={name} />
          </View>
          <Icon name="chevronRight" size={20} color={colors.textMuted} />
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="students" size={14} color={colors.textMuted} />
            <Text style={[font.caption, { color: colors.textMuted }]}>
              {studentCount} {studentsLabel}
            </Text>
          </View>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <Text
            style={[font.caption, { color: colors.primary, fontWeight: "600" }]}
            numberOfLines={1}
          >
            {actionHint}
          </Text>
        </View>
      </Pressable>
    );
  }

  const {
    name,
    labelColorId,
    studentCount,
    studentsLabel,
    attendanceLabel,
    gradesLabel,
    manageLabel,
    onAttendance,
    onGrades,
    onManage,
    onLongPress,
    showAttendance = true,
    showGrades = true,
  } = props;

  return (
    <Pressable
      onLongPress={onLongPress ? withHaptic(onLongPress) : undefined}
      style={({ pressed }) => [
        styles.cardActions,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        elevation(colors.cardShadow, "sm"),
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.titleWrap}>
        <LabelBadge label={name} colorId={labelColorId} seed={name} compact />
        <View style={styles.metaItem}>
          <Icon name="students" size={12} color={colors.textMuted} />
          <Text style={[font.caption, studentMetaStyle, { color: colors.textMuted }]}>
            {studentCount} {studentsLabel}
          </Text>
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
      </View>
    </Pressable>
  );
}

export const ClassListCard = memo(ClassListCardInner);

const styles = StyleSheet.create({
  cardNavigate: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    marginBottom: space.sm,
    gap: 10,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 4,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
  },
  pressed: { opacity: 0.88 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  titleWrap: { flex: 1, minWidth: 0, gap: 3 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 3, height: 3, borderRadius: radius.pill },
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
});
