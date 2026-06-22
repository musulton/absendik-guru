import { Alert } from "react-native";
import type { TranslationKey } from "@/lib/i18n/translations";

/** Menu utama (⋯) — tanpa duplikat tombol + di header. */
export function showAppMenu(
  t: (key: TranslationKey) => string,
  opts: {
    onSettings: () => void;
    onSwitchWorkspace: () => void;
    onSignOut: () => void;
  },
) {
  Alert.alert(t("common.menu"), undefined, [
    { text: t("menu.settings"), onPress: opts.onSettings },
    { text: t("menu.switchSchool"), onPress: opts.onSwitchWorkspace },
    { text: t("menu.signOut"), style: "destructive", onPress: opts.onSignOut },
    { text: t("common.cancel"), style: "cancel" },
  ]);
}
