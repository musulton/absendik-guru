import { Pressable, StyleSheet, Text, View } from "react-native";
import { AccentCard } from "@/components/ui/AccentCard";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { radius, space } from "@/lib/theme";

type Props = {
  icon: IconName;
  title: string;
  subtitle?: string;
  accentColor: string;
  tintColor?: string;
  onPress: () => void;
};

export function HubNavCard({
  icon,
  title,
  subtitle,
  accentColor,
  tintColor,
  onPress,
}: Props) {
  const { colors, font, scale } = useTheme();

  return (
    <Pressable
      onPress={withHaptic(onPress)}
      style={({ pressed }) => [pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <AccentCard
        accentColor={accentColor}
        tintColor={tintColor}
        style={styles.outer}
        contentStyle={styles.body}
      >
        <IconBadge
          icon={icon}
          backgroundColor={`${accentColor}18`}
          color={accentColor}
        />
        <View style={styles.textWrap}>
          <Text
            style={[
              font.body,
              styles.title,
              { color: colors.text, fontSize: scale(16) },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                font.caption,
                { color: colors.textMuted, fontSize: scale(12), lineHeight: scale(17) },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={[styles.chevronPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Icon name="chevronRight" size={18} color={colors.textMuted} />
        </View>
      </AccentCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { marginBottom: 0 },
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: 14,
  },
  textWrap: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontWeight: "700" },
  chevronPill: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.998 }] },
});
