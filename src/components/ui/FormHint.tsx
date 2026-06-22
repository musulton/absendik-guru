import type { ReactNode } from "react";
import { Text } from "react-native";
import { useFormStyles } from "@/lib/use-themed-styles";

type Props = {
  children: ReactNode;
};

export function FormHint({ children }: Props) {
  const formStyles = useFormStyles();
  return <Text style={formStyles.hint}>{children}</Text>;
}
