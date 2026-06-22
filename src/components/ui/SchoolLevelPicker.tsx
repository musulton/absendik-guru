import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { SCHOOL_LEVEL_OPTIONS } from "@/lib/workspace-display";
import { radius, space } from "@/lib/theme";
import type { GuruSchoolLevel } from "@/lib/types";

type Props = {
  value: GuruSchoolLevel | "";
  onChange: (level: GuruSchoolLevel) => void;
};

export function SchoolLevelPicker({ value, onChange }: Props) {
  const { colors, font } = useTheme();

  return (
    <View style={styles.wrap}>
      {SCHOOL_LEVEL_OPTIONS.map((opt) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            style={[
              styles.chip,
              { borderColor: colors.border, backgroundColor: colors.surface },
              active && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => onChange(opt.key)}
          >
            <Text
              style={[
                font.caption,
                styles.label,
                active && styles.labelActive,
              ]}
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
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: space.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  label: { fontWeight: "600" },
  labelActive: { color: "#fff" },
});
