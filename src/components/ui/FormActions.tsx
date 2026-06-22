import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useFormStyles } from "@/lib/use-themed-styles";

type Props = {
  children: ReactNode;
};

export function FormActions({ children }: Props) {
  const formStyles = useFormStyles();
  return <View style={formStyles.actions}>{children}</View>;
}
