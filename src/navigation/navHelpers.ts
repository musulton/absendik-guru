import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { ManageStackParamList } from "@/navigation/types";

function getHomeStackNavigation(
  navigation: NavigationProp<ParamListBase>,
): NavigationProp<ParamListBase> {
  let current: NavigationProp<ParamListBase> | undefined = navigation;
  while (current) {
    const routeNames = current.getState?.().routeNames ?? [];
    if (routeNames.includes("HomeHub") && routeNames.includes("Settings")) {
      return current;
    }
    const parent = current.getParent();
    if (!parent) break;
    current = parent;
  }
  return navigation;
}

export function goBackFromNestedStack(
  navigation: NavigationProp<ParamListBase>,
): void {
  const home = getHomeStackNavigation(navigation);
  if (home.canGoBack()) {
    home.goBack();
    return;
  }
  if (navigation.canGoBack()) {
    navigation.goBack();
  }
}

export function goToManageTab<
  S extends keyof ManageStackParamList,
>(
  navigation: NavigationProp<ParamListBase>,
  screen: S,
  ...args: undefined extends ManageStackParamList[S]
    ? [params?: ManageStackParamList[S]]
    : [params: ManageStackParamList[S]]
) {
  const params = args[0];
  getHomeStackNavigation(navigation).navigate(
    "Manage",
    {
      screen,
      params,
    } as never,
  );
}

export function goToSettingsTab(navigation: NavigationProp<ParamListBase>) {
  getHomeStackNavigation(navigation).navigate("Settings", {
    screen: "Settings",
  });
}
