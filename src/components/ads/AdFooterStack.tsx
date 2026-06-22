import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { useAdsOptional } from "@/context/AdContext";
import type { AdBannerPlacement } from "@/lib/ads/placements";
import { isBannerPlacementAllowed } from "@/lib/ads/policy";
import { AdBannerSlot } from "@/components/ads/AdBannerSlot";
import { space } from "@/lib/theme";

type Props = {
  placement: AdBannerPlacement;
  onUpgrade?: () => void;
  /** Tombol aksi (mis. Simpan, Tambah siswa). */
  actions?: ReactNode;
};

function bottomInsetPadding(insetBottom: number, hasActions: boolean): number {
  if (hasActions) return 0;
  const minPad = Platform.select({ android: 12, ios: 8, default: 8 }) ?? 8;
  return Math.max(insetBottom, minPad);
}

/** Banner iklan di atas bar tombol — tidak menutupi tombol. */
export function AdFooterStack({ placement, onUpgrade, actions }: Props) {
  const ads = useAdsOptional();
  const insets = useSafeAreaInsets();
  const showBanner =
    Boolean(ads?.adsEnabled) && isBannerPlacementAllowed(placement);
  const bottomPad = bottomInsetPadding(insets.bottom, Boolean(actions));

  if (!actions) {
    if (!showBanner) return null;
    return (
      <View style={[styles.stack, { paddingBottom: bottomPad }]}>
        <AdBannerSlot placement={placement} onUpgrade={onUpgrade} />
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      {showBanner ? (
        <AdBannerSlot placement={placement} onUpgrade={onUpgrade} />
      ) : null}
      <StickyActionBar>{actions}</StickyActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { flexShrink: 0 },
});
