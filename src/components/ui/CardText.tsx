import type { ReactNode } from "react";
import { Text } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { useScreenUi } from "@/lib/use-themed-styles";

type Variant = "body" | "muted" | "accent" | "ok" | "danger";

type Props = {
  children: ReactNode;
  variant?: Variant;
};

export function CardText({ children, variant = "body" }: Props) {
  const ui = useScreenUi();
  const { colors } = useTheme();

  return (
    <Text
      style={[
        ui.cardText,
        variant === "muted" && ui.cardTextMuted,
        variant === "accent" && ui.cardAccent,
        variant === "ok" && { fontWeight: "600", color: colors.success },
        variant === "danger" && { color: colors.danger },
      ]}
    >
      {children}
    </Text>
  );
}
