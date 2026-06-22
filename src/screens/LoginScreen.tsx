import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBanner } from "@/components/ErrorBanner";
import { AbsendikMark } from "@/components/brand/AbsendikMark";
import { FormField } from "@/components/ui/FormField";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextLink } from "@/components/ui/TextLink";
import { useTheme } from "@/context/AppPreferencesContext";
import {
  signInWithEmailPassword,
  signInWithGoogle,
  isGoogleProviderDisabledError,
  isGoogleRedirectUriMismatchError,
  getGoogleRedirectUriMismatchHelp,
  isOAuthCallbackError,
  getOAuthCallbackHelp,
  isOAuthLocalhostError,
  isOAuthWebOriginError,
  isOAuthTimeoutError,
  isOAuthCancelledError,
  isGoogleOAuthNetworkError,
  isExpoGo,
  getOAuthRedirectUri,
  getOAuthSupabaseAllowListHints,
  getSupabaseGoogleOAuthCallbackUrl,
} from "@/lib/auth";
import { config } from "@/lib/config";
import { withHaptic } from "@/lib/haptics";
import type { TranslationKey } from "@/lib/i18n/translations";
import { elevation, radius, space } from "@/lib/theme";

/** Warna brand tetap di layar login — tetap hidup di light & dark theme. */
const LOGIN_BRAND = {
  hero: "#1e3a8a",
  accent: "#0f766e",
  blob: "#0d9488",
} as const;

const COMPACT_HEIGHT = 700;

type Props = {
  onLoggedIn: () => void;
};

const FEATURES: {
  labelKey: TranslationKey;
  icon: IconName;
  tone: "primary" | "accent" | "success";
}[] = [
  { labelKey: "login.featureAttendance", icon: "attendance", tone: "accent" },
  { labelKey: "login.featureGrades", icon: "grades", tone: "primary" },
  { labelKey: "login.featureRecap", icon: "recap", tone: "success" },
];

