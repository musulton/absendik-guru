import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  AppPreferencesProvider,
  useAppPreferences,
} from "@/context/AppPreferencesContext";
import { setGlobalHapticsEnabled } from "@/lib/haptics";
import { rescheduleTeachingNotifications } from "@/lib/guru-repository";
import { refreshGuruQuotaConfigFromApi } from "@/lib/guru-limits";
import {
  initTeachingNotificationHandler,
  supportsLocalNotifications,
} from "@/lib/notifications-runtime";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useEffect } from "react";
import { LogBox } from "react-native";

function ThemedApp() {
  const { isDark, hapticsEnabled } = useAppPreferences();

  useEffect(() => {
    setGlobalHapticsEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  useEffect(() => {
    void refreshGuruQuotaConfigFromApi();
  }, []);

  useEffect(() => {
    if (!supportsLocalNotifications()) return;
    void initTeachingNotificationHandler();
    const timer = setTimeout(() => {
      // Jangan minta permission saat cold start; dialog native bisa terlihat seperti overlay gelap.
      void rescheduleTeachingNotifications({ requestPermission: false });
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  useEffect(() => {
    LogBox.ignoreLogs([
      "Failed to get NitroModules",
      "Native module RNFBAppModule",
      "AuthRetryableFetchError",
      "Network request failed",
    ]);
  }, []);

  return (
    <AppPreferencesProvider>
      <SafeAreaProvider>
        <ThemedApp />
      </SafeAreaProvider>
    </AppPreferencesProvider>
  );
}
