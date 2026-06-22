import { StyleSheet } from "react-native";
import { colors, font, radius, screen, space } from "@/lib/theme";

/** Gaya bersama — daftar, form, dan layar informasi. */
export const screenUi = StyleSheet.create({
  hint: {
    ...font.caption,
    color: colors.textMuted,
    marginBottom: space.sm,
    lineHeight: 18,
  },
  empty: {
    ...font.body,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: space.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: space.md,
    gap: space.sm,
  },
  cardDanger: {
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerBg,
  },
  cardTitle: { ...font.body, fontWeight: "700" },
  cardTitleDanger: { ...font.body, fontWeight: "700", color: colors.danger },
  cardText: { ...font.caption, lineHeight: 18 },
  cardTextMuted: { ...font.caption, color: colors.textMuted, lineHeight: 18 },
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
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: space.sm,
  },
  heroBody: { ...font.body, lineHeight: 22 },
  heroCaption: {
    ...font.caption,
    color: colors.textMuted,
    marginTop: space.sm,
  },
  okBanner: {
    backgroundColor: colors.successBg,
    borderRadius: radius.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    marginBottom: space.sm,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  okText: { ...font.caption, fontWeight: "600", color: colors.success },
});
