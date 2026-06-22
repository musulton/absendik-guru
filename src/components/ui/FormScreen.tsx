import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StickyActionBar } from "@/components/ui/StickyActionBar";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useTheme } from "@/context/AppPreferencesContext";
import { screen, space } from "@/lib/theme";

type Props = {
  children: ReactNode;
  /** Tombol aksi tetap di bawah layar (tidak ikut scroll). */
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function FormScreen({ children, footer, contentContainerStyle }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const scrollContentStyle = [
    { padding: screen.contentPadding, paddingBottom: 32 },
    footer ? { paddingBottom: space.md } : { paddingBottom: insets.bottom + 24 },
    contentContainerStyle,
  ];
  const flexStyle = { flex: 1, backgroundColor: colors.bg };

  if (!footer) {
    return (
      <KeyboardAvoidingView
        style={flexStyle}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={flexStyle}
          contentContainerStyle={scrollContentStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={flexStyle}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StickyScreen footer={<StickyActionBar>{footer}</StickyActionBar>}>
        <ScrollView
          style={flexStyle}
          contentContainerStyle={scrollContentStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {children}
        </ScrollView>
      </StickyScreen>
    </KeyboardAvoidingView>
  );
}
