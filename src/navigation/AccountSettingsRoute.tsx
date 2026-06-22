import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { PLACEHOLDER_WORKSPACE } from "@/lib/placeholder-workspace";
import type { GuruAccount } from "@/lib/types";
import { SettingsScreen } from "@/screens/SettingsScreen";
import type { RootStackParamList } from "@/navigation/types";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AccountSettings">;
  account: GuruAccount;
  userId: string;
  onSwitchWorkspace: () => void;
  onSignOut: () => void;
  refreshApp: () => void;
};

export function AccountSettingsRoute({
  navigation,
  account,
  userId,
  onSwitchWorkspace,
  onSignOut,
  refreshApp,
}: Props) {
  return (
    <WorkspaceProvider
      value={{
        workspace: PLACEHOLDER_WORKSPACE,
        isSchoolWorkspace: false,
        isLocalArchiveWorkspace: false,
        account,
        userId,
        onSwitchWorkspace,
        onSignOut,
        refreshApp,
      }}
    >
      <SettingsScreen
        account={account}
        userId={userId}
        onAbout={() => navigation.navigate("About")}
        onReplayOnboarding={() =>
          navigation.navigate("Onboarding", { replay: true })
        }
        onSwitchSchool={onSwitchWorkspace}
        onSubscriptionChanged={refreshApp}
        onSignOut={onSignOut}
        onLocalDataWiped={onSwitchWorkspace}
      />
    </WorkspaceProvider>
  );
}
