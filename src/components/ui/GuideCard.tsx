import { StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { radius, space } from "@/lib/theme";

type Props = {
  title: string;
  body: string;
  icon?: IconName;
};

/** Kartu petunjuk di atas daftar — gaya formal pendidikan. */
export function GuideCard({ title, body, icon = "info" }: Props) {
  const { colors, font } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.primaryMuted,
          borderColor: colors.primaryBorder,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.textBlock}>
        <Text style={[font.body, { color: colors.primary, fontWeight: "700" }]}>
          {title}
        </Text>
        <Text
          style={[
            font.caption,
            { color: colors.text, lineHeight: 19, marginTop: 3 },
          ]}
        >
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: space.md,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: { flex: 1 },
});
