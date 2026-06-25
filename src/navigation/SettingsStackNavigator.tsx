import { useMemo } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppPreferences } from "@/context/AppPreferencesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { getStackScreenOptions } from "@/navigation/stackOptions";
import { stackScreenOptionsWithBack } from "@/navigation/headerOptions";
import type { SettingsStackParamList } from "@/navigation/types";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { AboutScreen } from "@/screens/AboutScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStackNavigator() {
  const { colors, t, isDark, fontSize } = useAppPreferences();
  const { account, userId, onSwitchWorkspace, onSignOut, refreshApp } =
    useWorkspace();
  const stackOptions = useMemo(
    () => getStackScreenOptions(colors, fontSize),
    [colors, isDark, fontSize],
  );

  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) =>
        stackScreenOptionsWithBack(
          stackOptions,
          navigation,
          t,
          route.name,
          "Settings",
        )
      }
    >
      <Stack.Screen name="Settings" options={{ title: t("settings.title") }}>
        {({ navigation }) => (
          <SettingsScreen
            account={account}
            userId={userId}
            onAbout={() => navigation.navigate("About")}
            onReplayOnboarding={() => navigation.navigate("OnboardingReplay")}
            onSwitchSchool={onSwitchWorkspace}
            onSubscriptionChanged={refreshApp}
            onSignOut={onSignOut}
            onLocalDataWiped={onSwitchWorkspace}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="About" options={{ title: t("about.title") }}>
        {() => <AboutScreen />}
      </Stack.Screen>

      <Stack.Screen
        name="OnboardingReplay"
        options={{ title: t("nav.guide") }}
      >
        {({ navigation }) => (
          <OnboardingScreen
            userId={userId}
            replay
            onDone={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
