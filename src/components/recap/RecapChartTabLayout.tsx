import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { radius, space } from "@/lib/theme";

type Props = {
  metaLabel: string;
  children: ReactNode;
};

export function RecapChartTabLayout({ metaLabel, children }: Props) {
  const { colors, font, scale } = useTheme();

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.metaCard,
          { backgroundColor: colors.primaryMuted, borderColor: colors.primaryBorder },
        ]}
      >
        <Text
          style={[
            font.caption,
            styles.meta,
            { color: colors.primary, fontSize: scale(12), lineHeight: scale(16) },
          ]}
        >
          {metaLabel}
        </Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.md,
    paddingBottom: space.sm,
  },
  metaCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
  },
  meta: {
    fontWeight: "600",
  },
});
