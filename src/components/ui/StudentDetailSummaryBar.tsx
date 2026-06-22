import { StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { elevation, radius, space } from "@/lib/theme";

type Props = {
  text: string;
};

export function StudentDetailSummaryBar({ text }: Props) {
  const { colors, font } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primaryBorder,
        },
        elevation(colors.cardShadow, "sm"),
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
        <Icon name="recap" size={14} color={colors.primary} />
      </View>
      <Text style={[font.caption, styles.text, { color: colors.text }]} numberOfLines={3}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    marginBottom: space.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  text: { flex: 1, fontWeight: "600", lineHeight: 18 },
});
