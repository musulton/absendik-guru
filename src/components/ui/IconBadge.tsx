import { StyleSheet, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { radius } from "@/lib/theme";

type Props = {
  icon: IconName;
  backgroundColor: string;
  color: string;
  size?: "sm" | "md";
};

export function IconBadge({
  icon,
  backgroundColor,
  color,
  size = "md",
}: Props) {
  const dim = size === "sm" ? 32 : 40;
  const iconSize = size === "sm" ? 16 : 18;

  return (
    <View
      style={[
        styles.badge,
        {
          width: dim,
          height: dim,
          borderRadius: size === "sm" ? radius.md : radius.lg,
          backgroundColor,
        },
      ]}
    >
      <Icon name={icon} size={iconSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
