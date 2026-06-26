import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CatatanGuruMark } from "@/components/brand/CatatanGuruMark";
import { IconBadge } from "@/components/ui/IconBadge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { TextLink } from "@/components/ui/TextLink";
import { useAdsOptional } from "@/context/AdContext";
import { useTheme } from "@/context/AppPreferencesContext";
import { OnboardingModulePicker } from "@/components/onboarding/OnboardingModulePicker";
import { ONBOARDING_STEP_DEFS } from "@/lib/onboarding-steps";
import {
  DEFAULT_WORKSPACE_MODULES,
  setOnboardingModulePrefs,
} from "@/lib/onboarding-modules";
import { formatGuruQuotaSummary, getGuruLocalLimitsFromEnv } from "@/lib/guru-limits";
import {
  normalizeStorageProfile,
  setOnboardingDone,
  setStorageMode,
} from "@/lib/storage-mode";
import { radius, space } from "@/lib/theme";
import type { WorkspaceModules } from "@/lib/workspace-modules-shared";

type Props = {
  userId: string;
  onDone: () => void;
  /** Ulangi panduan dari Pengaturan — jangan ubah mode penyimpanan. */
  replay?: boolean;
};

const STEP_ICONS: Record<string, IconName> = {
  welcome: "school",
  storage: "smartphone",
  school: "school",
  class: "classes",
  attendance: "attendance",
  grades: "grades",
  modules: "recap",
  session: "journal",
  attendance: "attendance",
  more: "recap",
  start: "check",
};

export function OnboardingScreen({ userId, onDone, replay = false }: Props) {
  const insets = useSafeAreaInsets();
  const ads = useAdsOptional();
  const { colors, font, scale, t } = useTheme();
  const titleStyle = useMemo(
    () => ({
      fontSize: scale(24),
      fontWeight: "800" as const,
      lineHeight: scale(30),
      letterSpacing: -0.3,
      marginBottom: space.md,
    }),
    [scale],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<WorkspaceModules>(
    DEFAULT_WORKSPACE_MODULES,
  );

  const stepDefs = useMemo(
    () =>
      replay
        ? ONBOARDING_STEP_DEFS.filter((def) => !def.skipOnReplay)
        : ONBOARDING_STEP_DEFS,
    [replay],
  );

  const steps = useMemo(
    () =>
      stepDefs.map((def) => ({
        id: def.id,
        title: t(def.titleKey),
        body: t(def.bodyKey),
        bullets: def.bulletKeys?.map((key) => t(key)),
        showQuota: def.showQuota,
        interactive: def.interactive,
      })),
    [stepDefs, t],
  );

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const stepIcon = STEP_ICONS[step.id] ?? "info";

  async function finish() {
    setLoading(true);
    try {
      if (!replay) {
        await normalizeStorageProfile();
        await setStorageMode("local");
        await setOnboardingModulePrefs(userId, modules);
        await setOnboardingDone(userId);
        void ads?.refreshAdsState();
      }
      onDone();
    } finally {
      setLoading(false);
    }
  }

  function goNext() {
    if (isLast) {
      void finish();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.bg,
          paddingTop: insets.top + space.md,
          paddingBottom: insets.bottom + space.md,
        },
      ]}
    >
      <ScrollView
        style={styles.slideScroll}
        contentContainerStyle={styles.slideContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.stepMeta}>
          {step.id === "welcome" ? (
            <CatatanGuruMark size={56} style={styles.iconBadge} />
          ) : (
            <IconBadge
              icon={stepIcon}
              backgroundColor={colors.primaryMuted}
              color={colors.primary}
            />
          )}
          <Text
            style={[
              font.caption,
              styles.stepCount,
              { color: colors.primary, backgroundColor: colors.surface },
            ]}
          >
            {stepIndex + 1} / {steps.length}
          </Text>
        </View>

        <Text style={[titleStyle, { color: colors.text }]}>{step.title}</Text>
        <Text style={[font.body, styles.body, { color: colors.text }]}>{step.body}</Text>

        {step.showQuota ? (
          <View style={styles.quotaLine}>
            <Icon name="info" size={14} color={colors.primary} />
            <Text style={[font.caption, styles.quota, { color: colors.primary }]}>
              {formatGuruQuotaSummary(getGuruLocalLimitsFromEnv(), t)}
            </Text>
          </View>
        ) : null}

        {step.bullets?.map((line) => (
          <View key={line} style={styles.bulletRow}>
            <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
            <Text style={[font.body, styles.bulletText, { color: colors.text }]}>{line}</Text>
          </View>
        ))}

        {step.interactive === "modules" ? (
          <OnboardingModulePicker modules={modules} onChange={setModules} />
        ) : null}
      </ScrollView>

      <View style={styles.dots}>
        {steps.map((s, i) => (
          <Pressable
            key={s.id}
            onPress={() => setStepIndex(i)}
            style={[
              styles.dot,
              { backgroundColor: colors.border },
              i === stepIndex && [styles.dotActive, { backgroundColor: colors.primary }],
            ]}
            accessibilityLabel={t("onboarding.stepA11y", { step: i + 1 })}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <View style={styles.actionSide}>
          {stepIndex > 0 ? (
            <TextLink label={t("common.back")} onPress={goBack} />
          ) : !isLast ? (
            <TextLink label={t("onboarding.skip")} onPress={() => void finish()} />
          ) : (
            <View />
          )}
        </View>
        <PrimaryButton
          title={isLast ? t("onboarding.start") : t("onboarding.next")}
          size="compact"
          loading={loading}
          onPress={goNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: space.lg,
    justifyContent: "space-between",
  },
  slideScroll: { flexGrow: 1 },
  slideContent: {
    flexGrow: 1,
    justifyContent: "center",
    marginTop: space.sm,
    padding: space.lg,
    paddingBottom: space.md,
  },
  stepMeta: { marginBottom: space.lg, gap: space.md },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCount: {
    fontWeight: "700",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  body: { lineHeight: 22, marginBottom: space.md },
  quotaLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
    marginBottom: space.md,
  },
  quota: { flex: 1, fontWeight: "600" },
  bulletRow: {
    flexDirection: "row",
    gap: space.sm,
    marginBottom: space.sm,
    paddingRight: space.xs,
    alignItems: "flex-start",
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    marginTop: 8,
  },
  bulletText: { flex: 1, lineHeight: 22 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginVertical: space.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  dotActive: {
    width: 20,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
  },
  actionSide: { minWidth: 72 },
});
