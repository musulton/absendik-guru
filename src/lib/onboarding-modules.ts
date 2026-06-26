import AsyncStorage from "@react-native-async-storage/async-storage";
import { localSetWorkspaceModules } from "@/lib/local-store-modules";
import {
  DEFAULT_WORKSPACE_MODULES,
  normalizeWorkspaceModules,
  type WorkspaceModules,
} from "@/lib/workspace-modules-shared";

function prefsKey(userId: string): string {
  return `guru_onboarding_modules_${userId}`;
}

export async function getOnboardingModulePrefs(
  userId: string,
): Promise<WorkspaceModules | null> {
  const raw = await AsyncStorage.getItem(prefsKey(userId));
  if (!raw) return null;
  try {
    return normalizeWorkspaceModules(JSON.parse(raw) as Partial<WorkspaceModules>);
  } catch {
    return null;
  }
}

export async function setOnboardingModulePrefs(
  userId: string,
  modules: WorkspaceModules,
): Promise<void> {
  const normalized = normalizeWorkspaceModules(modules);
  await AsyncStorage.setItem(prefsKey(userId), JSON.stringify(normalized));
}

export async function clearOnboardingModulePrefs(
  userId: string,
): Promise<void> {
  await AsyncStorage.removeItem(prefsKey(userId));
}

/** Terapkan pilihan fitur dari onboarding ke workspace, lalu hapus prefs. */
export async function applyOnboardingModulePrefsToWorkspace(
  workspaceId: string,
  userId: string,
): Promise<boolean> {
  const prefs = await getOnboardingModulePrefs(userId);
  if (!prefs) return false;
  await localSetWorkspaceModules(workspaceId, prefs);
  await clearOnboardingModulePrefs(userId);
  return true;
}

export { DEFAULT_WORKSPACE_MODULES };
