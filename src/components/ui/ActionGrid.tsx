import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius, space } from "@/lib/theme";

export type ActionGridItem = {
  key: string;
  icon?: IconName;
  label: string;
  onPress: () => void;
  primary?: boolean;
};

type Props = {
  items: ActionGridItem[];
};

export function ActionGrid({ items }: Props) {
  const { colors, font } = useTheme();

  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const tint = item.primary ? colors.primary : colors.text;
        return (
          <Pressable
            key={item.key}
            style={({ pressed }) => [
              styles.tile,
              {
                backgroundColor: colors.surface,
                borderColor: item.primary ? colors.primaryBorder : colors.border,
              },
              elevation(colors.cardShadow, "sm"),
              pressed && styles.pressed,
            ]}
            onPress={withHaptic(item.onPress)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            {item.icon ? (
              <View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor: item.primary
                      ? colors.primaryMuted
                      : colors.bg,
                  },
                ]}
              >
                <Icon name={item.icon} size={20} color={tint} />
              </View>
            ) : null}
            <Text
              style={[font.body, styles.label, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  tile: {
    width: "48%",
    flexGrow: 1,
    minWidth: "46%",
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    minHeight: 60,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { flex: 1, fontWeight: "600" },
});
