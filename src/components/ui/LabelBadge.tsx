import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { resolveLabelColor } from "@/lib/label-colors";
import { radius } from "@/lib/theme";

type Props = {
  label: string;
  colorId?: string | null;
  seed: string;
  /** Ukuran kecil untuk chip mata pelajaran. */
  compact?: boolean;
};

export function LabelBadge({ label, colorId, seed, compact }: Props) {
  const { scale } = useTheme();
  const textStyles = useMemo(
    () => ({
      text: {
        fontSize: scale(14),
        fontWeight: "700" as const,
        lineHeight: scale(18),
      },
      textCompact: { fontSize: scale(12), lineHeight: scale(16) },
    }),
    [scale],
  );
  const palette = resolveLabelColor(colorId, seed);
  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        { backgroundColor: palette.bg },
      ]}
    >
      <Text
        style={[
          textStyles.text,
          compact && textStyles.textCompact,
          { color: palette.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: "100%",
  },
  badgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
