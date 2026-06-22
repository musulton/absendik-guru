import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { elevation, makeFont, radius, screen, space, type FontSizePreference } from "@/lib/theme";
import type { ThemeColors } from "@/lib/theme-palettes";

export function createListStyles(colors: ThemeColors) {
  return StyleSheet.create({
    list: { flex: 1, backgroundColor: colors.bg },
    listContent: {
      paddingHorizontal: screen.contentPadding,
      paddingTop: screen.contentPadding,
      paddingBottom: 28,
      flexGrow: 1,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.bg,
    },
  });
}

export function createFormStyles(colors: ThemeColors, fontSize: FontSizePreference) {
  const font = makeFont(colors.text, colors.textMuted, fontSize);
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    hint: {
      ...font.caption,
      color: colors.textMuted,
      marginBottom: space.sm,
      lineHeight: font.caption.lineHeight,
    },
    actions: { gap: space.sm, marginTop: space.xs },
    field: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: space.md,
      paddingVertical: 14,
      fontSize: font.body.fontSize,
      color: colors.text,
      backgroundColor: colors.surface,
      marginBottom: space.md,
      ...elevation(colors.cardShadow, "sm"),
    },
  });
}

export function createScreenUi(colors: ThemeColors, fontSize: FontSizePreference) {
  const font = makeFont(colors.text, colors.textMuted, fontSize);
  return StyleSheet.create({
    hint: {
      ...font.caption,
      color: colors.textMuted,
      marginBottom: space.sm,
      lineHeight: font.caption.lineHeight,
    },
    empty: {
      ...font.body,
      color: colors.textMuted,
      lineHeight: font.body.lineHeight,
      marginTop: space.xs,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: space.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: space.md,
      gap: space.sm,
      overflow: "hidden",
      ...elevation(colors.cardShadow, "sm"),
    },
    cardDanger: {
      borderColor: colors.dangerBorder,
      backgroundColor: colors.dangerBg,
    },
    cardTitle: { ...font.body, fontWeight: "700" },
    cardTitleDanger: { ...font.body, fontWeight: "700", color: colors.danger },
    cardText: { ...font.caption, lineHeight: font.caption.lineHeight, color: colors.text },
    cardTextMuted: { ...font.caption, color: colors.textMuted, lineHeight: font.caption.lineHeight },
    cardAccent: { ...font.caption, fontWeight: "600", color: colors.primary },
    hero: {
      backgroundColor: colors.primaryMuted,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      padding: space.lg,
      marginBottom: space.lg,
    },
    heroTitle: {
      fontSize: font.hero.fontSize,
      fontWeight: "800",
      color: colors.primary,
      marginBottom: space.sm,
    },
    heroBody: { ...font.body, lineHeight: font.body.lineHeight },
    heroCaption: {
      ...font.caption,
      color: colors.textMuted,
      marginTop: space.sm,
    },
    okBanner: {
      backgroundColor: colors.successBg,
      borderRadius: radius.lg,
      paddingVertical: space.sm,
      paddingHorizontal: space.md,
      marginBottom: space.sm,
      borderWidth: 1,
      borderColor: colors.successBorder,
    },
    okText: { ...font.caption, fontWeight: "600", color: colors.success },
    errorBanner: {
      backgroundColor: colors.dangerBg,
      borderColor: colors.dangerBorder,
      borderWidth: 1,
      borderRadius: radius.lg,
      paddingVertical: space.sm,
      paddingHorizontal: space.md,
      marginBottom: space.md,
    },
    errorText: { ...font.caption, color: colors.danger, lineHeight: font.caption.lineHeight },
  });
}

export function useListStyles() {
  const { colors } = useTheme();
  return useMemo(() => createListStyles(colors), [colors]);
}

export function useFormStyles() {
  const { colors, fontSize } = useTheme();
  return useMemo(() => createFormStyles(colors, fontSize), [colors, fontSize]);
}

export function useScreenUi() {
  const { colors, fontSize } = useTheme();
  return useMemo(() => createScreenUi(colors, fontSize), [colors, fontSize]);
}
