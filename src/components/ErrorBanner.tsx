import { Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { sanitizeUserMessage } from "@/lib/user-error";
import { useScreenUi } from "@/lib/use-themed-styles";
import { space } from "@/lib/theme";

export function ErrorBanner({ message }: { message: string }) {
  const ui = useScreenUi();
  const { colors, locale } = useTheme();
  if (!message) return null;
  const display = sanitizeUserMessage(message, locale);
  return (
    <View style={[ui.errorBanner, styles.row]}>
      <View style={[styles.icon, { backgroundColor: colors.surface, borderColor: colors.dangerBorder }]}>
        <Icon name="alert" size={14} color={colors.danger} />
      </View>
      <Text style={[ui.errorText, styles.text]}>{display}</Text>
    </View>
  );
}

const styles = {
  row: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: space.sm,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexShrink: 0,
    marginTop: 1,
  },
  text: { flex: 1 },
};
