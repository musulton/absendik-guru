import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { HeaderIconButton } from "@/components/ui/HeaderIconButton";
import type { TranslationKey } from "@/lib/i18n/translations";
import { goBackFromNestedStack } from "@/navigation/navHelpers";

type BackMode = "stack" | "nested";

function headerBackButton(
  navigation: NavigationProp<ParamListBase>,
  t: (key: TranslationKey) => string,
  mode: BackMode,
) {
  return (
    <HeaderIconButton
      icon="back"
      onPress={() =>
        mode === "nested"
          ? goBackFromNestedStack(navigation)
          : navigation.goBack()
      }
      accessibilityLabel={t("common.back")}
    />
  );
}

/** Tombol kembali eksplisit — dipakai saat stack default tidak menampilkan back. */
export function withHeaderBackButton(
  options: NativeStackNavigationOptions,
  navigation: NavigationProp<ParamListBase>,
  t: (key: TranslationKey) => string,
  mode: BackMode = "stack",
): NativeStackNavigationOptions {
  return {
    ...options,
    headerBackVisible: false,
    headerLeft: () => headerBackButton(navigation, t, mode),
  };
}

/** screenOptions helper: root nested stack vs layar anak. */
export function stackScreenOptionsWithBack(
  base: NativeStackNavigationOptions,
  navigation: NavigationProp<ParamListBase>,
  t: (key: TranslationKey) => string,
  routeName: string,
  nestedRootRouteName: string,
): NativeStackNavigationOptions {
  return withHeaderBackButton(
    base,
    navigation,
    t,
    routeName === nestedRootRouteName ? "nested" : "stack",
  );
}
