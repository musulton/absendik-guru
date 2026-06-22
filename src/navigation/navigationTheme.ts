import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from "@react-navigation/native";
import type { ThemeColors } from "@/lib/theme-palettes";

export function buildNavigationTheme(
  colors: ThemeColors,
  isDark: boolean,
): Theme {
  const base = isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: isDark,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.bg,
      card: colors.headerBg,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };
}
