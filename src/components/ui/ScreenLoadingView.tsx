import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";

type Props = {
  /** Tampilkan teks "Memuat…" di bawah spinner. */
  label?: boolean;
  size?: "small" | "large";
  /** Isi sisa ruang layar (flex: 1). */
  fill?: boolean;
};

export function ScreenLoadingView({
  label = true,
  size = "large",
  fill = true,
}: Props) {
  const { colors, t, font } = useTheme();

  return (
    <View style={[fill && styles.fill, styles.center]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {label ? (
        <Text style={[font.caption, styles.label, { color: colors.textMuted }]}>
          {t("common.loading")}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  label: { marginTop: 8 },
});
