import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { elevation, radius, space } from "@/lib/theme";

type Props = {
  children: ReactNode;
  icon?: IconName;
};

export function ScreenHint({ children, icon = "info" }: Props) {
  const { colors, font } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.primaryMuted,
          borderColor: colors.primaryBorder,
        },
        elevation(colors.cardShadow, "sm"),
      ]}
    >
      <Icon name={icon} size={15} color={colors.primary} />
      <Text style={[font.caption, styles.text, { color: colors.text }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    marginBottom: space.sm,
  },
  text: { flex: 1, lineHeight: 18, fontWeight: "500" },
});
