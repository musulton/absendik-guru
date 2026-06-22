import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { resolveLabelColor } from "@/lib/label-colors";
import { radius, space } from "@/lib/theme";

export type ChipOption = {
  key: string;
  label: string;
  colorId?: string | null;
};

type Props = {
  options: ChipOption[];
  value: string;
  onChange: (key: string) => void;
  dense?: boolean;
};

export function ChipRow({ options, value, onChange, dense }: Props) {
  const { colors, font } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, dense && styles.rowDense]}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        const tinted = Boolean(opt.colorId);
        const palette = tinted
          ? resolveLabelColor(opt.colorId, opt.label)
          : null;
        return (
          <Pressable
            key={opt.key}
            style={[
              styles.chip,
              dense && styles.chipDense,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              tinted &&
                palette && {
                  backgroundColor: palette.bg,
                  borderColor: active ? palette.text : palette.bg,
                },
              !tinted &&
                active && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              tinted &&
                active &&
                palette && { borderColor: palette.text, borderWidth: 2 },
            ]}
            onPress={withHaptic(() => onChange(opt.key))}
          >
            <Text
              style={[
                font.caption,
                { fontWeight: "600" },
                tinted && palette && { color: palette.text },
                !tinted && active && { color: "#fff" },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.sm, paddingBottom: space.sm },
  rowDense: { gap: 6, paddingBottom: 4 },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipDense: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
});
