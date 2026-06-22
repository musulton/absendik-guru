import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { useListMutations } from "@/hooks/useListMutations";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { apiMe } from "@/lib/guru-repository";
import { formatGuruUsageBanner } from "@/lib/guru-limits";
import { radius, space } from "@/lib/theme";

export function UsageBanner() {
  const { colors, font, t } = useTheme();
  const [text, setText] = useState("");

  const loadUsage = useCallback(async () => {
    const res = await apiMe(undefined, { force: true });
    if (!res.ok) return;
    const { usage, limits, cloudSubscriptionActive } = res.data;
    const tier = cloudSubscriptionActive
      ? t("settings.proActive")
      : t("settings.freePlanBadge");
    setText(formatGuruUsageBanner(usage, limits, tier, t));
  }, [t]);

  useEffect(() => {
    void loadUsage();
  }, [loadUsage]);

  useRefreshOnFocus(() => {
    void loadUsage();
  }, { staleMs: 0 });

  useListMutations((event) => {
    switch (event.type) {
      case "student-created":
      case "student-deleted":
      case "class-deleted":
      case "class-created":
        void loadUsage();
        break;
      default:
        break;
    }
  });

  if (!text) return null;

  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: colors.primaryMuted,
          borderColor: colors.primaryBorder,
        },
      ]}
    >
      <Text style={[font.caption, { color: colors.primary, lineHeight: font.caption.lineHeight }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    marginBottom: space.sm,
    borderWidth: 1,
  },
});
