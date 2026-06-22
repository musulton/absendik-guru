import { Pressable, StyleSheet, Text } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { radius } from "@/lib/theme";

type Props = {
  icon: IconName;
  label: string;
  onPress: () => void;
  backgroundColor: string;
  borderColor: string;
  iconColor: string;
  compact?: boolean;
};

export function ActionChip({
  icon,
  label,
  onPress,
  backgroundColor,
  borderColor,
  iconColor,
  compact,
}: Props) {
  const { font } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        compact && styles.chipCompact,
        { backgroundColor, borderColor },
        pressed && styles.pressed,
      ]}
      onPress={withHaptic(onPress)}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon name={icon} size={compact ? 14 : 16} color={iconColor} />
      <Text style={[font.caption, styles.label, { color: iconColor }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 88,
  },
  chipCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 0,
    flexShrink: 0,
  },
  label: { fontWeight: "700", flexShrink: 1 },
  pressed: { opacity: 0.88 },
});
