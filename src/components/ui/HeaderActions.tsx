import { View, StyleSheet } from "react-native";
import {
  HeaderIconButton,
  HEADER_ICON_BUTTON_GAP,
  HEADER_ICON_BUTTON_SIZE,
} from "@/components/ui/HeaderIconButton";
import type { IconName } from "@/components/ui/Icon";

export type HeaderActionItem = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel?: string;
  /** Tetap di layout tapi tidak interaktif — hindari relayout header saat kondisi berubah. */
  hidden?: boolean;
};

type Props = {
  actions: HeaderActionItem[];
  /** Paksa remount subview header saat set tombol berubah (workaround react-native-screens). */
  layoutKey?: string;
};

function visibleActions(actions: HeaderActionItem[]): HeaderActionItem[] {
  return actions.filter((a) => !a.hidden);
}

export function headerActionsWidth(count: number): number {
  if (count <= 0) return 0;
  return count * HEADER_ICON_BUTTON_SIZE + (count - 1) * HEADER_ICON_BUTTON_GAP;
}

/** Baris tombol kanan header — lebar eksplisit agar tidak ada ruang kosong di belakang ikon. */
export function HeaderActions({ actions, layoutKey }: Props) {
  const shown = visibleActions(actions);
  if (shown.length === 0) return null;

  const width = headerActionsWidth(shown.length);

  return (
    <View
      key={layoutKey ?? "header-actions"}
      collapsable={false}
      style={[styles.row, { width }]}
    >
      {shown.map((action, index) => (
        <HeaderIconButton
          key={`${action.icon}-${index}`}
          icon={action.icon}
          onPress={action.onPress}
          accessibilityLabel={action.accessibilityLabel}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: HEADER_ICON_BUTTON_GAP,
    flexShrink: 0,
    alignSelf: "flex-end",
    overflow: "hidden",
  },
});
