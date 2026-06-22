import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { LabelBadge } from "@/components/ui/LabelBadge";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius, space } from "@/lib/theme";

type ActionProps = {
  variant?: "actions";
  title: string;
  labelColorId?: string | null;
  onAttendance: () => void;
  onGrades: () => void;
  onManage?: () => void;
  onLongPress?: () => void;
  attendanceLabel: string;
  gradesLabel: string;
  manageLabel?: string;
  showAttendance?: boolean;
  showGrades?: boolean;
};

type NavigateProps = {
  variant: "navigate";
  title: string;
  labelColorId?: string | null;
  actionHint: string;
  onPress: () => void;
};

type Props = ActionProps | NavigateProps;

function SubjectListCardInner(props: Props) {
  const { colors, font } = useTheme();

  if (props.variant === "navigate") {
    const { title, labelColorId, actionHint, onPress } = props;
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
        <View style={styles.navigateTop}>
          <View style={styles.titleWrap}>
            <LabelBadge label={title} colorId={labelColorId} seed={title} />
          </View>
          <Icon name="chevronRight" size={20} color={colors.textMuted} />
        </View>
        <Text
          style={[
            font.caption,
            { color: colors.primary, fontWeight: "600", marginTop: 6 },
          ]}
        >
          {actionHint}
        </Text>
      </Pressable>
    );
  }

  const {
    title,
    labelColorId,
    onAttendance,
    onGrades,
    onManage,
    onLongPress,
    attendanceLabel,
    gradesLabel,
    manageLabel,
    showAttendance = true,
    showGrades = true,
  } = props;

  return (
    <Pressable
      onLongPress={onLongPress ? withHaptic(onLongPress) : undefined}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        elevation(colors.cardShadow, "sm"),
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.titleWrap}>
        <LabelBadge label={title} colorId={labelColorId} seed={title} compact />
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
    </Pressable>
  );
}

export const SubjectListCard = memo(SubjectListCardInner);

const styles = StyleSheet.create({
  cardNavigate: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    marginBottom: space.sm,
  },
  navigateTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: 4,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
  },
  titleWrap: { flex: 1, minWidth: 0 },
  pressed: { opacity: 0.88 },
  actions: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0 },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
