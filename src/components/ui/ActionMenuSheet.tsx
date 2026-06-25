import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius, space } from "@/lib/theme";

const BACKDROP_COLOR = "rgba(15, 23, 42, 0.42)";

export type ActionMenuItem = {
  id: string;
  label: string;
  icon?: IconName;
  onPress: () => void;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  items: ActionMenuItem[];
  onClose: () => void;
  onItemPress: (item: ActionMenuItem) => void;
};

export function ActionMenuSheet({
  visible,
  title,
  subtitle,
  items,
  onClose,
  onItemPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors, scale, t } = useTheme();
  const sheetY = useRef(new Animated.Value(320)).current;

  useEffect(() => {
    if (!visible) {
      sheetY.setValue(320);
      return;
    }

    sheetY.setValue(320);
    Animated.spring(sheetY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 24,
      stiffness: 280,
    }).start();
  }, [visible, sheetY]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          justifyContent: "flex-end",
        },
        backdrop: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: BACKDROP_COLOR,
        },
        sheet: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          paddingHorizontal: space.md,
          paddingTop: space.sm,
          gap: space.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderBottomWidth: 0,
        },
        handle: {
          alignSelf: "center",
          width: 40,
          height: 4,
          borderRadius: radius.pill,
          backgroundColor: colors.border,
          marginBottom: space.xs,
        },
        header: { gap: 2, paddingHorizontal: space.xs, paddingBottom: space.xs },
        title: { fontSize: scale(16), fontWeight: "800", color: colors.text },
        subtitle: {
          fontSize: scale(12),
          lineHeight: scale(17),
          color: colors.textMuted,
        },
        list: { gap: space.xs },
        item: {
          flexDirection: "row",
          alignItems: "center",
          gap: space.md,
          paddingHorizontal: space.md,
          paddingVertical: 14,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          backgroundColor: colors.bg,
        },
        itemPressed: { opacity: 0.9 },
        itemIcon: {
          width: 36,
          height: 36,
          borderRadius: radius.md,
          alignItems: "center",
          justifyContent: "center",
        },
        itemLabel: { flex: 1, fontSize: scale(15), fontWeight: "600" },
        cancel: {
          marginTop: space.xs,
          paddingVertical: 14,
          alignItems: "center",
          borderRadius: radius.lg,
          backgroundColor: colors.primaryMuted,
        },
        cancelText: {
          fontSize: scale(15),
          fontWeight: "700",
          color: colors.primary,
        },
        pressed: { opacity: 0.88 },
      }),
    [colors, scale],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("common.cancel")}
        />
        <Animated.View
          style={[
            styles.sheet,
            elevation(colors.cardShadow, "lg"),
            {
              paddingBottom: Math.max(insets.bottom, space.md),
              transform: [{ translateY: sheetY }],
            },
          ]}
        >
          <View style={styles.handle} />
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}
          <View style={styles.list}>
            {items.map((item) => {
              const tone = item.destructive ? colors.danger : colors.text;
              const iconBg = item.destructive
                ? colors.dangerBg
                : colors.primaryMuted;
              const iconColor = item.destructive
                ? colors.danger
                : colors.primary;
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && styles.itemPressed,
                  ]}
                  onPress={withHaptic(() => onItemPress(item))}
                  accessibilityRole="button"
                >
                  {item.icon ? (
                    <View style={[styles.itemIcon, { backgroundColor: iconBg }]}>
                      <Icon name={item.icon} size={18} color={iconColor} />
                    </View>
                  ) : null}
                  <Text style={[styles.itemLabel, { color: tone }]}>
                    {item.label}
                  </Text>
                  <Icon name="chevronRight" size={18} color={colors.textMuted} />
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
            onPress={withHaptic(onClose)}
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>{t("common.cancel")}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
