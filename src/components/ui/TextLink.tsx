import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";

type Props = {
  label: string;
  onPress: () => void;
  danger?: boolean;
};

export function TextLink({ label, onPress, danger }: Props) {
  const { colors, font } = useTheme();

  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text
        style={[
          font.caption,
          styles.link,
          { color: danger ? colors.danger : colors.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { fontWeight: "600" },
});
