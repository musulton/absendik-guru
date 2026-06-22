import { Text } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { space } from "@/lib/theme";

type Props = {
  children: string;
};

export function FormLabel({ children }: Props) {
  const { font } = useTheme();
  return (
    <Text
      style={[
        font.label,
        { marginBottom: space.xs, textTransform: "none" },
      ]}
    >
      {children}
    </Text>
  );
}
