import { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { useTheme } from "@/context/AppPreferencesContext";
import { radius, space } from "@/lib/theme";
import type { MonthlyTrendPoint } from "@/lib/recap-monthly-trend";

type Props = {
  title: string;
  points: MonthlyTrendPoint[];
  color: string;
  yMax?: number;
  emptyLabel: string;
  size?: "default" | "large";
};

const CHART_HEIGHT = { default: 108, large: 148 } as const;
const PAD_X = 10;
const PAD_TOP = 10;
const LABEL_H = 18;

export function RecapLineChart({
  title,
  points,
  color,
  yMax = 100,
  emptyLabel,
  size = "default",
}: Props) {
  const { colors, font, scale } = useTheme();
  const [width, setWidth] = useState(0);

  const textStyles = useMemo(
    () => ({
      title: { fontSize: scale(12), fontWeight: "700" as const },
      axis: { fontSize: scale(9), fontWeight: "600" as const },
      empty: { fontSize: scale(11) },
    }),
    [scale],
  );

  const plotted = points.filter((p) => p.value !== null) as Array<
    MonthlyTrendPoint & { value: number }
  >;

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const chartHeight = CHART_HEIGHT[size];
  const cardStyle = size === "large" ? styles.cardLarge : styles.card;
  const plotHeight = chartHeight - PAD_TOP - LABEL_H;
  const plotWidth = Math.max(width - PAD_X * 2, 1);

  const coords = useMemo(() => {
    if (!plotted.length || width <= 0) return [];
    const step = plotted.length > 1 ? plotWidth / (plotted.length - 1) : 0;
    return plotted.map((point, index) => {
      const x = PAD_X + (plotted.length > 1 ? step * index : plotWidth / 2);
      const ratio = Math.min(Math.max(point.value / yMax, 0), 1);
      const y = PAD_TOP + plotHeight * (1 - ratio);
      return { ...point, x, y };
    });
  }, [plotted, plotHeight, plotWidth, width, yMax]);

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(" ");

  if (!plotted.length) {
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
          {emptyLabel}
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
      onLayout={onLayout}
      accessibilityRole="image"
      accessibilityLabel={title}
    >
      <Text style={[font.caption, textStyles.title, { color: colors.text }]}>
        {title}
      </Text>
      <View style={{ height: chartHeight }}>
        {width > 0 ? (
          <Svg width={width} height={chartHeight}>
            <Line
              x1={PAD_X}
              y1={PAD_TOP + plotHeight}
              x2={width - PAD_X}
              y2={PAD_TOP + plotHeight}
              stroke={colors.border}
              strokeWidth={1}
            />
            {coords.length > 1 ? (
              <Polyline
                points={polyline}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}
            {coords.map((point) => (
              <Circle
                key={point.key}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={color}
                stroke={colors.surface}
                strokeWidth={2}
              />
            ))}
          </Svg>
        ) : null}
        <View style={[styles.labels, { top: chartHeight - LABEL_H }]}>
          {points.map((point) => (
            <Text
              key={point.key}
              style={[textStyles.axis, styles.label, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {point.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.sm,
    gap: space.xs,
    marginBottom: space.sm,
  },
  cardLarge: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.sm,
  },
  labels: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  label: {
    flex: 1,
    textAlign: "center",
  },
});
