import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { Icon } from "@/components/ui/Icon";
import { LabelBadge } from "@/components/ui/LabelBadge";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius, space } from "@/lib/theme";

export type FilterOption = {
  key: string;
  label: string;
  colorId?: string | null;
};

type Props = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (key: string) => void;
  modalTitle: string;
  dense?: boolean;
  /** Satu baris: label · nilai · chevron */
  inline?: boolean;
  /** Inline tanpa label — hanya nilai + chevron (toolbar rekap). */
  inlineMinimal?: boolean;
};

export function FilterPicker({
  label,
  value,
  options,
  onChange,
  modalTitle,
  dense,
  inline,
  inlineMinimal,
}: Props) {
  const { colors, font, scale, t } = useTheme();
  const textStyles = useMemo(
    () => ({
      inlineLabel: { fontWeight: "600" as const, flexShrink: 0 },
      inlineDot: { flexShrink: 0 },
      triggerLabel: {},
      sheetTitle: { flex: 1, fontSize: scale(16) },
    }),
    [scale],
  );
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const selected = options.find((opt) => opt.key === value);

  function close() {
    setOpen(false);
  }

  function pick(key: string) {
    onChange(key);
    close();
  }

  const sheetMaxHeight = Math.min(windowHeight * 0.72, 420 + options.length * 4);

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          inline ? styles.triggerInline : styles.trigger,
          !inline && dense && styles.triggerDense,
          inline && dense && styles.triggerInlineDense,
          inline && inlineMinimal && styles.triggerInlineMinimal,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.92 : 1,
          },
          !inline && elevation(colors.cardShadow, "sm"),
        ]}
        onPress={withHaptic(() => setOpen(true))}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? ""}`}
      >
        {inline ? (
          <>
            {!inlineMinimal ? (
              <>
                <Text
                  style={[font.caption, textStyles.inlineLabel, { color: colors.textMuted }]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
                <Text style={[font.caption, textStyles.inlineDot, { color: colors.textMuted }]}>
                  ·
                </Text>
              </>
            ) : null}
            <View style={[styles.inlineValue, inlineMinimal && styles.inlineValueMinimal]}>
              {selected ? (
                <LabelBadge
                  compact
                  label={selected.label}
                  colorId={selected.colorId}
                  seed={selected.label}
                />
              ) : (
                <Text
                  style={[font.caption, styles.triggerPlaceholder, { color: colors.textMuted }]}
                >
                  —
                </Text>
              )}
            </View>
            <Icon name="chevronDown" size={14} color={colors.textMuted} />
          </>
        ) : (
          <>
            <Text style={[font.label, textStyles.triggerLabel, { color: colors.textMuted }]}>
              {label}
            </Text>
            <View style={styles.triggerValueRow}>
              {selected ? (
                <LabelBadge
                  compact
                  label={selected.label}
                  colorId={selected.colorId}
                  seed={selected.label}
                />
              ) : (
                <Text style={[font.body, styles.triggerPlaceholder, { color: colors.textMuted }]}>
                  —
                </Text>
              )}
              <Icon name="chevronDown" size={18} color={colors.textMuted} />
            </View>
          </>
        )}
      </Pressable>

      <BottomSheetModal visible={open} onClose={close}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                maxHeight: sheetMaxHeight,
                paddingBottom: Math.max(insets.bottom, space.md),
              },
              elevation(colors.cardShadow, "lg"),
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
              <Text style={[font.title, textStyles.sheetTitle, { color: colors.text }]}>
                {modalTitle}
              </Text>
              <Pressable
                onPress={withHaptic(close)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: colors.bg },
                  pressed && { opacity: 0.85 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t("common.cancel")}
              >
                <Icon name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => (
                <View
                  style={[styles.separator, { backgroundColor: colors.border }]}
                />
              )}
              renderItem={({ item }) => {
                const active = item.key === value;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.optionRow,
                      active && { backgroundColor: colors.primaryMuted },
                      pressed && !active && { backgroundColor: colors.bg },
                    ]}
                    onPress={withHaptic(() => pick(item.key))}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <View style={styles.optionMain}>
                      <LabelBadge
                        compact
                        label={item.label}
                        colorId={item.colorId}
                        seed={item.label}
                      />
                    </View>
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active ? colors.primary : colors.surface,
                        },
                      ]}
                    >
                      {active ? <Icon name="check" size={12} color="#fff" /> : null}
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    gap: 6,
  },
  triggerDense: {
    paddingVertical: 8,
    paddingHorizontal: space.sm,
  },
  triggerInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
  },
  triggerInlineDense: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    gap: 4,
  },
  triggerInlineMinimal: {
    flexShrink: 0,
    flexGrow: 0,
    maxWidth: "46%",
  },
  inlineValue: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-start",
  },
  inlineValueMinimal: {
    flex: 0,
    flexShrink: 1,
  },
  triggerValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  triggerPlaceholder: {
    flex: 1,
    fontWeight: "600",
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    marginTop: space.sm,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: space.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: space.md,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: 14,
  },
  optionMain: {
    flex: 1,
    minWidth: 0,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
