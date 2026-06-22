import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius, space } from "@/lib/theme";

export type SegmentOption = { key: string; label: string };

type Props = {
  options: SegmentOption[];
  value: string;
  onChange: (key: string) => void;
  compact?: boolean;
  /** Paling ringkas — untuk toolbar rekap. */
  minimal?: boolean;
};

export function SegmentedChoice({
  options,
  value,
  onChange,
  compact,
  minimal,
}: Props) {
  const { colors, font } = useTheme();

  return (
    <View
      style={[
        styles.track,
        compact && styles.trackCompact,
        minimal && styles.trackMinimal,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            style={[
              styles.segment,
              compact && styles.segmentCompact,
              minimal && styles.segmentMinimal,
              active && [
                {
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.primaryBorder,
                },
                elevation(colors.cardShadow, "sm"),
              ],
            ]}
            onPress={withHaptic(() => onChange(opt.key))}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                font.caption,
                styles.label,
                minimal && [font.label, styles.labelMinimal],
                { color: active ? colors.primary : colors.textMuted },
              ]}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: space.md,
  },
  trackCompact: {
    marginBottom: space.sm,
  },
  trackMinimal: {
    marginBottom: 0,
    padding: 2,
    gap: 2,
    borderRadius: radius.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  segmentCompact: {
    paddingVertical: 6,
  },
  segmentMinimal: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  label: { fontWeight: "700", textTransform: "none" },
  labelMinimal: { textTransform: "none" },
});
