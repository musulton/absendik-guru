import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AccentCard } from "@/components/ui/AccentCard";
import { resolveLabelColor } from "@/lib/label-colors";
import { useTheme } from "@/context/AppPreferencesContext";
import { radius, space } from "@/lib/theme";

type Props = {
  className: string;
  fullName: string;
  studentNumber?: string | null;
  filterLabel?: string | null;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function StudentProfileHeader({
  className,
  fullName,
  studentNumber,
  filterLabel,
}: Props) {
  const { colors, font, scale } = useTheme();
  const textStyles = useMemo(
    () => ({
      avatarText: { fontSize: scale(16), fontWeight: "800" as const },
      name: { fontWeight: "700" as const, fontSize: scale(16) },
    }),
    [scale],
  );
  const palette = resolveLabelColor(null, fullName);

  const metaParts = [className];
  if (studentNumber) metaParts.push(`NIS ${studentNumber}`);
  if (filterLabel) metaParts.push(filterLabel);

  return (
    <AccentCard
      accentColor={palette.text}
      tintColor={palette.bg}
      style={styles.outer}
      contentStyle={styles.body}
    >
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: `${palette.text}18`,
            borderColor: palette.text,
          },
        ]}
      >
        <Text style={[textStyles.avatarText, { color: palette.text }]}>
          {initials(fullName)}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[font.body, textStyles.name]} numberOfLines={1}>
          {fullName}
        </Text>
        <Text
          style={[font.caption, { color: colors.textMuted, lineHeight: scale(17) }]}
          numberOfLines={2}
        >
          {metaParts.join(" · ")}
        </Text>
      </View>
    </AccentCard>
  );
}

const styles = StyleSheet.create({
  outer: { marginBottom: space.sm },
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  info: { flex: 1, minWidth: 0, gap: 3 },
});
