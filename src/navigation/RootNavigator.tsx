import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { ActivityIndicator, AppState, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  createNavigationContainerRef,
  NavigationContainer,
} from "@react-navigation/native";
import { AdProvider } from "@/context/AdContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { clearFetchCache } from "@/lib/guru-repository";
import { resolveActiveWorkspace } from "@/lib/active-workspace";
import {
  clearSchoolLinkCache,
  getCachedSchoolLink,
  isSchoolWorkspaceId,
} from "@/lib/school-link";
import { bootstrapGuruSession } from "@/lib/session-bootstrap";
import { tryRestoreProSubscriptionOnBootstrap } from "@/lib/subscription-sync";
import { isLocalArchiveWorkspace } from "@/lib/workspace-kind";
import { scaleFontSize } from "@/lib/theme";
import {
  isOnboardingDone,
  normalizeStorageProfile,
  clearCloudSubscription,
} from "@/lib/storage-mode";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import type { GuruAccount, GuruWorkspace } from "@/lib/types";
import { loadAuthSession, signOut } from "@/lib/auth";
import { formatApiErrorMessage } from "@/lib/user-error";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useFormStyles } from "@/lib/use-themed-styles";
import { getStackScreenOptions } from "@/navigation/stackOptions";
import { buildNavigationTheme } from "@/navigation/navigationTheme";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useAutoCloudSync } from "@/hooks/useAutoCloudSync";
import { maybeAutoSyncToCloud } from "@/lib/auto-cloud-sync";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { HomeStackNavigator } from "@/navigation/HomeStackNavigator";
import { WorkspaceModulesProvider } from "@/context/WorkspaceModulesContext";
import { WorkspaceGradePredikatProvider } from "@/context/WorkspaceGradePredikatContext";
import { WorkspaceStudentSortProvider } from "@/context/WorkspaceStudentSortContext";
import { ActionMenuProvider } from "@/context/ActionMenuContext";
import { AccountSettingsRoute } from "@/navigation/AccountSettingsRoute";
import type { RootStackParamList } from "@/navigation/types";
import { bindTeachingNotificationNavigation } from "@/lib/teaching-notification-response";
import {
  navigateToTeachingAttendance,
  type TeachingNotificationPayload,
} from "@/navigation/teachingNotificationNav";

import { LoginScreen } from "@/screens/LoginScreen";
import { WorkspacePickerScreen } from "@/screens/WorkspacePickerScreen";
import { LocalArchivePickerScreen } from "@/screens/LocalArchivePickerScreen";
import { CreateWorkspaceScreen } from "@/screens/CreateWorkspaceScreen";
import { AboutScreen } from "@/screens/AboutScreen";

