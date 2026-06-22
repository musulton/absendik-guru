import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/context/AppPreferencesContext";

/** Sinkronkan judul header native stack saat locale/tema berubah. */
export function useTranslatedScreenTitle(title: string) {
  const navigation = useNavigation();
  const { locale, isDark } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title, locale, isDark]);
}
