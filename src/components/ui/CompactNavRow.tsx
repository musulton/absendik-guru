import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { radius, space } from "@/lib/theme";

type Props = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onLabelPress?: () => void;
  /** Teks a11y / hint untuk tombol pilih periode spesifik. */
  pickHint?: string;
  nextDisabled?: boolean;
  dense?: boolean;
  /** Paling ringkas — untuk toolbar rekap. */
  mini?: boolean;
};

export function CompactNavRow({
  label,
  onPrev,
  onNext,
  onLabelPress,
  pickHint,
  nextDisabled,
  dense,
  mini,
}: Props) {
  const { colors, font, scale } = useTheme();
  const textStyles = useMemo(
    () => ({
      labelDense: { fontSize: scale(13), lineHeight: scale(18) },
      labelMini: { fontSize: scale(11), lineHeight: scale(14) },
    }),
    [scale],
  );
  const btnSize = mini ? 32 : dense ? 36 : 38;
  const iconSize = mini ? 18 : 20;

  const labelNode = (
    <Text
      style={[
        font.body,
        styles.label,
        dense && textStyles.labelDense,
        mini && textStyles.labelMini,
        { color: onLabelPress ? colors.primary : colors.text },
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );

  return (
    <View style={[styles.row, dense && styles.rowDense, mini && styles.rowMini]}>
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          { width: btnSize, height: btnSize },
          {
            backgroundColor: pressed ? colors.primaryMuted : colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={withHaptic(onPrev)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Sebelumnya"
      >
        <Icon name="chevronLeft" size={iconSize} color={colors.primary} />
      </Pressable>
      {onLabelPress ? (
        <Pressable
          style={[
            styles.labelPress,
            {
              height: btnSize,
              backgroundColor: colors.surface,
              borderColor: colors.primaryBorder,
            },
          ]}
          onPress={withHaptic(onLabelPress)}
          accessibilityRole="button"
          accessibilityLabel={pickHint ?? label}
        >
          {labelNode}
          <Icon name="calendar" size={14} color={colors.primary} />
        </Pressable>
      ) : (
        <View
          style={[
            styles.labelPress,
            {
              height: btnSize,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {labelNode}
        </View>
      )}
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          { width: btnSize, height: btnSize },
          {
            backgroundColor: pressed ? colors.primaryMuted : colors.surface,
            borderColor: colors.border,
            opacity: nextDisabled ? 0.4 : 1,
          },
        ]}
        onPress={withHaptic(onNext)}
        disabled={nextDisabled}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Berikutnya"
      >
        <Icon name="chevronRight" size={iconSize} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.sm,
  },
  rowDense: { gap: 6, marginBottom: 0 },
  rowMini: { gap: 4, marginBottom: 0 },
  btn: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  labelPress: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.sm,
    gap: 4,
  },
  label: { textAlign: "center", fontWeight: "700", flexShrink: 1 },
});