export type { RootStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function navigateToSettings() {
  if (navigationRef.isReady()) {
    navigationRef.navigate("AccountSettings");
  }
}

type AppPhase = "hydrating" | "login" | "app";

export function RootNavigator() {
  const { colors, isDark, t, locale, fontSize } = useAppPreferences();
  const formStyles = useFormStyles();
  const stackOptions = useMemo(
    () => getStackScreenOptions(colors, fontSize),
    [colors, isDark, fontSize],
  );
  const navigationTheme = useMemo(
    () => buildNavigationTheme(colors, isDark),
    [colors, isDark],
  );
  const [phase, setPhase] = useState<AppPhase>("hydrating");
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<GuruAccount | null>(null);
  const [workspace, setWorkspace] = useState<GuruWorkspace | null>(null);
  const [bootstrapError, setBootstrapError] = useState("");
  const [onboardingDone, setOnboardingDone] = useState(false);
  const hydrateGeneration = useRef(0);
  const signingOutRef = useRef(false);
  const pendingTeachingNotification = useRef<TeachingNotificationPayload | null>(
    null,
  );

  useAutoCloudSync(phase === "app" && !!session);

  const hydrateSession = useCallback(async (next: Session | null) => {
    const generation = ++hydrateGeneration.current;
    setBootstrapError("");

    if (!next) {
      clearSchoolLinkCache();
      setSession(null);
      setAccount(null);
      setWorkspace(null);
      setOnboardingDone(false);
      setPhase("login");
      return;
    }

    if (signingOutRef.current) return;

    setSession(next);
    setPhase("hydrating");

    const boot = await bootstrapGuruSession(next.access_token);
    if (generation !== hydrateGeneration.current) return;

    void tryRestoreProSubscriptionOnBootstrap();

    const me = boot.me;
    if (!me.ok) {
      setAccount(null);
      setWorkspace(null);
      const hint =
        me.error.code === "network" || me.error.code === "invalid_response"
          ? t("bootstrap.networkHint")
          : "";
      setBootstrapError(
        formatApiErrorMessage(me.error, locale, "bootstrap.profileLoadFailed") +
          hint,
      );
      setPhase("app");
      return;
    }

    setAccount(me.data.account);

    await normalizeStorageProfile();
    const done = await isOnboardingDone(next.user.id);
    if (generation !== hydrateGeneration.current) return;
    setOnboardingDone(done);

    const activeWorkspace = await resolveActiveWorkspace();
    if (generation !== hydrateGeneration.current) return;

    setWorkspace(activeWorkspace);
    setPhase("app");
    void maybeAutoSyncToCloud();
  }, [t, locale]);

  useEffect(() => {
    void loadAuthSession()
      .then(({ session }) => hydrateSession(session))
      .catch(() => {
        setPhase("login");
        setBootstrapError(t("bootstrap.sessionLoadFailed"));
      });

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (signingOutRef.current) return;
      if (event === "INITIAL_SESSION") return;
      if (event === "SIGNED_OUT" || !next) {
        void hydrateSession(null);
        return;
      }
      if (event === "TOKEN_REFRESHED") {
        setSession(next);
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        void hydrateSession(next);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [hydrateSession, t]);

  useEffect(() => {
    if (phase === "hydrating") return;

    const syncAuthRefresh = (state: string) => {
      if (state === "active") {
        void supabase.auth.startAutoRefresh();
      } else {
        void supabase.auth.stopAutoRefresh();
      }
    };

    syncAuthRefresh(AppState.currentState);
    const sub = AppState.addEventListener("change", syncAuthRefresh);
    return () => {
      sub.remove();
      void supabase.auth.stopAutoRefresh();
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "hydrating") return;
    const timer = setTimeout(() => {
      setPhase("login");
      setBootstrapError(t("bootstrap.sessionLoadFailed"));
    }, 12_000);
    return () => clearTimeout(timer);
  }, [phase, t]);

  useEffect(() => {
    if (phase !== "app" || !session?.user.id || onboardingDone) return;

    const timer = setTimeout(() => {
      if (!navigationRef.isReady()) return;
      navigationRef.reset({
        index: 0,
        routes: [{ name: "Onboarding" }],
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [phase, session?.user.id, onboardingDone]);

  async function handleSignOut() {
    signingOutRef.current = true;
    hydrateGeneration.current += 1;
    try {
      await storage.remove(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
      await clearCloudSubscription();
      clearSchoolLinkCache();
      clearFetchCache();
      await signOut();
    } catch {
      /* tetap ke layar login */
    } finally {
      setSession(null);
      setAccount(null);
      setWorkspace(null);
      setOnboardingDone(false);
      setBootstrapError("");
      setPhase("login");
      setTimeout(() => {
        signingOutRef.current = false;
      }, 300);
    }
  }

  const handleSwitchWorkspace = useCallback(() => {
    void storage.remove(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
    setWorkspace(null);
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: "WorkspacePicker", params: { manualPick: true } }],
      });
    }
  }, []);

  const handleRefreshApp = useCallback(() => {
    if (session) void hydrateSession(session);
  }, [hydrateSession, session]);

  const openTeachingNotification = useCallback(
    (payload: TeachingNotificationPayload) => {
      if (!session || phase !== "app") {
        pendingTeachingNotification.current = payload;
        return;
      }

      if (payload.workspaceId !== workspace?.id) {
        pendingTeachingNotification.current = payload;
        void storage
          .set(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, payload.workspaceId)
          .then(() => {
            if (session) void hydrateSession(session);
          });
        return;
      }

      pendingTeachingNotification.current = null;
      navigateToTeachingAttendance(navigationRef, payload);
    },
    [phase, session, workspace?.id, hydrateSession],
  );

  useEffect(() => {
    if (phase !== "app" || !session) return;

    let cleanup: (() => void) | undefined;
    void bindTeachingNotificationNavigation(openTeachingNotification).then(
      (unsubscribe) => {
        cleanup = unsubscribe;
      },
    );

    return () => cleanup?.();
  }, [phase, session, openTeachingNotification]);

  useEffect(() => {
    if (phase !== "app" || !workspace || !navigationRef.isReady()) return;

    const pending = pendingTeachingNotification.current;
    if (!pending || pending.workspaceId !== workspace.id) return;

    pendingTeachingNotification.current = null;
    navigateToTeachingAttendance(navigationRef, pending);
  }, [phase, workspace]);

  useEffect(() => {
    if (phase !== "app" || !session) return;
    const pending = pendingTeachingNotification.current;
    if (!pending) return;
    openTeachingNotification(pending);
  }, [phase, session, openTeachingNotification]);

  const handleSignOutStable = useCallback(() => {
    void handleSignOut();
  }, []);

  const workspaceContextValue = useMemo(() => {
    if (!workspace || !account || !session) return null;
    const schoolLink = getCachedSchoolLink() ?? { linked: false as const };
    return {
      workspace,
      isSchoolWorkspace: isSchoolWorkspaceId(workspace.id),
      isLocalArchiveWorkspace: isLocalArchiveWorkspace(workspace, schoolLink),
      account,
      userId: session.user.id,
      onSwitchWorkspace: handleSwitchWorkspace,
      onSignOut: handleSignOutStable,
      refreshApp: handleRefreshApp,
    };
  }, [
    workspace,
    account,
    session,
    handleSwitchWorkspace,
    handleSignOutStable,
    handleRefreshApp,
  ]);

  if (phase === "hydrating") {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.hint, { color: colors.textMuted, fontSize: scaleFontSize(14, fontSize) }]}>
          {t("common.loading")}
        </Text>
      </View>
    );
  }

  if (phase === "login") {
    return (
      <LoginScreen
        onLoggedIn={() => {
          /* SIGNED_IN memicu hydrateSession */
        }}
      />
    );
  }

  const initialRoute = !onboardingDone
    ? "Onboarding"
    : workspace
      ? "App"
      : "WorkspacePicker";

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      key={session?.user.id ?? "guest"}
    >
      <AdProvider onUpgradePress={navigateToSettings}>
        <ActionMenuProvider>
        {bootstrapError && !account ? (
          <ScrollView
            style={[formStyles.flex, { backgroundColor: colors.bg }]}
            contentContainerStyle={styles.bootstrapError}
            keyboardShouldPersistTaps="handled"
          >
            <ErrorBanner message={bootstrapError} />
            <View style={formStyles.actions}>
              <PrimaryButton
                title={t("bootstrap.retry")}
                size="compact"
                onPress={() => void hydrateSession(session)}
              />
              <PrimaryButton
                title={t("bootstrap.signOut")}
                variant="secondary"
                size="compact"
                onPress={() => void handleSignOut()}
              />
            </View>
          </ScrollView>
        ) : (
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={stackOptions}
          >
            <Stack.Screen
              name="Onboarding"
              options={({ route }) => ({
                title: route.params?.replay
                  ? t("nav.guide")
                  : t("onboarding.welcomeNav"),
                headerBackVisible: Boolean(route.params?.replay),
              })}
            >
              {({ navigation, route }) =>
                session ? (
                  <OnboardingScreen
                    userId={session.user.id}
                    onDone={() => {
                      if (route.params?.replay) {
                        navigation.goBack();
                        return;
                      }
                      setOnboardingDone(true);
                      navigation.replace(workspace ? "App" : "WorkspacePicker");
                    }}
                  />
                ) : null
              }
            </Stack.Screen>

            <Stack.Screen
              name="WorkspacePicker"
              options={{ title: t("workspace.pickSchool") }}
            >
              {({ navigation, route }) => (
                <WorkspacePickerScreen
                  manualPick={route.params?.manualPick}
                  onSelect={(w) => {
                    setWorkspace(w);
                    navigation.replace("App");
                  }}
                  onCreate={() => navigation.navigate("CreateWorkspace")}
                  onOpenArchive={() => navigation.navigate("LocalArchivePicker")}
                  onUpgrade={() => navigation.navigate("AccountSettings")}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="LocalArchivePicker"
              options={{ title: t("workspace.localArchiveScreenTitle") }}
            >
              {({ navigation }) => (
                <LocalArchivePickerScreen
                  onSelect={(w) => {
                    setWorkspace(w);
                    navigation.replace("App");
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="CreateWorkspace"
              options={{ title: t("workspace.addSchool") }}
            >
              {({ navigation }) => (
                <CreateWorkspaceScreen
                  onCreated={(w) => {
                    void storage.set(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, w.id);
                    setWorkspace(w);
                    navigation.replace("App");
                  }}
                  onCancel={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="AccountSettings"
              options={{ title: t("settings.title") }}
            >
              {({ navigation }) =>
                session && account ? (
                  <AccountSettingsRoute
                    navigation={navigation}
                    account={account}
                    userId={session.user.id}
                    onSwitchWorkspace={handleSwitchWorkspace}
                    onSignOut={() => void handleSignOut()}
                    refreshApp={() => void hydrateSession(session)}
                  />
                ) : null
              }
            </Stack.Screen>

            <Stack.Screen name="About" options={{ title: t("about.title") }}>
              {() => <AboutScreen />}
            </Stack.Screen>

            <Stack.Screen name="App" options={{ headerShown: false }}>
              {() =>
                workspaceContextValue ? (
                  <WorkspaceProvider value={workspaceContextValue}>
                    <WorkspaceModulesProvider
                      workspaceId={workspaceContextValue.workspace.id}
                    >
                      <WorkspaceStudentSortProvider
                        workspaceId={workspaceContextValue.workspace.id}
                      >
                        <WorkspaceGradePredikatProvider
                          workspaceId={workspaceContextValue.workspace.id}
                        >
                          <HomeStackNavigator />
                        </WorkspaceGradePredikatProvider>
                      </WorkspaceStudentSortProvider>
                    </WorkspaceModulesProvider>
                  </WorkspaceProvider>
                ) : null
              }
            </Stack.Screen>
          </Stack.Navigator>
        )}
        </ActionMenuProvider>
      </AdProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  hint: { marginTop: 12 },
  bootstrapError: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
});
