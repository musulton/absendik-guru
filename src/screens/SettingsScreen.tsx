import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenScroll } from "@/components/ScreenScroll";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SegmentedChoice } from "@/components/ui/SegmentedChoice";
import { wipeAllLocalDeviceData } from "@/lib/device-data";
import {
  syncAllLocalDataToCloud,
  restoreAllCloudDataToLocal,
} from "@/lib/local-cloud-sync";
import { useAdsOptional } from "@/context/AdContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useWorkspaceModulesOptional } from "@/context/WorkspaceModulesContext";
import { PLACEHOLDER_WORKSPACE } from "@/lib/placeholder-workspace";
import { isPrivacyOptionsAvailable } from "@/lib/ads/consent";
import {
  useAppPreferences,
  useTheme,
  type ColorSchemePreference,
  type FontSizePreference,
} from "@/context/AppPreferencesContext";
import {
  formatGuruQuotaSummary,
  getGuruLimitsForMode,
} from "@/lib/guru-limits";
import {
  hasCloudSubscription,
  isCloudSubscriptionActive,
  getAutoCloudSyncEnabled,
  setAutoCloudSyncEnabled,
} from "@/lib/storage-mode";
import {
  applyProSubscriptionActive,
  devUnlockProSubscription,
  syncProSubscriptionFromServer,
} from "@/lib/subscription-sync";
import { apiTransferProDevice } from "@/lib/api";
import type { GuruProDeviceStatus } from "@/lib/types";
import { maybeAutoSyncToCloud } from "@/lib/auto-cloud-sync";
import {
  fetchAndroidProProduct,
  purchaseAndroidPro,
  restoreAndroidProPurchases,
} from "@/lib/iap/android-pro";
import { GURU_IAP_DEV_UNLOCK, isAndroidBillingReady } from "@/lib/iap/config";
import type { GuruAccount } from "@/lib/types";
import type { Locale } from "@/lib/i18n/translations";
import { elevation, radius, space } from "@/lib/theme";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { withHaptic } from "@/lib/haptics";

type Props = {
  account: GuruAccount;
  userId: string;
  onAbout: () => void;
  onReplayOnboarding: () => void;
  onSwitchSchool: () => void;
  onSubscriptionChanged: () => void;
  onSignOut: () => void;
  onLocalDataWiped: () => void;
};

type ThemeColors = ReturnType<typeof useAppPreferences>["colors"];

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function useSettingsTextStyles() {
  const { scale } = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        avatarText: { color: "#fff", fontSize: scale(14), fontWeight: "800" },
        profileName: {
          fontSize: scale(15),
          fontWeight: "700",
          lineHeight: scale(19),
        },
        profileEmail: {
          fontSize: scale(12),
          lineHeight: scale(16),
          marginTop: 1,
        },
        fieldLabel: {
          fontSize: scale(10),
          fontWeight: "700",
          letterSpacing: 0.4,
          textTransform: "uppercase",
          marginBottom: 4,
          paddingHorizontal: 2,
        },
        planBadgeText: { fontSize: scale(11), fontWeight: "800" },
        quotaLine: {
          flexShrink: 1,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: radius.pill,
          fontWeight: "700",
          fontSize: scale(10),
          textAlign: "right",
        },
        planLine: { flex: 1, fontSize: scale(11), lineHeight: scale(15) },
        cloudTileText: { fontSize: scale(12), fontWeight: "700" },
        cloudHint: { flex: 1, fontSize: scale(10), lineHeight: scale(14) },
        switchTitle: { fontWeight: "600", fontSize: scale(13), flex: 1 },
        footerTileText: {
          fontSize: scale(11),
          fontWeight: "700",
          lineHeight: scale(14),
        },
      }),
    [scale],
  );
}

function SettingsCard({
  children,
  colors,
  accent,
  danger,
}: {
  children: ReactNode;
  colors: ThemeColors;
  accent?: "primary" | "success" | "danger";
  danger?: boolean;
}) {
  const accentColor =
    accent === "success"
      ? colors.success
      : accent === "danger"
        ? colors.danger
        : accent === "primary"
          ? colors.primary
          : undefined;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: danger ? colors.dangerBg : colors.surface,
          borderColor: danger
            ? colors.danger
            : accentColor
              ? accentColor
              : colors.border,
        },
        !danger && elevation(colors.cardShadow, "sm"),
      ]}
    >
      {accentColor ? (
        <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      ) : null}
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
}

