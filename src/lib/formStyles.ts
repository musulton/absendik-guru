import { StyleSheet } from "react-native";
import { colors, font, radius, screen, space } from "@/lib/theme";

export const formStyles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    padding: screen.contentPadding,
    paddingBottom: 32,
  },
  hint: { ...font.caption, marginBottom: space.md, lineHeight: 18 },
  actions: { gap: space.sm, marginTop: space.xs },
});
