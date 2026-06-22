import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AdBannerPlacement } from "@/lib/ads/placements";
import { isBannerPlacementAllowed } from "@/lib/ads/policy";
import { getBannerAd } from "@/lib/ads/admob";
import { getCachedAdRequestOptions } from "@/lib/ads/consent";
import { Icon } from "@/components/ui/Icon";
import { useAdsOptional } from "@/context/AdContext";
import { useTheme } from "@/context/AppPreferencesContext";
import { radius, space } from "@/lib/theme";

type Props = {
  placement: AdBannerPlacement;
  onUpgrade?: () => void;
};

/**
 * Banner bawah — tidak mengganggu input absensi.
 * Native AdMob bila SDK siap; placeholder aman di Expo Go.
 */
export function AdBannerSlot({ placement, onUpgrade }: Props) {
  const ads = useAdsOptional();
  const { colors, font, scale, t } = useTheme();
  const textStyles = useMemo(
    () => ({
      sponsor: { fontSize: scale(9), marginBottom: 2 },
      adLine: { fontSize: scale(11), lineHeight: scale(15) },
      upgradeText: { fontSize: scale(11), fontWeight: "700" as const },
    }),
    [scale],
  );

  if (!ads?.adsEnabled || !isBannerPlacementAllowed(placement)) {
    return null;
  }

  const banner = ads.runtime === "native" ? getBannerAd() : null;

  return (
    <View
      style={[
        styles.wrap,
        { borderTopColor: colors.border, backgroundColor: colors.surface },
      ]}
    >
      {banner ? (
        <View style={styles.bannerArea} accessibilityLabel="Iklan">
          <banner.Component
            unitId={banner.unitId}
            size={banner.size}
            requestOptions={getCachedAdRequestOptions()}
          />
        </View>
      ) : (
        <View
          style={[
            styles.adArea,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
          accessibilityLabel="Iklan"
        >
          <Text style={[font.label, textStyles.sponsor]}>Sponsor</Text>
          <Text
            style={[font.caption, textStyles.adLine, { color: colors.textMuted }]}
          >
            {t("ads.bannerHint")}
          </Text>
        </View>
      )}
      {onUpgrade ? (
        <Pressable
          onPress={onUpgrade}
          style={({ pressed }) => [styles.upgrade, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={t("settings.upgradePro")}
        >
          <Text
            style={[font.caption, textStyles.upgradeText, { color: colors.primary }]}
          >
            {t("ads.upgradeShort")}
          </Text>
          <Icon name="arrowRight" size={13} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    paddingTop: space.xs,
    paddingHorizontal: space.sm,
    paddingBottom: space.xs,
    gap: space.xs,
  },
  bannerArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  adArea: {
    minHeight: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    justifyContent: "center",
  },
  upgrade: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
    paddingVertical: 2,
  },
  pressed: { opacity: 0.75 },
});
