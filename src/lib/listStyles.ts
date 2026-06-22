import { StyleSheet } from "react-native";
import { colors, screen, space } from "@/lib/theme";

export const listStyles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.bg },
  listContent: {
    paddingHorizontal: screen.contentPadding,
    paddingTop: screen.contentPadding,
    paddingBottom: 28,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
});
