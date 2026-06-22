import { Pressable, StyleSheet, Text } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { radius } from "@/lib/theme";

export const HEADER_ICON_BUTTON_SIZE = 36;
export const HEADER_ICON_BUTTON_GAP = 2;

type Props = {
  /** Nama ikon semantik (disarankan). */
  icon?: IconName;
  /** Fallback teks lama — dipertahankan untuk kompatibilitas. */
  label?: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function HeaderIconButton({
  icon,
  label,
  onPress,
  accessibilityLabel,
}: Props) {
  const { colors, scale } = useTheme();

  return (
    <Pressable
      onPress={withHaptic(onPress)}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: pressed ? colors.primaryMuted : "transparent" },
      ]}
    >
      {icon ? (
        <Icon name={icon} size={22} color={colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: colors.primary, fontSize: scale(20) },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: HEADER_ICON_BUTTON_SIZE,
    height: HEADER_ICON_BUTTON_SIZE,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontWeight: "600" },
});