function SettingsDivider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

function SettingsNavRow({
  title,
  subtitle,
  icon,
  onPress,
  colors,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  onPress?: () => void;
  colors: ThemeColors;
}) {
  const { font } = useAppPreferences();
  const content = (
    <View style={styles.navRow}>
      {icon ? (
        <View
          style={[styles.navIcon, { backgroundColor: colors.primaryMuted }]}
        >
          <Icon name={icon} size={16} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.navText}>
        <Text style={[font.body, styles.navTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[font.caption, styles.navSub, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onPress ? (
        <Icon name="chevronRight" size={18} color={colors.textMuted} />
      ) : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={withHaptic(onPress)}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

function SettingsField({
  label,
  children,
  colors,
}: {
  label: string;
  children: ReactNode;
  colors: ThemeColors;
}) {
  const textStyles = useSettingsTextStyles();
  return (
    <View style={styles.field}>
      <Text style={[textStyles.fieldLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function InlineSwitch({
  title,
  icon,
  value,
  onValueChange,
  colors,
}: {
  title: string;
  icon: IconName;
  value: boolean;
  onValueChange: (next: boolean) => void;
  colors: ThemeColors;
}) {
  const textStyles = useSettingsTextStyles();
  return (
    <View style={styles.switchRow}>
      <View
        style={[styles.switchIcon, { backgroundColor: colors.primaryMuted }]}
      >
        <Icon name={icon} size={14} color={colors.primary} />
      </View>
      <Text style={[textStyles.switchTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primaryBorder }}
        thumbColor={value ? colors.primary : colors.textMuted}
      />
    </View>
  );
}

function PlanBullet({
  label,
  text,
  tone,
  colors,
}: {
  label: string;
  text: string;
  tone: "neutral" | "pro";
  colors: ThemeColors;
}) {
  const textStyles = useSettingsTextStyles();
  const labelColor = tone === "pro" ? colors.success : colors.text;
  const dotColor = tone === "pro" ? colors.success : colors.primary;

  return (
    <View style={styles.planBullet}>
      <View style={[styles.planDot, { backgroundColor: dotColor }]}>
        {tone === "pro" ? <Icon name="check" size={8} color="#fff" /> : null}
      </View>
      <Text style={[textStyles.planLine, { color: colors.textMuted }]}>
        <Text style={{ fontWeight: "800", color: labelColor }}>{label}</Text>
        {`: ${text}`}
      </Text>
    </View>
  );
}

function FooterAction({
  title,
  icon,
  loading,
  disabled,
  onPress,
  colors,
  variant,
}: {
  title: string;
  icon: IconName;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  colors: ThemeColors;
  variant: "default" | "danger";
}) {
  const danger = variant === "danger";
  const tint = danger ? colors.danger : colors.primary;
  const tileBg = danger ? colors.dangerBg : colors.surface;
  const tileBorder = danger ? colors.danger : colors.border;
  const iconBg = danger ? colors.dangerBg : colors.primaryMuted;
  const textStyles = useSettingsTextStyles();

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={withHaptic(onPress)}
      style={({ pressed }) => [
        styles.footerTile,
        {
          backgroundColor: tileBg,
          borderColor: tileBorder,
          opacity: disabled || loading ? 0.6 : pressed ? 0.9 : 1,
        },
        !danger && elevation(colors.cardShadow, "sm"),
      ]}
    >
      <View style={[styles.footerIconBox, { backgroundColor: iconBg }]}>
        {loading ? (
          <ActivityIndicator size="small" color={tint} />
        ) : (
          <Icon name={icon} size={16} color={tint} />
        )}
      </View>
      <Text
        style={[
          textStyles.footerTileText,
          { color: tint, textAlign: "center" },
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function CloudAction({
  title,
  icon,
  loading,
  disabled,
  onPress,
  colors,
}: {
  title: string;
  icon: IconName;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  colors: ThemeColors;
}) {
  const textStyles = useSettingsTextStyles();
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={withHaptic(onPress)}
      style={({ pressed }) => [
        styles.cloudTile,
        {
          backgroundColor: colors.primaryMuted,
          borderColor: colors.primaryBorder,
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
        },
      ]}
    >
      <View style={[styles.cloudIconBox, { backgroundColor: colors.surface }]}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Icon name={icon} size={16} color={colors.primary} />
        )}
      </View>
      <Text
        style={[textStyles.cloudTileText, { color: colors.primary }]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function SettingsScreen({
  account,
  userId,
  onAbout,
  onReplayOnboarding,
  onSwitchSchool,
  onSubscriptionChanged,
  onSignOut,
  onLocalDataWiped,
}: Props) {
  const {
    t,
    locale,
    setLocale,
    colorScheme,
    setColorScheme,
    fontSize,
    setFontSize,
    hapticsEnabled,
    setHapticsEnabled,
    teachRemindersEnabled,
    setTeachRemindersEnabled,
    colors,
    font,
  } = useAppPreferences();

  useTranslatedScreenTitle(t("settings.title"));
  const [subscribed, setSubscribed] = useState(false);
  const [proDeviceConflict, setProDeviceConflict] = useState<Extract<
    GuruProDeviceStatus,
    { ok: false }
  > | null>(null);
  const [transferringDevice, setTransferringDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restoringPurchase, setRestoringPurchase] = useState(false);
  const [proPrice, setProPrice] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [autoCloudSync, setAutoCloudSync] = useState(true);
  const [message, setMessage] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<"signOut" | "wipe" | null>(
    null,
  );
  const ads = useAdsOptional();
  const { workspace, isSchoolWorkspace, isLocalArchiveWorkspace } =
    useWorkspace();
  const modulesCtx = useWorkspaceModulesOptional();
  const [privacyOptionsAvailable, setPrivacyOptionsAvailable] = useState(false);
  const showModuleSettings =
    modulesCtx != null && workspace.id !== PLACEHOLDER_WORKSPACE.id;

  const refreshStatus = useCallback(async () => {
    const synced = await syncProSubscriptionFromServer();
    const sub = synced.active || (await isCloudSubscriptionActive());
    setSubscribed(sub);
    setProDeviceConflict(
      synced.proDevice && !synced.proDevice.ok ? synced.proDevice : null,
    );
    setAutoCloudSync(await getAutoCloudSyncEnabled());
    await ads?.refreshAdsState();
    setPrivacyOptionsAvailable(await isPrivacyOptionsAvailable());
    if (Platform.OS === "android" && isAndroidBillingReady()) {
      const product = await fetchAndroidProProduct();
      setProPrice(product?.price || null);
    } else {
      setProPrice(null);
    }
  }, [ads]);

  useFocusEffect(
    useCallback(() => {
      void refreshStatus();
    }, [refreshStatus]),
  );

  const toggleModule = useCallback(
    async (
      key: "attendance" | "grades" | "teachingJournal" | "studentNotes",
      next: boolean,
    ) => {
      if (!modulesCtx) return;
      const { modules, updateModules } = modulesCtx;
      const enabledCount = [
        modules.attendance,
        modules.grades,
        modules.teachingJournal,
        modules.studentNotes,
      ].filter(Boolean).length;
      if (!next && enabledCount <= 1 && modules[key]) {
        Alert.alert(t("settings.modulesMinOne"));
        return;
      }
      const updated = { ...modules, [key]: next };
      await updateModules(updated);
    },
    [modulesCtx, t],
  );

  async function handleSubscribe() {
    if (subscribed) return;

    if (GURU_IAP_DEV_UNLOCK) {
      Alert.alert(
        t("settings.subscribeAlertTitle"),
        t("settings.subscribeAlertBody"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("settings.upgradePro"),
            onPress: () => void confirmDevUnlock(),
          },
        ],
      );
      return;
    }

    if (Platform.OS === "ios") {
      Alert.alert(t("settings.upgradePro"), t("settings.iapIosSoon"));
      return;
    }

    if (Platform.OS !== "android" || !isAndroidBillingReady()) {
      Alert.alert(t("settings.upgradePro"), t("settings.iapUnavailable"));
      return;
    }

    const priceLine = proPrice
      ? t("settings.proPrice", { price: proPrice })
      : "";
    const body = proPrice
      ? t("settings.subscribeAlertBodyAndroid", { price: priceLine })
      : t("settings.subscribeAlertBody");

    Alert.alert(t("settings.subscribeAlertTitle"), body, [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.upgradePro"),
        onPress: () => void confirmSubscribe(),
      },
    ]);
  }

  async function confirmDevUnlock() {
    setLoading(true);
    setMessage("");
    try {
      await devUnlockProSubscription();
      setSubscribed(true);
      onSubscriptionChanged();
      void ads?.refreshAdsState();
      setMessage(t("settings.proActive"));
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : t("settings.proActivateFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmSubscribe() {
    setLoading(true);
    setMessage("");
    try {
      const result = await purchaseAndroidPro();
      if (!result.ok) {
        if (result.code !== "cancelled") {
          setMessage(result.message);
        }
        return;
      }
      await applyProSubscriptionActive(true);
      setSubscribed(true);
      onSubscriptionChanged();
      void ads?.refreshAdsState();
      setMessage(t("settings.proActive"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRestorePurchase() {
    setRestoringPurchase(true);
    setMessage("");
    try {
      const synced = await syncProSubscriptionFromServer();
      if (synced.active) {
        setSubscribed(true);
        setProDeviceConflict(
          synced.proDevice && !synced.proDevice.ok ? synced.proDevice : null,
        );
        onSubscriptionChanged();
        void ads?.refreshAdsState();
        setMessage(t("settings.proActive"));
        return;
      }

      if (Platform.OS === "android" && isAndroidBillingReady()) {
        const result = await restoreAndroidProPurchases();
        if (result.ok) {
          await applyProSubscriptionActive(true);
          setSubscribed(true);
          onSubscriptionChanged();
          void ads?.refreshAdsState();
          setMessage(t("settings.proActive"));
          return;
        }
        setMessage(result.message);
        return;
      }

      setMessage(t("settings.restoreNotFound"));
    } finally {
      setRestoringPurchase(false);
    }
  }

  async function handleTransferDevice() {
    Alert.alert(
      t("settings.transferDevice"),
      t("settings.transferDeviceConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.transferDevice"),
          onPress: () => void runTransferDevice(),
        },
      ],
    );
  }

  async function runTransferDevice() {
    setTransferringDevice(true);
    setMessage("");
    try {
      const result = await apiTransferProDevice();
      if (!result.ok) {
        setMessage(result.error.message);
        return;
      }
      await applyProSubscriptionActive(true);
      setSubscribed(true);
      setProDeviceConflict(null);
      onSubscriptionChanged();
      void ads?.refreshAdsState();
      setMessage(t("settings.transferDeviceSuccess"));
    } finally {
      setTransferringDevice(false);
    }
  }

  async function handleSyncToCloud() {
    if (!(await hasCloudSubscription())) {
      Alert.alert(t("settings.upgradePro"), t("settings.cloudHint"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.upgradePro"),
          onPress: () => void handleSubscribe(),
        },
      ]);
      return;
    }
    Alert.alert(t("settings.sync"), t("settings.syncDesc"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("settings.sync"), onPress: () => void runSyncToCloud() },
    ]);
  }

  async function handleRestoreFromCloud() {
    if (!(await hasCloudSubscription())) {
      Alert.alert(t("settings.upgradePro"), t("settings.cloudHint"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.upgradePro"),
          onPress: () => void handleSubscribe(),
        },
      ]);
      return;
    }
    Alert.alert(t("settings.restore"), t("settings.restoreDesc"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.restore"),
        style: "destructive",
        onPress: () => void runRestoreFromCloud(),
      },
    ]);
  }

  async function runRestoreFromCloud() {
    setRestoring(true);
    setMessage("");
    const result = await restoreAllCloudDataToLocal();
    setRestoring(false);
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    onLocalDataWiped();
    setMessage(t("settings.restore"));
  }

  async function runSyncToCloud() {
    setSyncing(true);
    setMessage("");
    const result = await syncAllLocalDataToCloud();
    setSyncing(false);
    if (!result.ok) {
      setMessage(result.error.message);
      return;
    }
    setMessage(t("settings.sync"));
    void maybeAutoSyncToCloud({ force: true });
    void ads?.requestInterstitial("sync_complete");
  }

  async function handleAutoCloudSyncToggle(next: boolean) {
    setAutoCloudSync(next);
    await setAutoCloudSyncEnabled(next);
    if (next && subscribed) {
      void maybeAutoSyncToCloud({ force: true });
    }
  }

  function confirmWipeLocalData() {
    setConfirmDialog("wipe");
  }

  async function runWipeLocalData() {
    setLoading(true);
    setMessage("");
    try {
      await wipeAllLocalDeviceData(userId);
      onLocalDataWiped();
    } catch {
      setMessage("Error");
    } finally {
      setLoading(false);
    }
  }

  function confirmSignOut() {
    setConfirmDialog("signOut");
  }

  async function handleAdPrivacy() {
    const ok = await ads?.showPrivacyOptions();
    if (!ok) {
      setMessage(t("settings.adPrivacySub"));
      return;
    }
    await ads?.refreshAdsState();
    setPrivacyOptionsAvailable(await isPrivacyOptionsAvailable());
  }

  const limits = getGuruLimitsForMode(subscribed ? "cloud" : "local");
  const textStyles = useSettingsTextStyles();

  return (
    <ScreenScroll contentContainerStyle={styles.scroll}>
      <SettingsCard colors={colors}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={textStyles.avatarText}>
              {initialsFromName(account.fullName)}
            </Text>
          </View>
          <View style={styles.profileText}>
            <Text
              style={[textStyles.profileName, { color: colors.text }]}
              numberOfLines={1}
            >
              {account.fullName}
            </Text>
            <Text
              style={[textStyles.profileEmail, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {account.email ?? "—"}
            </Text>
          </View>
        </View>
        <SettingsDivider color={colors.border} />
        <SettingsNavRow
          title={t("nav.switchSchool")}
          subtitle={
            isSchoolWorkspace
              ? `${t("workspace.badgeSchool")} · ${subscribed ? t("settings.switchSchoolProSub") : t("nav.switchSchoolSub")}`
              : isLocalArchiveWorkspace
                ? `${t("workspace.badgeLocalArchive")} · ${subscribed ? t("settings.switchSchoolProSub") : t("nav.switchSchoolSub")}`
                : `${t("workspace.badgeLocal")} · ${subscribed ? t("settings.switchSchoolProSub") : t("nav.switchSchoolSub")}`
          }
          icon="school"
          onPress={onSwitchSchool}
          colors={colors}
        />
      </SettingsCard>

      {showModuleSettings ? (
        <CollapsibleSection
          title={t("settings.modulesSection")}
          dense
          defaultExpanded={false}
        >
          <SettingsCard colors={colors}>
            <InlineSwitch
              title={t("settings.moduleAttendance")}
              icon="attendance"
              value={modulesCtx.modules.attendance}
              onValueChange={(next) => void toggleModule("attendance", next)}
              colors={colors}
            />
            <SettingsDivider color={colors.border} />
            <InlineSwitch
              title={t("settings.moduleGrades")}
              icon="grades"
              value={modulesCtx.modules.grades}
              onValueChange={(next) => void toggleModule("grades", next)}
              colors={colors}
            />
            <SettingsDivider color={colors.border} />
            <InlineSwitch
              title={t("settings.moduleTeachingJournal")}
              icon="journal"
              value={modulesCtx.modules.teachingJournal}
              onValueChange={(next) =>
                void toggleModule("teachingJournal", next)
              }
              colors={colors}
            />
            <SettingsDivider color={colors.border} />
            <InlineSwitch
              title={t("settings.moduleStudentNotes")}
              icon="studentNote"
              value={modulesCtx.modules.studentNotes}
              onValueChange={(next) => void toggleModule("studentNotes", next)}
              colors={colors}
            />
            <Text
              style={[
                font.caption,
                { color: colors.textMuted, lineHeight: 16 },
              ]}
            >
              {t("settings.modulesHint")}
            </Text>
          </SettingsCard>
        </CollapsibleSection>
      ) : null}

      <SectionLabel title={t("settings.package")} dense />
      <SettingsCard colors={colors} accent={subscribed ? "success" : "primary"}>
        <View style={styles.planTop}>
          <View
            style={[
              styles.planBadge,
              {
                backgroundColor: subscribed
                  ? colors.successBg
                  : colors.primaryMuted,
              },
            ]}
          >
            <Icon
              name={subscribed ? "check" : "school"}
              size={12}
              color={subscribed ? colors.success : colors.primary}
            />
            <Text
              style={[
                textStyles.planBadgeText,
                { color: subscribed ? colors.success : colors.primary },
              ]}
            >
              {subscribed
                ? t("settings.proActive")
                : t("settings.freePlanBadge")}
            </Text>
          </View>
          <Text
            style={[
              textStyles.quotaLine,
              { color: colors.primary, backgroundColor: colors.primaryMuted },
            ]}
          >
            {formatGuruQuotaSummary(limits, t)}
          </Text>
        </View>

        {subscribed ? (
          <Text style={[textStyles.planLine, { color: colors.text }]}>
            {t("settings.proDesc")}
          </Text>
        ) : (
          <>
            <PlanBullet
              label={t("settings.freePlanBadge")}
              text={t("settings.freeDesc")}
              tone="neutral"
              colors={colors}
            />
            <PlanBullet
              label="Pro"
              text={t("settings.proDesc")}
              tone="pro"
              colors={colors}
            />
            {proPrice ? (
              <Text
                style={[
                  font.caption,
                  { color: colors.textMuted, marginBottom: space.sm },
                ]}
              >
                {t("settings.proPrice", { price: proPrice })}
              </Text>
            ) : null}
            <Text
              style={[
                font.caption,
                { color: colors.textMuted, marginBottom: space.sm },
              ]}
            >
              {GURU_IAP_DEV_UNLOCK
                ? t("settings.proDevUnlockHint")
                : Platform.OS === "ios"
                  ? t("settings.iapIosSoon")
                  : t("settings.proUpgradeHint")}
            </Text>
            <Text
              style={[
                font.caption,
                { color: colors.textMuted, marginBottom: space.sm },
              ]}
            >
              {t("settings.restorePurchaseHint")}
            </Text>
            <PrimaryButton
              title={t("settings.upgradePro")}
              size="compact"
              loading={loading}
              onPress={() => void handleSubscribe()}
            />
          </>
        )}
        <View style={styles.restorePurchaseBtn}>
          <PrimaryButton
            title={t("settings.restorePurchase")}
            variant="secondary"
            size="compact"
            loading={restoringPurchase}
            onPress={() => void handleRestorePurchase()}
          />
        </View>
      </SettingsCard>

      <SectionLabel title={t("settings.cloud")} dense />
      <SettingsCard colors={colors}>
        {proDeviceConflict ? (
          <View
            style={[
              styles.cloudHintRow,
              {
                backgroundColor: colors.primaryMuted,
                borderColor: colors.border,
                marginBottom: space.sm,
              },
            ]}
          >
            <Icon name="smartphone" size={13} color={colors.textMuted} />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  font.caption,
                  { color: colors.text, fontWeight: "700" },
                ]}
              >
                {t("settings.proDeviceConflict")}
              </Text>
              <Text
                style={[
                  font.caption,
                  textStyles.cloudHint,
                  { color: colors.textMuted },
                ]}
              >
                {t("settings.proDeviceConflictBody", {
                  device:
                    proDeviceConflict.registeredDeviceLabel ??
                    t("settings.proDeviceUnknown"),
                })}
              </Text>
              <PrimaryButton
                title={t("settings.transferDevice")}
                size="compact"
                loading={transferringDevice}
                onPress={() => void handleTransferDevice()}
                style={{ marginTop: space.sm }}
              />
            </View>
          </View>
        ) : null}
        <View style={styles.cloudRow}>
          <CloudAction
            title={t("settings.sync")}
            icon="upload"
            loading={syncing}
            disabled={!subscribed}
            onPress={() => void handleSyncToCloud()}
            colors={colors}
          />
          <CloudAction
            title={t("settings.restore")}
            icon="download"
            loading={restoring}
            disabled={!subscribed}
            onPress={() => void handleRestoreFromCloud()}
            colors={colors}
          />
        </View>
        {!subscribed ? (
          <View
            style={[
              styles.cloudHintRow,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            <Icon name="cloud" size={13} color={colors.textMuted} />
            <Text
              style={[
                font.caption,
                textStyles.cloudHint,
                { color: colors.textMuted },
              ]}
            >
              {t("settings.cloudHint")}
            </Text>
          </View>
        ) : (
          <>
            <SettingsDivider color={colors.border} />
            <InlineSwitch
              title={t("settings.autoCloudSync")}
              icon="cloud"
              value={autoCloudSync}
              onValueChange={(next) => void handleAutoCloudSyncToggle(next)}
              colors={colors}
            />
            <Text
              style={[
                font.caption,
                { color: colors.textMuted, lineHeight: 16 },
              ]}
            >
              {t("settings.autoCloudSyncHint")}
            </Text>
          </>
        )}
      </SettingsCard>

      <SectionLabel title={t("settings.appearance")} dense />
      <SettingsCard colors={colors}>
        <SettingsField label={t("settings.language")} colors={colors}>
          <SegmentedChoice
            compact
            options={[
              { key: "id", label: t("settings.languageId") },
              { key: "en", label: t("settings.languageEn") },
            ]}
            value={locale}
            onChange={(key) => setLocale(key as Locale)}
          />
        </SettingsField>
        <SettingsField label={t("settings.darkMode")} colors={colors}>
          <SegmentedChoice
            compact
            options={[
              { key: "light", label: t("settings.darkModeLight") },
              { key: "dark", label: t("settings.darkModeDark") },
              { key: "system", label: t("settings.darkModeAuto") },
            ]}
            value={colorScheme}
            onChange={(key) => setColorScheme(key as ColorSchemePreference)}
          />
        </SettingsField>
        <SettingsField label={t("settings.fontSize")} colors={colors}>
          <SegmentedChoice
            compact
            options={[
              { key: "standard", label: t("settings.fontSizeStandard") },
              { key: "large", label: t("settings.fontSizeLarge") },
            ]}
            value={fontSize}
            onChange={(key) => setFontSize(key as FontSizePreference)}
          />
          <Text
            style={[
              font.caption,
              { color: colors.textMuted, marginTop: space.xs },
            ]}
          >
            {t("settings.fontSizeHint")}
          </Text>
        </SettingsField>
        <SettingsDivider color={colors.border} />
        <InlineSwitch
          title={t("settings.haptics")}
          icon="smartphone"
          value={hapticsEnabled}
          onValueChange={setHapticsEnabled}
          colors={colors}
        />
        <InlineSwitch
          title={t("settings.teachReminders")}
          icon="bell"
          value={teachRemindersEnabled}
          onValueChange={setTeachRemindersEnabled}
          colors={colors}
        />
      </SettingsCard>

      <SectionLabel title={t("settings.helpSection")} dense />
      <SettingsCard colors={colors}>
        <SettingsNavRow
          title={t("nav.guide")}
          subtitle={t("nav.guideSub")}
          icon="info"
          onPress={onReplayOnboarding}
          colors={colors}
        />
        <SettingsDivider color={colors.border} />
        <SettingsNavRow
          title={t("settings.about")}
          subtitle={t("settings.aboutSub")}
          icon="school"
          onPress={onAbout}
          colors={colors}
        />
        {!subscribed && privacyOptionsAvailable ? (
          <>
            <SettingsDivider color={colors.border} />
            <SettingsNavRow
              title={t("settings.adPrivacy")}
              subtitle={t("settings.adPrivacySub")}
              icon="smartphone"
              onPress={() => void handleAdPrivacy()}
              colors={colors}
            />
          </>
        ) : null}
      </SettingsCard>

      <ErrorBanner message={message} />

      <View style={styles.footerActions}>
        <FooterAction
          title={t("settings.signOut")}
          icon="logout"
          onPress={confirmSignOut}
          colors={colors}
          variant="default"
        />
        <FooterAction
          title={t("settings.wipe")}
          icon="trash"
          loading={loading}
          onPress={confirmWipeLocalData}
          colors={colors}
          variant="danger"
        />
      </View>

      <ConfirmDialog
        visible={confirmDialog === "wipe"}
        title={t("settings.wipe")}
        body={t("settings.wipeHint")}
        confirmLabel={t("settings.wipe")}
        destructive
        loading={loading}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => {
          setConfirmDialog(null);
          void runWipeLocalData();
        }}
      />
      <ConfirmDialog
        visible={confirmDialog === "signOut"}
        title={t("settings.signOutConfirm")}
        confirmLabel={t("settings.signOut")}
        destructive
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => {
          setConfirmDialog(null);
          onSignOut();
        }}
      />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: space.sm, gap: space.xs },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: space.sm,
  },
  cardAccent: {
    height: 3,
    width: "100%",
  },
  cardInner: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingBottom: space.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  profileText: { flex: 1, minWidth: 0 },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: 8,
  },
  navIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  navText: { flex: 1, minWidth: 0 },
  navTitle: { fontWeight: "700" },
  navSub: { marginTop: 1 },
  pressed: { opacity: 0.88 },
  field: { marginBottom: space.xs },
  planTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    marginBottom: 6,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  planBullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
    marginBottom: 5,
  },
  planDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  cloudRow: {
    flexDirection: "row",
    gap: space.sm,
    marginBottom: space.xs,
  },
  cloudTile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 64,
  },
  cloudIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cloudHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  switchIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  footerActions: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.xs,
    marginBottom: space.lg,
  },
  footerTile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: space.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 72,
  },
  footerIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  restorePurchaseBtn: {
    marginTop: space.sm,
  },
});
