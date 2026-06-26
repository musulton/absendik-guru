import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { space } from "@/lib/theme";

type Props = {
  title: string;
  dense?: boolean;
  defaultExpanded?: boolean;
  children: ReactNode;
};

export function CollapsibleSection({
  title,
  dense,
  defaultExpanded = true,
  children,
}: Props) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={withHaptic(() => setExpanded((open) => !open))}
        style={({ pressed }) => [pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <SectionLabel
          dense={dense}
          title={title}
          action={
            <Icon
              name={expanded ? "chevronUp" : "chevronDown"}
              size={18}
              color={colors.textMuted}
            />
          }
        />
      </Pressable>
      {expanded ? children : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.xs },
  pressed: { opacity: 0.88 },
});
