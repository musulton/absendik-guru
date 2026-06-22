import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { LabelBadge } from "@/components/ui/LabelBadge";
import { useTheme } from "@/context/AppPreferencesContext";
import { elevation, radius, space } from "@/lib/theme";

type Props = {
  className: string;
  labelColorId?: string | null;
  studentCount: number;
  studentsLabel: string;
  onPressStudents?: () => void;
};

function ClassContextHeaderInner({
  className,
  labelColorId,
  studentCount,
  studentsLabel,
  onPressStudents,
}: Props) {
  const { colors, font } = useTheme();

  const countPill = (
    <View
      style={[
        styles.countPill,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
    >
      <Icon name="students" size={13} color={colors.textMuted} />
      <Text style={[font.caption, { fontWeight: "700" }]}>
        {studentCount} {studentsLabel}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        elevation(colors.cardShadow, "sm"),
      ]}
    >
      <View style={styles.titleWrap}>
        <LabelBadge label={className} colorId={labelColorId} seed={className} />
      </View>
      {onPressStudents ? (
        <Pressable
          onPress={onPressStudents}
          accessibilityRole="button"
          accessibilityLabel={studentsLabel}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          {countPill}
        </Pressable>
      ) : (
        countPill
      )}
    </View>
  );
}

export const ClassContextHeader = memo(ClassContextHeaderInner);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    marginBottom: space.sm,
  },
  titleWrap: { flex: 1, minWidth: 0 },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
  },
  pressed: { opacity: 0.88 },
});
