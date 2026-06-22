import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { useScreenUi } from "@/lib/use-themed-styles";
import { space } from "@/lib/theme";

type Props = {
  title?: string;
  children: ReactNode;
  danger?: boolean;
};

export function SurfaceCard({ title, children, danger }: Props) {
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
        {title ? (
          <Text style={danger ? ui.cardTitleDanger : ui.cardTitle}>{title}</Text>
        ) : null}
        {children}
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
    padding: space.md,
    gap: space.sm,
  },
};
