import type { ReactNode } from "react";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { radius, space } from "@/lib/theme";

type Props = {
  title: string;
  subtitle: string;
  caption?: ReactNode;
  icon?: IconName;
};

/** Blok judul di atas layar informasi / login. */
export function InfoHero({ title, subtitle, caption, icon }: Props) {
  const { colors, font, scale } = useTheme();
  const titleStyle = useMemo(
    () => ({
      fontSize: scale(24),
      fontWeight: "800" as const,
      marginBottom: space.sm,
      letterSpacing: -0.3,
    }),
    [scale],
  );

  return (
    <View
      style={[
        styles.hero,
        {
          backgroundColor: colors.primaryMuted,
          borderColor: colors.primaryBorder,
        },
      ]}
    >
      {icon ? (
        <View style={[styles.iconBadge, { backgroundColor: colors.surface }]}>
          <Icon name={icon} size={26} color={colors.primary} />
        </View>
      ) : null}
      <Text style={[titleStyle, { color: colors.primary }]}>{title}</Text>
      <Text style={[font.body, { lineHeight: font.body.lineHeight }]}>{subtitle}</Text>
      {caption ? (
        typeof caption === "string" ? (
          <Text style={[font.caption, { marginTop: space.sm }]}>{caption}</Text>
        ) : (
          caption
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.lg,
    marginBottom: space.lg,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.md,
  },
});
