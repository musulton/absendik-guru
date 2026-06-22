import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  DEFAULT_LABEL_COLOR_ID,
  LABEL_COLOR_OPTIONS,
  type LabelColorOption,
} from "@/lib/label-colors";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { space } from "@/lib/theme";

type Props = {
  value: string;
  onChange: (colorId: string) => void;
};

export function LabelColorPicker({ value, onChange }: Props) {
  const { colors, font, t } = useTheme();
  const selected = value || DEFAULT_LABEL_COLOR_ID;

  return (
    <View style={styles.wrap}>
      <Text style={[font.caption, { fontWeight: "600" }]}>
        {t("class.labelColor")}
      </Text>
      <View style={styles.grid}>
        {LABEL_COLOR_OPTIONS.map((opt) => (
          <ColorDot
            key={opt.id}
            option={opt}
            active={selected === opt.id}
            onPress={() => onChange(opt.id)}
          />
        ))}
      </View>
    </View>
  );
}

function ColorDot({
  option,
  active,
  onPress,
}: {
  option: LabelColorOption;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={withHaptic(onPress)}
      style={[
        styles.dot,
        { backgroundColor: option.bg, borderColor: option.text },
        active && styles.dotActive,
      ]}
      accessibilityLabel={option.id}
    >
      {active ? <Icon name="check" size={16} color={option.text} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm, marginBottom: space.md },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dotActive: {
    borderWidth: 3,
  },
});
