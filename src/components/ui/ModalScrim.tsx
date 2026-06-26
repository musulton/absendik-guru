import type { ReactNode } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type ModalProps,
} from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { MODAL_BACKDROP_DARK, MODAL_BACKDROP_LIGHT } from "@/components/ui/modal-backdrop";

type Layout = "bottom" | "center";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  layout?: Layout;
  animationType?: ModalProps["animationType"];
  backdropColor?: string;
  dismissOnBackdropPress?: boolean;
};

/**
 * Scrim gelap + tap di luar konten untuk tutup.
 * - bottom: area atas flex menutup; konten menempel bawah (bottom sheet).
 * - center: tap di luar kartu dialog menutup (TouchableWithoutFeedback).
 */
export function ModalScrim({
  visible,
  onClose,
  children,
  layout = "center",
  animationType = "fade",
  backdropColor,
  dismissOnBackdropPress = true,
}: Props) {
  const { isDark, t } = useTheme();
  const scrimColor =
    backdropColor ?? (isDark ? MODAL_BACKDROP_DARK : MODAL_BACKDROP_LIGHT);

  const dismiss = dismissOnBackdropPress ? withHaptic(onClose) : undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      {layout === "bottom" ? (
        <View style={[styles.root, { backgroundColor: scrimColor }]}>
          <Pressable
            style={styles.flexDismiss}
            onPress={dismiss}
            accessibilityRole="button"
            accessibilityLabel={t("common.cancel")}
          />
          <View pointerEvents="box-none">{children}</View>
        </View>
      ) : (
        <TouchableWithoutFeedback onPress={dismiss}>
          <View style={[styles.root, { backgroundColor: scrimColor }]}>
            <View style={styles.centerHost} pointerEvents="box-none">
              <TouchableWithoutFeedback>
                <View style={styles.centerCardSlot}>{children}</View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flexDismiss: {
    flex: 1,
  },
  centerHost: {
    flex: 1,
    justifyContent: "center",
  },
  centerCardSlot: {
    width: "100%",
  },
});
