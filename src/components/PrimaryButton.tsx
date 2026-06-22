import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { radius, scaleFontSize, space } from "@/lib/theme";

type Props = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
  size?: "default" | "compact";
};

export function PrimaryButton({
  title,
  loading,
  variant = "primary",
  size = "default",
  disabled,
  onPress,
  ...rest
}: Props) {
  const { colors, fontSize } = useTheme();
  const isPrimary = variant === "primary";
  const compact = size === "compact";
  const textStyles = useMemo(
    () =>
      StyleSheet.create({
        text: {
          color: "#fff",
          fontSize: scaleFontSize(15, fontSize),
          fontWeight: "600",
        },
        textCompact: { fontSize: scaleFontSize(14, fontSize) },
      }),
    [fontSize],
  );

  return (
    <Pressable
      style={[
        styles.base,
        compact && styles.baseCompact,
        isPrimary
          ? { backgroundColor: colors.primary }
          : {
              backgroundColor: colors.primaryMuted,
              borderWidth: 1,
              borderColor: colors.primaryBorder,
            },
        (disabled || loading) && styles.disabled,
      ]}
      disabled={disabled || loading}
      onPress={onPress ? withHaptic(onPress) : undefined}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : colors.primary} />
      ) : (
        <Text
          style={[
            textStyles.text,
            compact && textStyles.textCompact,
            !isPrimary && { color: colors.primary },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    alignItems: "center",
  },
  baseCompact: {
    paddingVertical: 10,
    paddingHorizontal: space.md,
  },
  disabled: { opacity: 0.6 },
});
