import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { radius, space } from "@/lib/theme";

type Props = {
  title: string;
  action?: React.ReactNode;
  dense?: boolean;
};

export function SectionLabel({ title, action, dense }: Props) {
  const { colors, font } = useTheme();

  return (
    <View style={[styles.row, dense && styles.rowDense]}>
      <View style={styles.labelWrap}>
        <View style={[styles.accent, { backgroundColor: colors.primary }]} />
        <Text style={[font.label, { color: colors.textMuted }]}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: space.sm,
    marginTop: space.xs,
  },
  rowDense: {
    marginBottom: space.xs,
    marginTop: 2,
  },
  labelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    flex: 1,
  },
  accent: {
    width: 3,
    height: 14,
    borderRadius: radius.pill,
  },
});
