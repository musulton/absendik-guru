import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CenteredModal } from "@/components/ui/CenteredModal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { radius, space } from "@/lib/theme";

type Props = {
  visible: boolean;
  readonly: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function AddStudentsPromptModal({
  visible,
  readonly,
  title,
  body,
  confirmLabel,
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
      }),
    [colors, font, scale],
  );

  return (
    <CenteredModal visible={visible} onClose={onClose}>
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.actions}>
            {readonly ? (
              <PrimaryButton title={t("common.done")} onPress={onClose} />
            ) : (
              <>
                <PrimaryButton title={confirmLabel} onPress={onConfirm} />
                <Pressable
                  onPress={withHaptic(onClose)}
                  accessibilityRole="button"
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text
                    style={[
                      font.caption,
                      {
                        textAlign: "center",
                        fontWeight: "600",
                        color: colors.textMuted,
                        paddingVertical: space.sm,
                      },
                    ]}
                  >
                    {t("common.cancel")}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </CenteredModal>
  );
}
