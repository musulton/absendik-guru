import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { space } from "@/lib/theme";

type Props = {
  metaLabel: string;
};

export function RecapSummaryBar({ metaLabel }: Props) {
  const { colors, font, scale } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          font.caption,
          styles.meta,
          { color: colors.textMuted, fontSize: scale(11), lineHeight: scale(15) },
        ]}
      >
        {metaLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.sm,
  },
  meta: {
    fontWeight: "600",
  },
});
