import { lightTheme } from "@/lib/theme-palettes";

/** @deprecated Prefer useTheme() — tetap light defaults untuk kompatibilitas. */
export const colors = lightTheme;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/** Bayangan kartu yang konsisten & halus (light + Android elevation). */
export function elevation(
  shadowColor: string,
  level: "sm" | "md" | "lg" = "sm",
) {
  const map = {
    sm: { height: 1, radius: 3, elevation: 1, opacity: 0.85 },
    md: { height: 3, radius: 8, elevation: 3, opacity: 1 },
    lg: { height: 8, radius: 20, elevation: 6, opacity: 1 },
  } as const;
  const cfg = map[level];
  return {
    shadowColor,
    shadowOffset: { width: 0, height: cfg.height },
    shadowOpacity: cfg.opacity,
    shadowRadius: cfg.radius,
    elevation: cfg.elevation,
  };
}

export type FontSizePreference = "standard" | "large";

const FONT_SCALE: Record<FontSizePreference, number> = {
  standard: 1,
  large: 1.2,
};

let activeFontSizePreference: FontSizePreference = "standard";

export function setActiveFontSizePreference(pref: FontSizePreference) {
  activeFontSizePreference = pref;
}

export function getActiveFontSizePreference(): FontSizePreference {
  return activeFontSizePreference;
}

export function scaleFontSize(
  size: number,
  pref: FontSizePreference = activeFontSizePreference,
): number {
  return Math.round(size * FONT_SCALE[pref]);
}

export function makeFont(
  textColor: string,
  mutedColor: string,
  pref: FontSizePreference = activeFontSizePreference,
) {
  const s = (n: number) => scaleFontSize(n, pref);
  return {
    title: { fontSize: s(17), fontWeight: "700" as const, color: textColor },
    subtitle: { fontSize: s(13), color: mutedColor },
    body: { fontSize: s(15), color: textColor, lineHeight: s(22) },
    caption: { fontSize: s(12), color: mutedColor, lineHeight: s(18) },
    label: {
      fontSize: s(11),
      fontWeight: "600" as const,
      color: mutedColor,
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
    },
    hero: {
      fontSize: s(24),
      fontWeight: "800" as const,
      color: textColor,
      letterSpacing: -0.3,
    },
  };
}

/** @deprecated Prefer useTheme(). */
export const font = makeFont(colors.text, colors.textMuted);

export const screen = {
  contentPadding: space.md,
  listGap: space.sm,
};

export { lightTheme, darkTheme, type ThemeColors } from "@/lib/theme-palettes";
