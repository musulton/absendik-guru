import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenScroll } from "@/components/ScreenScroll";
import { CatatanGuruMark } from "@/components/brand/CatatanGuruMark";
import { AccentCard } from "@/components/ui/AccentCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import type { TranslationKey } from "@/lib/i18n/translations";
import { radius, space } from "@/lib/theme";

const BRAND = {
  hero: "#1e3a8a",
  accent: "#0f766e",
} as const;

const STEPS: TranslationKey[] = [
  "about.step1",
  "about.step2",
  "about.step3",
  "about.step4",
];

const STEP_ICONS: IconName[] = ["school", "classes", "attendance", "export"];

const FEATURES: { key: TranslationKey; icon: IconName }[] = [
  { key: "about.featureGrades", icon: "grades" },
  { key: "about.featurePredikat", icon: "gradeRecap" },
  { key: "about.featureSchoolLink", icon: "journal" },
  { key: "about.featureCloud", icon: "cloud" },
];

export function AboutScreen() {
  const { colors, font, scale, t } = useTheme();
  const textStyles = useMemo(
    () => ({
      heroTitle: {
        color: "#fff",
        fontSize: scale(18),
        fontWeight: "800" as const,
        letterSpacing: -0.2,
      },
      heroSubtitle: {
        color: "rgba(255,255,255,0.9)",
        fontSize: scale(13),
        lineHeight: scale(18),
        textAlign: "center" as const,
        marginTop: 4,
      },
      bodyText: { lineHeight: scale(20) },
      stepText: { flex: 1, lineHeight: scale(18) },
      hintText: { flex: 1, lineHeight: scale(18) },
    }),
    [scale],
  );

  useTranslatedScreenTitle(t("about.title"));

  return (
    <ScreenScroll contentContainerStyle={styles.scroll}>
      <View style={[styles.hero, { backgroundColor: BRAND.hero }]}>
        <View style={[styles.heroBlob, { backgroundColor: BRAND.accent }]} />
        <CatatanGuruMark size={52} style={styles.heroLogo} />
        <Text style={textStyles.heroTitle}>{t("about.title")}</Text>
        <Text style={textStyles.heroSubtitle}>{t("about.subtitle")}</Text>
      </View>

      <AccentCard accentColor={colors.primary} contentStyle={styles.cardInner}>
        <Text style={[font.label, { color: colors.primary }]}>{t("about.whatIs")}</Text>
        <Text style={[font.body, textStyles.bodyText, { color: colors.text }]}>
          {t("about.whatIsBody")}
        </Text>
      </AccentCard>

      <AccentCard accentColor={colors.accent} contentStyle={styles.cardInner}>
        <Text style={[font.label, { color: colors.accent }]}>{t("about.howToUse")}</Text>
        {STEPS.map((key, index) => (
          <View key={key} style={styles.stepRow}>
            <IconBadge
              icon={STEP_ICONS[index] ?? "check"}
              backgroundColor={colors.primaryMuted}
              color={colors.primary}
              size="sm"
            />
            <Text style={[font.caption, textStyles.stepText, { color: colors.text }]}>
              {index + 1}. {t(key)}
            </Text>
          </View>
        ))}
      </AccentCard>

      <AccentCard accentColor={colors.success} contentStyle={styles.cardInner}>
        <Text style={[font.label, { color: colors.success }]}>{t("about.featuresTitle")}</Text>
        {FEATURES.map(({ key, icon }) => (
          <View key={key} style={styles.stepRow}>
            <IconBadge
              icon={icon}
              backgroundColor={colors.successBg}
              color={colors.success}
              size="sm"
            />
            <Text style={[font.caption, textStyles.stepText, { color: colors.text }]}>
              {t(key)}
            </Text>
          </View>
        ))}
      </AccentCard>

      <AccentCard
        accentColor={colors.primary}
        tintColor={colors.primaryMuted}
        contentStyle={styles.hintInner}
      >
        <Icon name="info" size={16} color={colors.primary} />
        <Text style={[font.caption, textStyles.hintText, { color: colors.textMuted }]}>
          {t("about.plansHint")}
        </Text>
      </AccentCard>

      <AccentCard accentColor={colors.accent} tintColor="#ecfdf5" contentStyle={styles.cardInner}>
        <View style={styles.schoolRow}>
          <IconBadge
            icon="school"
            backgroundColor="#ecfdf5"
            color={colors.accent}
            size="sm"
          />
          <Text style={[font.caption, textStyles.bodyText, { color: colors.textMuted }]}>
            {t("about.schoolHint")}
          </Text>
        </View>
      </AccentCard>

      <Text style={[font.caption, styles.footer, { color: colors.textMuted }]}>
        {t("about.footer")}
      </Text>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: space.sm, gap: space.sm },
  hero: {
    borderRadius: radius.lg,
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    alignItems: "center",
    marginBottom: space.xs,
    overflow: "hidden",
    position: "relative",
  },
  heroBlob: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    top: -30,
    right: -24,
    opacity: 0.35,
  },
  heroLogo: {
    marginBottom: space.sm,
  },
  cardInner: {
    padding: space.md,
    gap: space.sm,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  hintInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
    padding: space.md,
  },
  schoolRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
  },
  footer: {
    textAlign: "center",
    marginTop: space.xs,
    marginBottom: space.sm,
  },
});
