import AsyncStorage from "@react-native-async-storage/async-storage";

const LEGACY_KEY = "guru_teach_reminders_enabled_v1";
const PREFS_KEY = "guru_app_preferences_v1";

export async function getTeachRemindersEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(PREFS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { teachRemindersEnabled?: boolean };
      if (typeof parsed.teachRemindersEnabled === "boolean") {
        return parsed.teachRemindersEnabled;
      }
    } catch {
      /* ignore */
    }
  }
  const legacy = await AsyncStorage.getItem(LEGACY_KEY);
  if (legacy === null) return false;
  return legacy === "1";
}

export async function setTeachRemindersEnabled(enabled: boolean): Promise<void> {
  const raw = await AsyncStorage.getItem(PREFS_KEY);
  let parsed: Record<string, unknown> = {};
  if (raw) {
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      parsed = {};
    }
  }
  parsed.teachRemindersEnabled = enabled;
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(parsed));
  await AsyncStorage.setItem(LEGACY_KEY, enabled ? "1" : "0");
}
