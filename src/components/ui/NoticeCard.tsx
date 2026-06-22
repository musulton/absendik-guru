import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { useScreenUi } from "@/lib/use-themed-styles";
import { space } from "@/lib/theme";

type Props = {
  message: string;
  danger?: boolean;
  action?: ReactNode;
};

export function NoticeCard({ message, danger, action }: Props) {
  const ui = useScreenUi();
  const { colors } = useTheme();
  const accent = danger ? colors.danger : colors.primary;

  return (
    <View
      style={[
        ui.card,
        styles.wrap,
        danger && ui.cardDanger,
        { paddingHorizontal: 0, paddingVertical: 0 },
      ]}
    >
      <View style={[styles.strip, { backgroundColor: accent }]} />
      <View style={styles.body}>
        <View style={[styles.icon, { backgroundColor: danger ? colors.dangerBg : colors.primaryMuted }]}>
          <Icon name={danger ? "alert" : "info"} size={14} color={accent} />
        </View>
        <View style={styles.textBlock}>
          <Text style={[ui.cardText, danger && { color: colors.danger }]}>
            {message}
          </Text>
          {action}
        </View>
      </View>
    </View>
  );
}

const styles = {
  wrap: {
    flexDirection: "row" as const,
    overflow: "hidden" as const,
  },
  strip: {
    width: 4,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: space.sm,
    padding: space.md,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexShrink: 0,
  },
  textBlock: { flex: 1, gap: space.sm },
};
