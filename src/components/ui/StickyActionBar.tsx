import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/AppPreferencesContext";
import { elevation, space } from "@/lib/theme";

type Props = {
  children: ReactNode;
};

/** Bar aksi tetap di bawah layar (tidak ikut scroll). */
export function StickyActionBar({ children }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const minBottom = Platform.select({ android: 12, ios: 8, default: 8 }) ?? 8;

  return (
    <View
      style={[
        styles.bar,
        elevation(colors.cardShadow, "lg"),
        {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          paddingBottom: Math.max(insets.bottom, minBottom),
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    paddingTop: space.sm,
    paddingHorizontal: space.md,
    gap: space.sm,
  },
});
