import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CenteredModal } from "@/components/ui/CenteredModal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { radius, space } from "@/lib/theme";

type Props = {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  const { colors, font, scale, t } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          justifyContent: "center",
          paddingHorizontal: space.lg,
          paddingVertical: space.xl,
        },
        card: {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: space.lg,
          gap: space.md,
        },
        title: { ...font.title, fontSize: scale(17) },
        body: { ...font.body, lineHeight: scale(22), color: colors.textMuted },
        actions: { gap: space.sm, marginTop: space.xs },
        cancelText: {
          textAlign: "center",
          fontWeight: "600",
          color: colors.textMuted,
          paddingVertical: space.sm,
        },
        destructiveBtn: {
          minHeight: 48,
          borderRadius: radius.md,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: space.md,
        },
        destructiveBtnText: {
          color: "#fff",
          fontSize: scale(15),
          fontWeight: "600",
        },
        pressed: { opacity: 0.88 },
      }),
    [colors, font, scale],
  );

  return (
    <CenteredModal visible={visible} onClose={onClose}>
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {body ? <Text style={styles.body}>{body}</Text> : null}
          <View style={styles.actions}>
            {destructive ? (
              <Pressable
                onPress={loading ? undefined : withHaptic(onConfirm)}
                disabled={loading}
                style={({ pressed }) => [
                  styles.destructiveBtn,
                  { backgroundColor: colors.danger },
                  (pressed || loading) && styles.pressed,
                ]}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.destructiveBtnText}>{confirmLabel}</Text>
                )}
              </Pressable>
            ) : (
              <PrimaryButton
                title={confirmLabel}
                loading={loading}
                onPress={onConfirm}
              />
            )}
            <Pressable
              onPress={withHaptic(onClose)}
              accessibilityRole="button"
              disabled={loading}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[font.caption, styles.cancelText]}>
                {cancelLabel ?? t("common.cancel")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </CenteredModal>
  );
}
