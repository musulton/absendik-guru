import { StyleSheet, View } from "react-native";
import { ScreenLoadingView } from "@/components/ui/ScreenLoadingView";
import { useTheme } from "@/context/AppPreferencesContext";

type Props = {
  visible: boolean;
};

/** Overlay semi-transparan saat fetch ulang (filter/tanggal) dengan data lama masih tampil. */
export function FetchLoadingOverlay({ visible }: Props) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View
      style={[styles.overlay, { backgroundColor: colors.bg }]}
      pointerEvents="auto"
    >
      <ScreenLoadingView fill={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.92,
    zIndex: 2,
  },
});
