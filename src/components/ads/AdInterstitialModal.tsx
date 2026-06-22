import { useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/AppPreferencesContext";
import type { AdInterstitialPlacement } from "@/lib/ads/placements";
import type { TranslationKey } from "@/lib/i18n/translations";
import { radius, space } from "@/lib/theme";

const PLACEMENT_KEYS: Record<AdInterstitialPlacement, TranslationKey> = {
  attendance_saved: "ads.placement.attendanceSaved",
  grade_saved: "ads.placement.gradeSaved",
  recap_export: "ads.placement.recapExport",
  sync_complete: "ads.placement.syncComplete",
};

type Props = {
  visible: boolean;
  placement: AdInterstitialPlacement | null;
  onClose: () => void;
  onUpgrade?: () => void;
};

/** Interstitial sopan — bisa ditutup kapan saja, muncul jarang. */
export function AdInterstitialModal({
  visible,
  placement,
  onClose,
  onUpgrade,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors, font, scale, t } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          justifyContent: "center",
          paddingHorizontal: space.lg,
          paddingBottom: space.xl,
        },
        card: {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: space.lg,
          gap: space.md,
        },
        title: { ...font.title, fontSize: scale(16) },
        body: { ...font.body, lineHeight: scale(20) },
        adMock: {
          minHeight: 120,
          borderRadius: radius.md,
          backgroundColor: colors.bg,
          borderWidth: 1,
          borderColor: colors.border,
          borderStyle: "dashed",
          padding: space.md,
          justifyContent: "center",
        },
        adLabel: { ...font.label, marginBottom: space.xs },
        adSub: { ...font.caption, lineHeight: scale(17) },
        actions: { gap: space.sm },
        btnPrimary: {
          backgroundColor: colors.primary,
          borderRadius: radius.md,
          paddingVertical: space.md,
          alignItems: "center",
        },
        btnPrimaryText: {
          color: "#fff",
          fontWeight: "700",
          fontSize: scale(15),
        },
        btnGhost: {
          paddingVertical: space.sm,
          alignItems: "center",
        },
        btnGhostText: { ...font.caption, fontWeight: "600", color: colors.primary },
        pressed: { opacity: 0.88 },
      }),
    [colors, font, scale],
  );

  const message =
    placement && PLACEMENT_KEYS[placement]
      ? t(PLACEMENT_KEYS[placement])
      : t("ads.placement.default");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { paddingTop: insets.top + space.lg }]}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("ads.sponsorTitle")}</Text>
          <Text style={styles.body}>{message}</Text>
          <View style={styles.adMock}>
            <Text style={styles.adLabel}>{t("ads.mockLabel")}</Text>
            <Text style={styles.adSub}>{t("ads.mockSub")}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.btnPrimary,
                pressed && styles.pressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.btnPrimaryText}>{t("ads.continue")}</Text>
            </Pressable>
            {onUpgrade ? (
              <Pressable
                style={({ pressed }) => [
                  styles.btnGhost,
                  pressed && styles.pressed,
                ]}
                onPress={() => {
                  onClose();
                  onUpgrade();
                }}
              >
                <Text style={styles.btnGhostText}>{t("ads.upgradeProNoAds")}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
