import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getTeachRemindersEnabled as loadTeachRemindersPref,
  setTeachRemindersEnabled as persistTeachRemindersPref,
} from "@/lib/app-notification-prefs";
import { rescheduleTeachingNotifications } from "@/lib/teaching-notifications";
import { useColorScheme as useSystemColorScheme } from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  translate,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n/translations";
import { darkTheme, lightTheme, type ThemeColors } from "@/lib/theme-palettes";
import {
  makeFont,
  scaleFontSize,
  setActiveFontSizePreference,
  type FontSizePreference,
} from "@/lib/theme";

export type { FontSizePreference };

export type ColorSchemePreference = "light" | "dark" | "system";

const PREFS_KEY = "guru_app_preferences_v1";

type StoredPrefs = {
  locale?: Locale;
  colorScheme?: ColorSchemePreference;
  fontSize?: FontSizePreference;
  hapticsEnabled?: boolean;
  teachRemindersEnabled?: boolean;
};

type AppPreferencesContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  colorScheme: ColorSchemePreference;
  setColorScheme: (scheme: ColorSchemePreference) => void;
  fontSize: FontSizePreference;
  setFontSize: (size: FontSizePreference) => void;
  isDark: boolean;
  colors: ThemeColors;
  font: ReturnType<typeof makeFont>;
  scale: (size: number) => number;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  teachRemindersEnabled: boolean;
  setTeachRemindersEnabled: (enabled: boolean) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  ready: boolean;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(
  null,
);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [ready, setReady] = useState(true);
  const [locale, setLocaleState] = useState<Locale>("id");
  const [colorScheme, setColorSchemeState] =
    useState<ColorSchemePreference>("system");
  const [fontSize, setFontSizeState] = useState<FontSizePreference>("standard");
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);
  const [teachRemindersEnabled, setTeachRemindersEnabledState] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(PREFS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredPrefs;
          if (parsed.locale) setLocaleState(parsed.locale);
          if (parsed.colorScheme) setColorSchemeState(parsed.colorScheme);
          if (parsed.fontSize) {
            setFontSizeState(parsed.fontSize);
            setActiveFontSizePreference(parsed.fontSize);
          }
          if (typeof parsed.hapticsEnabled === "boolean") {
            setHapticsEnabledState(parsed.hapticsEnabled);
          }
          if (typeof parsed.teachRemindersEnabled === "boolean") {
            setTeachRemindersEnabledState(parsed.teachRemindersEnabled);
          } else {
            setTeachRemindersEnabledState(await loadTeachRemindersPref());
          }
        } else {
          setTeachRemindersEnabledState(await loadTeachRemindersPref());
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(
    async (patch: Partial<StoredPrefs>) => {
      const next: StoredPrefs = {
        locale,
        colorScheme,
        fontSize,
        hapticsEnabled,
        teachRemindersEnabled,
        ...patch,
      };
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
    },
    [locale, colorScheme, fontSize, hapticsEnabled, teachRemindersEnabled],
  );

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      void persist({ locale: next });
    },
    [persist],
  );

  const setColorScheme = useCallback(
    (next: ColorSchemePreference) => {
      setColorSchemeState(next);
      void persist({ colorScheme: next });
    },
    [persist],
  );

  const setFontSize = useCallback(
    (next: FontSizePreference) => {
      setFontSizeState(next);
      setActiveFontSizePreference(next);
      void persist({ fontSize: next });
    },
    [persist],
  );

  const setHapticsEnabled = useCallback(
    (enabled: boolean) => {
      setHapticsEnabledState(enabled);
      void persist({ hapticsEnabled: enabled });
    },
    [persist],
  );

  const setTeachRemindersEnabled = useCallback(
    (enabled: boolean) => {
      setTeachRemindersEnabledState(enabled);
      void persist({ teachRemindersEnabled: enabled });
      void persistTeachRemindersPref(enabled).then(() =>
        rescheduleTeachingNotifications({ requestPermission: enabled }),
      );
    },
    [persist],
  );

  const isDark =
    colorScheme === "dark" ||
    (colorScheme === "system" && systemScheme === "dark");

  const colors = isDark ? darkTheme : lightTheme;
  const font = useMemo(
    () => makeFont(colors.text, colors.textMuted, fontSize),
    [colors.text, colors.textMuted, fontSize],
  );
  const scale = useCallback(
    (size: number) => scaleFontSize(size, fontSize),
    [fontSize],
  );

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      colorScheme,
      setColorScheme,
      fontSize,
      setFontSize,
      isDark,
      colors,
      font,
      scale,
      hapticsEnabled,
      setHapticsEnabled,
      teachRemindersEnabled,
      setTeachRemindersEnabled,
      t,
      ready,
    }),
    [
      locale,
      setLocale,
      colorScheme,
      setColorScheme,
      fontSize,
      setFontSize,
      isDark,
      colors,
      font,
      scale,
      hapticsEnabled,
      setHapticsEnabled,
      teachRemindersEnabled,
      setTeachRemindersEnabled,
      t,
      ready,
    ],
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences(): AppPreferencesContextValue {
  const ctx = useContext(AppPreferencesContext);
  if (!ctx) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  }
  return ctx;
}

/** Alias singkat untuk terjemahan + tema. */
export function useTheme() {
  const { colors, isDark, t, locale, fontSize, setFontSize, font, scale, hapticsEnabled } =
    useAppPreferences();
  return { colors, isDark, t, locale, fontSize, setFontSize, font, scale, hapticsEnabled };
}
