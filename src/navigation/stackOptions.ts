import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { scaleFontSize, type FontSizePreference } from "@/lib/theme";
import { lightTheme, type ThemeColors } from "@/lib/theme-palettes";

export function getStackScreenOptions(
  colors: ThemeColors,
  fontSize: FontSizePreference = "standard",
): NativeStackNavigationOptions {
  return {
    headerShown: true,
    headerTintColor: colors.primary,
    headerStyle: { backgroundColor: colors.headerBg },
    headerTitleStyle: {
      fontSize: scaleFontSize(16, fontSize),
      fontWeight: "600",
      color: colors.text,
    },
    headerShadowVisible: false,
    headerRightContainerStyle: {
      paddingRight: 10,
      paddingLeft: 0,
      backgroundColor: colors.headerBg,
    },
    contentStyle: { backgroundColor: colors.bg },
    animation: "slide_from_right",
  };
}

/** @deprecated gunakan getStackScreenOptions(useTheme().colors, useTheme().fontSize) */
export const stackScreenOptions = getStackScreenOptions(lightTheme);
