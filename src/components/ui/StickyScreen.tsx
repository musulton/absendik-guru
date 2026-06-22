import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";

type Props = {
  children: ReactNode;
  /** Opsional — jika kosong, hanya konten scroll. */
  footer?: ReactNode | null;
  /** Angkat konten saat keyboard terbuka (form input). */
  keyboardAvoiding?: boolean;
};

/** Konten scroll di atas, footer aksi menempel di bawah. */
export function StickyScreen({ children, footer, keyboardAvoiding }: Props) {
  const headerHeight = useHeaderHeight();

  const content = (
    <View style={styles.root}>
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footerSlot}>{footer}</View> : null}
    </View>
  );

  if (!keyboardAvoiding) return content;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, minHeight: 0 },
  footerSlot: { flexShrink: 0 },
});
