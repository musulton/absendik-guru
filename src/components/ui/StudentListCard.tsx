import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { resolveLabelColor } from "@/lib/label-colors";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius, space } from "@/lib/theme";

type Props = {
  fullName: string;
  studentNumber?: string | null;
  onAttendance: () => void;
  onGrades: () => void;
  onManage?: () => void;
  attendanceLabel: string;
  gradesLabel: string;
  manageLabel?: string;
  showAttendance?: boolean;
  showGrades?: boolean;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StudentListCardInner({
  fullName,
  studentNumber,
  onAttendance,
  onGrades,
  onManage,
  attendanceLabel,
  gradesLabel,
  manageLabel,
  showAttendance = true,
  showGrades = true,
}: Props) {
  const { colors, font, scale } = useTheme();
  const textStyles = useMemo(
    () => ({
      avatarText: { fontSize: scale(12), fontWeight: "800" as const },
      name: { fontWeight: "600" as const },
    }),
    [scale],
  );
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
          <Text style={[font.body, textStyles.name]} numberOfLines={1}>
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
  pressed: { opacity: 0.88 },
});
