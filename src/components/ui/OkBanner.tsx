import { Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { useScreenUi } from "@/lib/use-themed-styles";
import { space } from "@/lib/theme";

type Props = {
  message: string;
};

export function OkBanner({ message }: Props) {
  const ui = useScreenUi();
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View style={[ui.okBanner, styles.row]}>
      <View style={[styles.icon, { backgroundColor: colors.surface, borderColor: colors.successBorder }]}>
        <Icon name="check" size={14} color={colors.success} />
      </View>
      <Text style={[ui.okText, styles.text]}>{message}</Text>
    </View>
  );
}

const styles = {
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
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
  },
  text: { flex: 1 },
};
