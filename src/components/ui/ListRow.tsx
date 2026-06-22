import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { LabelBadge } from "@/components/ui/LabelBadge";
import { WorkspaceTypeBadge } from "@/components/ui/WorkspaceTypeBadge";
import { useTheme } from "@/context/AppPreferencesContext";
import type { WorkspaceKind } from "@/lib/workspace-kind";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius, space } from "@/lib/theme";

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  labelColorId?: string | null;
  leadingIcon?: IconName;
  accentColor?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
  titleLines?: number;
  subtitleLines?: number;
  compact?: boolean;
  workspaceKind?: WorkspaceKind;
  workspaceKindLabel?: string;
};

function ListRowInner({
  title,
  subtitle,
  meta,
  labelColorId,
  leadingIcon,
  accentColor,
  onPress,
  onLongPress,
  right,
  danger,
  compact,
  workspaceKind,
  workspaceKindLabel,
}: Props) {
  const { colors, font } = useTheme();
  const stripColor = danger
    ? colors.danger
    : accentColor ?? colors.primary;

  const content = (
    <View
      style={[
        styles.row,
        compact && styles.rowCompact,
        {
          backgroundColor: danger ? colors.dangerBg : colors.surface,
          borderColor: danger ? colors.danger : colors.border,
        },
        !danger && elevation(colors.cardShadow, "sm"),
      ]}
    >
      <View style={[styles.strip, { backgroundColor: stripColor }]} />
      <View style={styles.rowBody}>
        {leadingIcon ? (
          <IconBadge
            icon={leadingIcon}
            backgroundColor={danger ? colors.dangerBg : colors.primaryMuted}
            color={danger ? colors.danger : colors.primary}
            size="sm"
          />
        ) : null}
        <View style={styles.main}>
          {labelColorId !== undefined ? (
            <LabelBadge label={title} colorId={labelColorId} seed={title} />
          ) : (
            <Text
              style={[font.body, { fontWeight: "700" }, danger && { color: colors.danger }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          {subtitle ? (
            <Text style={[font.caption, { marginTop: 3 }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          {workspaceKind && workspaceKindLabel ? (
            <WorkspaceTypeBadge kind={workspaceKind} label={workspaceKindLabel} />
          ) : null}
          {meta ? (
            <Text style={[font.caption, { marginTop: 3, color: colors.primary, fontWeight: "600" }]}>
              {meta}
            </Text>
          ) : null}
        </View>
        {right ??
          (onPress ? (
            <View style={[styles.chevronPill, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <Icon name="chevronRight" size={18} color={colors.textMuted} />
            </View>
          ) : null)}
      </View>
    </View>
  );

  if (!onPress && !onLongPress) return content;

  return (
    <Pressable
      onPress={onPress ? withHaptic(onPress) : undefined}
      onLongPress={onLongPress ? withHaptic(onLongPress) : undefined}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {content}
    </Pressable>
  );
}

export const ListRow = memo(ListRowInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: space.sm,
    overflow: "hidden",
  },
  rowCompact: {
    marginBottom: space.xs,
  },
  strip: {
    width: 4,
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: space.md,
    gap: space.sm,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.997 }] },
  main: { flex: 1, minWidth: 0 },
  chevronPill: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