export function LoginScreen({ onLoggedIn }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const compact = windowHeight < COMPACT_HEIGHT;
  const { colors, font, scale, t } = useTheme();
  const iosSimulator = Platform.OS === "ios" && !Constants.isDevice;
  const expoGoOAuthRedirect = useMemo(() => {
    if (!__DEV__ || !isExpoGo()) return null;
    try {
      return getOAuthRedirectUri();
    } catch {
      return null;
    }
  }, []);
  const expoGoAllowList = useMemo(() => {
    if (!__DEV__ || !isExpoGo()) return null;
    try {
      return getOAuthSupabaseAllowListHints();
    } catch {
      return null;
    }
  }, []);
  const googleOAuthCallbackUrl = useMemo(() => {
    if (!__DEV__) return null;
    try {
      return getSupabaseGoogleOAuthCallbackUrl();
    } catch {
      return null;
    }
  }, []);
  const textStyles = useMemo(
    () => ({
      appName: {
        color: "#fff",
        fontSize: scale(22),
        fontWeight: "800" as const,
        letterSpacing: -0.3,
      },
      appNameCompact: { fontSize: scale(19) },
      appTagline: {
        color: "rgba(255,255,255,0.82)",
        fontSize: scale(12),
        lineHeight: scale(16),
        marginTop: 2,
      },
      heroSubtitle: {
        color: "rgba(255,255,255,0.92)",
        fontSize: scale(15),
        lineHeight: scale(22),
        fontWeight: "500" as const,
      },
      heroSubtitleCompact: { fontSize: scale(13), lineHeight: scale(19) },
      featureChipText: { fontSize: scale(11), fontWeight: "700" as const },
      welcomeTitle: {
        fontSize: scale(20),
        fontWeight: "800" as const,
        letterSpacing: -0.2,
      },
      googleBtnText: { fontSize: scale(15), fontWeight: "700" as const },
      dividerLabel: { fontWeight: "600" as const },
      emailToggleText: { fontSize: scale(14), fontWeight: "700" as const },
    }),
    [scale],
  );
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      onLoggedIn();
    } catch (e) {
      const raw = e instanceof Error ? e.message : t("common.loginFailed");
      if (isGoogleProviderDisabledError(raw)) {
        setError(t("login.googleProviderDisabled"));
      } else if (isGoogleRedirectUriMismatchError(raw)) {
        setError(
          __DEV__ && getGoogleRedirectUriMismatchHelp(raw)
            ? getGoogleRedirectUriMismatchHelp(raw)!
            : t("login.googleRedirectUriMismatch"),
        );
      } else if (isOAuthLocalhostError(raw)) {
        setError(t("login.googleLocalhostRedirect"));
      } else if (isOAuthWebOriginError(raw)) {
        setError(t("login.googleOAuthWebOrigin"));
      } else if (isOAuthCancelledError(raw)) {
        setError(t("login.googleOAuthCancelled"));
      } else if (isGoogleOAuthNetworkError(raw)) {
        setError(t("login.googleSignInFailed") + t("bootstrap.networkHint"));
      } else if (isOAuthTimeoutError(raw) || isOAuthCallbackError(raw)) {
        setError(
          __DEV__ && isOAuthCallbackError(raw) && getOAuthCallbackHelp(raw)
            ? getOAuthCallbackHelp(raw)!
            : t("login.googleSignInFailed"),
        );
      } else {
        setError(raw);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailLogin() {
    setError("");
    setLoading(true);
    try {
      await signInWithEmailPassword(email, password);
      onLoggedIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  function featureTone(tone: (typeof FEATURES)[number]["tone"]) {
    if (tone === "accent") {
      return {
        bg: "rgba(15, 118, 110, 0.22)",
        text: "#ccfbf1",
        icon: colors.accent,
      };
    }
    if (tone === "success") {
      return {
        bg: "rgba(4, 120, 87, 0.22)",
        text: "#d1fae5",
        icon: colors.success,
      };
    }
    return {
      bg: "rgba(255, 255, 255, 0.16)",
      text: "#dbeafe",
      icon: "#bfdbfe",
    };
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + space.xl,
              minHeight: windowHeight,
            },
            compact ? styles.scrollCompact : styles.scrollRegular,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={[styles.heroBand, { backgroundColor: LOGIN_BRAND.hero }]}
          >
            <View
              style={[
                styles.blob,
                styles.blobTop,
                { backgroundColor: LOGIN_BRAND.blob },
              ]}
            />
            <View
              style={[
                styles.blob,
                styles.blobBottom,
                { backgroundColor: "rgba(147, 197, 253, 0.35)" },
              ]}
            />

            <View
              style={[
                styles.heroContent,
                compact ? styles.heroContentCompact : styles.heroContentRegular,
                { paddingTop: insets.top + (compact ? space.sm : space.lg) },
              ]}
            >
              <View style={styles.brandRow}>
                <View
                  style={[styles.logoBadge, compact && styles.logoBadgeCompact]}
                >
                  <AbsendikMark size={compact ? 40 : 48} />
                </View>
                <View style={styles.brandText}>
                  <Text
                    style={[
                      textStyles.appName,
                      compact && textStyles.appNameCompact,
                    ]}
                  >
                    {t("app.name")}
                  </Text>
                  {!compact ? (
                    <Text style={textStyles.appTagline}>
                      {t("app.tagline")}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Text
                style={[
                  textStyles.heroSubtitle,
                  compact && textStyles.heroSubtitleCompact,
                ]}
                numberOfLines={compact ? 2 : 3}
              >
                {t("login.heroSubtitle")}
              </Text>

              <View style={styles.featureRow}>
                {FEATURES.map((feature) => {
                  const tone = featureTone(feature.tone);
                  return (
                    <View
                      key={feature.labelKey}
                      style={[
                        styles.featureChip,
                        compact && styles.featureChipCompact,
                        { backgroundColor: tone.bg },
                      ]}
                    >
                      <Icon name={feature.icon} size={12} color={tone.icon} />
                      <Text
                        style={[
                          textStyles.featureChipText,
                          { color: tone.text },
                        ]}
                      >
                        {t(feature.labelKey)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View
            style={[
              styles.body,
              compact ? styles.bodyCompact : styles.bodyRegular,
            ]}
          >
            <View
              style={[
                styles.loginCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                elevation(colors.cardShadow, "md"),
              ]}
            >
              <Text style={[textStyles.welcomeTitle, { color: colors.text }]}>
                {t("login.welcomeTitle")}
              </Text>
              <Text
                style={[
                  font.body,
                  styles.welcomeSub,
                  { color: colors.textMuted },
                ]}
              >
                {t("login.welcomeSub")}
              </Text>

              <Pressable
                style={[
                  styles.googleBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                  loading && !emailExpanded && styles.btnDisabled,
                ]}
                disabled={loading}
                onPress={withHaptic(() => void handleGoogle())}
              >
                {loading && !emailExpanded ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <GoogleLogo size={20} />
                    <Text
                      style={[textStyles.googleBtnText, { color: colors.text }]}
                    >
                      {t("login.google")}
                    </Text>
                  </>
                )}
              </Pressable>
              <Text
                style={[
                  font.caption,
                  styles.googleHint,
                  { color: colors.textMuted },
                ]}
              >
                {t("login.googleHint")}
              </Text>

              {expoGoOAuthRedirect ? (
                <View
                  style={[
                    styles.oauthSetupBox,
                    {
                      backgroundColor: colors.primaryMuted,
                      borderColor: colors.primaryBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      font.caption,
                      styles.oauthSetupTitle,
                      { color: colors.primary },
                    ]}
                  >
                    {t("login.googleExpoGoSetupTitle")}
                  </Text>
                  {expoGoAllowList?.map((hint) => (
                    <Text
                      key={hint}
                      selectable
                      style={[
                        font.caption,
                        styles.oauthSetupUrl,
                        { color: colors.text },
                      ]}
                    >
                      {hint}
                    </Text>
                  ))}
                  <Text
                    style={[
                      font.caption,
                      styles.oauthSetupTitle,
                      { color: colors.primary },
                    ]}
                  >
                    {t("login.googleExpoGoSessionTitle")}
                  </Text>
                  <Text
                    selectable
                    style={[
                      font.caption,
                      styles.oauthSetupUrl,
                      { color: colors.text },
                    ]}
                  >
                    {expoGoOAuthRedirect}
                  </Text>
                  <Text
                    style={[
                      font.caption,
                      styles.oauthSetupHint,
                      { color: colors.textMuted },
                    ]}
                  >
                    {iosSimulator
                      ? t("login.googleSimulatorHint")
                      : t("login.googleExpoGoSetupHint")}
                  </Text>
                </View>
              ) : null}

              {googleOAuthCallbackUrl ? (
                <View
                  style={[
                    styles.oauthSetupBox,
                    {
                      backgroundColor: colors.primaryMuted,
                      borderColor: colors.primaryBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      font.caption,
                      styles.oauthSetupTitle,
                      { color: colors.primary },
                    ]}
                  >
                    {t("login.googleCloudSetupTitle")}
                  </Text>
                  <Text
                    selectable
                    style={[
                      font.caption,
                      styles.oauthSetupUrl,
                      { color: colors.text },
                    ]}
                  >
                    {googleOAuthCallbackUrl}
                  </Text>
                  <Text
                    style={[
                      font.caption,
                      styles.oauthSetupHint,
                      { color: colors.textMuted },
                    ]}
                  >
                    {t("login.googleCloudSetupHint")}
                  </Text>
                </View>
              ) : null}

              {!config.hideEmailLogin ? (
                <>
              <View style={styles.dividerRow}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: colors.border },
                  ]}
                />
                <Text
                  style={[
                    font.caption,
                    textStyles.dividerLabel,
                    { color: colors.textMuted },
                  ]}
                >
                  {t("common.or")}
                </Text>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: colors.border },
                  ]}
                />
              </View>

              {!emailExpanded ? (
                <Pressable
                  onPress={withHaptic(() => setEmailExpanded(true))}
                  style={[
                    styles.emailToggle,
                    {
                      borderColor: colors.primaryBorder,
                      backgroundColor: colors.primaryMuted,
                    },
                  ]}
                >
                  <Icon name="mail" size={16} color={colors.primary} />
                  <Text
                    style={[
                      textStyles.emailToggleText,
                      { color: colors.primary },
                    ]}
                  >
                    {t("login.emailToggle")}
                  </Text>
                </Pressable>
              ) : (
                <View
                  style={[
                    styles.emailForm,
                    {
                      backgroundColor: colors.primaryMuted,
                      borderColor: colors.primaryBorder,
                    },
                  ]}
                >
                  <View style={styles.emailFormHeader}>
                    <View style={styles.emailFormTitleRow}>
                      <Icon name="mail" size={14} color={colors.primary} />
                      <Text style={[font.label, { color: colors.primary }]}>
                        {t("login.emailToggle")}
                      </Text>
                    </View>
                    <TextLink
                      label={t("login.emailHide")}
                      onPress={() => setEmailExpanded(false)}
                    />
                  </View>
                  <FormField
                    label={t("login.email")}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder="nama@sekolah.sch.id"
                    editable={!loading}
                  />
                  <FormField
                    label={t("login.password")}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                    placeholder="••••••••"
                    editable={!loading}
                  />
                  <PrimaryButton
                    title={t("login.emailSubmit")}
                    loading={loading}
                    onPress={() => void handleEmailLogin()}
                  />
                </View>
              )}
                </>
              ) : null}

              <ErrorBanner message={error} />
            </View>

            <View
              style={[
                styles.footerNote,
                {
                  backgroundColor: colors.primaryMuted,
                  borderColor: colors.primaryBorder,
                },
              ]}
            >
              <Icon name="info" size={14} color={colors.primary} />
              <Text
                style={[
                  font.caption,
                  styles.footerNoteText,
                  { color: colors.textMuted },
                ]}
              >
                {t("login.schoolLinkHint")}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
  scrollCompact: {
    justifyContent: "flex-start",
  },
  scrollRegular: {
    justifyContent: "space-between",
  },
  heroBand: {
    overflow: "hidden",
    position: "relative",
  },
  blob: {
    position: "absolute",
    borderRadius: radius.pill,
  },
  blobTop: {
    width: 160,
    height: 160,
    top: -40,
    right: -32,
    opacity: 0.55,
  },
  blobBottom: {
    width: 120,
    height: 120,
    bottom: -16,
    left: -32,
    opacity: 0.8,
  },
  heroContent: {
    paddingHorizontal: space.lg,
    gap: space.sm,
  },
  heroContentCompact: {
    paddingBottom: space.lg,
  },
  heroContentRegular: {
    paddingBottom: space.xxl + 20,
    gap: space.md,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadgeCompact: {
    width: 48,
    height: 48,
  },
  brandText: { flex: 1, minWidth: 0 },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  featureChipCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  body: {
    paddingHorizontal: space.lg,
  },
  bodyCompact: {
    marginTop: space.md,
    paddingTop: 0,
  },
  bodyRegular: {
    marginTop: -24,
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  loginCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: space.lg,
    gap: space.sm,
  },
  welcomeSub: {
    lineHeight: 21,
    marginBottom: space.xs,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    paddingVertical: 13,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: space.xs,
  },
  btnDisabled: { opacity: 0.65 },
  googleHint: { textAlign: "center", lineHeight: 17 },
  oauthSetupBox: {
    marginTop: space.sm,
    padding: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: space.xs,
  },
  oauthSetupTitle: { fontWeight: "700" },
  oauthSetupUrl: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 18,
  },
  oauthSetupHint: { lineHeight: 16 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginVertical: space.xs,
  },
  dividerLine: { flex: 1, height: 1 },
  emailToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  emailForm: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.md,
    gap: space.sm,
  },
  emailFormHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.xs,
  },
  emailFormTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  footerNoteText: { flex: 1, lineHeight: 18 },
});
