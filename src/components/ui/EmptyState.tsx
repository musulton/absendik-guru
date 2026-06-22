import { StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { elevation, radius, space } from "@/lib/theme";

type Props = {
  message: string;
  title?: string;
  icon?: IconName;
};

export function EmptyState({ message, title, icon = "info" }: Props) {
  const { colors, font } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        elevation(colors.cardShadow, "sm"),
      ]}
    >
      <View style={[styles.iconRing, { borderColor: colors.primaryBorder }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
          <Icon name={icon} size={28} color={colors.primary} />
        </View>
      </View>
      {title ? (
        <Text style={[font.body, styles.title, { color: colors.text }]}>
          {title}
        </Text>
      ) : null}
      <Text style={[font.caption, styles.message, { color: colors.textMuted }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
    gap: space.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    marginTop: space.sm,
  },
  iconRing: {
    borderWidth: 2,
    borderRadius: radius.pill,
    padding: 3,
    marginBottom: space.xs,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontWeight: "700", textAlign: "center" },
  message: { textAlign: "center", lineHeight: 20, maxWidth: 280 },
});
