import type { ReactNode } from "react";
import { View } from "react-native";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FormHint } from "@/components/ui/FormHint";

type Props = {
  hint?: string;
  error?: string;
  children: ReactNode;
};

/** Urutan standar form: petunjuk → error → field. */
export function FormFieldBlock({ hint, error, children }: Props) {
  return (
    <View>
      {hint ? <FormHint>{hint}</FormHint> : null}
      <ErrorBanner message={error ?? ""} />
      {children}
    </View>
  );
}
