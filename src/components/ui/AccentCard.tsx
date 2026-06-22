import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius } from "@/lib/theme";

type Props = {
  accentColor: string;
  /** Warna lembut di area konten (opsional). */
  tintColor?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
};

export function AccentCard({
  accentColor,
  tintColor,
  children,
  style,
  contentStyle,
  onPress,
  onLongPress,
}: Props) {
  const { colors } = useTheme();

  const card = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        elevation(colors.cardShadow, "sm"),
        style,
      ]}
    >
      <View style={[styles.strip, { backgroundColor: accentColor }]} />
      <View
        style={[
          styles.content,
          tintColor ? { backgroundColor: tintColor } : null,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );

  if (!onPress && !onLongPress) return card;

  return (
    <Pressable
      onPress={onPress ? withHaptic(onPress) : undefined}
      onLongPress={onLongPress ? withHaptic(onLongPress) : undefined}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  strip: {
    width: 4,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  pressed: { opacity: 0.9 },
});
