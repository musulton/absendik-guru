import { StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { radius, space } from "@/lib/theme";

type Props = {
  label: string;
  value: string;
  hint?: string;
  accentColor: string;
  icon: "attendance" | "grades" | "recap";
};

export function RecapChartHero({ label, value, hint, accentColor, icon }: Props) {
  const { colors, font, scale } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${accentColor}18` }]}>
        <Icon name={icon} size={22} color={accentColor} />
      </View>
      <View style={styles.textCol}>
        <Text
          style={[
            font.caption,
            styles.label,
            { color: colors.textMuted, fontSize: scale(11) },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            font.title,
            styles.value,
            { color: accentColor, fontSize: scale(28), lineHeight: scale(32) },
          ]}
        >
          {value}
        </Text>
        {hint ? (
          <Text
            style={[
              font.caption,
              { color: colors.textMuted, fontSize: scale(11), marginTop: 2 },
            ]}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontWeight: "600",
    marginBottom: 2,
  },
  value: {
    fontWeight: "800",
  },
});
