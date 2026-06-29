import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { radius, space } from "@/lib/theme";
import type { TranslationKey } from "@/lib/i18n/translations";

export type RecapChartItem = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type Props = {
  title: string;
  items: RecapChartItem[];
  emptyLabelKey?: TranslationKey;
  size?: "default" | "large";
};

const CHART_HEIGHT = { default: 96, large: 132 } as const;
const MIN_BAR = 4;

export function RecapBarChart({
  title,
  items,
  emptyLabelKey = "recap.chartEmpty",
  size = "default",
}: Props) {
  const { colors, font, scale, t } = useTheme();
  const textStyles = useMemo(
    () => ({
      title: { fontSize: scale(12), fontWeight: "700" as const },
      value: { fontSize: scale(10), fontWeight: "700" as const },
      label: { fontSize: scale(10), fontWeight: "600" as const },
      empty: { fontSize: scale(11) },
    }),
    [scale],
  );

  const chartHeight = CHART_HEIGHT[size];
  const cardStyle = size === "large" ? styles.cardLarge : styles.card;

  const max = Math.max(...items.map((item) => item.value), 1);
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <View
        style={[
          cardStyle,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[font.caption, textStyles.title, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[font.caption, textStyles.empty, { color: colors.textMuted }]}>
          {t(emptyLabelKey)}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        cardStyle,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      accessibilityRole="summary"
      accessibilityLabel={title}
    >
      <Text style={[font.caption, textStyles.title, { color: colors.text }]}>
        {title}
      </Text>
      <View style={styles.bars}>
        {items.map((item) => {
          const ratio = item.value / max;
          const barHeight =
            item.value > 0 ? Math.max(ratio * chartHeight, MIN_BAR) : 0;
          return (
            <View key={item.key} style={styles.barCol}>
              <Text
                style={[textStyles.value, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.value}
              </Text>
              <View style={[styles.barTrack, { height: chartHeight }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: barHeight,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text
                style={[textStyles.label, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.sm,
    gap: space.sm,
    marginBottom: space.sm,
  },
  cardLarge: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.md,
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.xs,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    minWidth: 0,
  },
  barTrack: {
    width: "72%",
    maxWidth: 44,
    justifyContent: "flex-end",
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  barFill: {
    width: "100%",
    borderRadius: radius.sm,
  },
});
