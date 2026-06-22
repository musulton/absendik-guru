import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import type { WorkspaceKind } from "@/lib/workspace-kind";
import { radius } from "@/lib/theme";

type Props = {
  kind: WorkspaceKind;
  label: string;
};

function badgeStyle(kind: WorkspaceKind, colors: ReturnType<typeof useTheme>["colors"]) {
  if (kind === "school") {
    return {
      bg: colors.primaryMuted,
      border: colors.primaryBorder,
      text: colors.primary,
      icon: "school" as IconName,
    };
  }
  if (kind === "localArchive") {
    return {
      bg: colors.successBg,
      border: colors.accent,
      text: colors.accent,
      icon: "recap" as IconName,
    };
  }
  return {
    bg: colors.bg,
    border: colors.border,
    text: colors.textMuted,
    icon: "smartphone" as IconName,
  };
}

export function WorkspaceTypeBadge({ kind, label }: Props) {
  const { colors, scale } = useTheme();
  const style = badgeStyle(kind, colors);
  const textStyle = useMemo(
    () => ({ fontSize: scale(10), fontWeight: "700" as const, maxWidth: 220 }),
    [scale],
  );

  return (
    <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Icon name={style.icon} size={10} color={style.text} />
      <Text style={[textStyle, { color: style.text }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginTop: 4,
  },
});
