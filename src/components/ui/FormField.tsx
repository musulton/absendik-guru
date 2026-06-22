import { useMemo } from "react";
import { StyleSheet, Text, TextInput, type TextInputProps } from "react-native";
import { useTheme } from "@/context/AppPreferencesContext";
import { radius, space } from "@/lib/theme";

type Props = TextInputProps & {
  label: string;
};

export function FormField({ label, style, ...rest }: Props) {
  const { colors, font } = useTheme();
  const inputStyle = useMemo(
    () => ({ fontSize: font.body.fontSize }),
    [font.body.fontSize],
  );

  return (
    <>
      <Text
        style={[
          font.label,
          { marginBottom: space.xs, textTransform: "none" },
        ]}
      >
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          inputStyle,
          {
            borderColor: colors.border,
            color: colors.text,
            backgroundColor: colors.surface,
          },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        {...rest}
      />
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    marginBottom: space.md,
  },
});
