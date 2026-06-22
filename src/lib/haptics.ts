import * as Haptics from "expo-haptics";

let hapticsEnabled = true;

export function setGlobalHapticsEnabled(enabled: boolean) {
  hapticsEnabled = enabled;
}

export async function triggerSelectionHaptic() {
  if (!hapticsEnabled) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    /* perangkat tanpa haptic */
  }
}

export async function triggerImpactHaptic(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
) {
  if (!hapticsEnabled) return;
  try {
    await Haptics.impactAsync(style);
  } catch {
    /* perangkat tanpa haptic */
  }
}

/** Bungkus handler onPress dengan haptic ringan. */
export function withHaptic<T extends (...args: never[]) => void>(
  fn?: T,
): T | undefined {
  if (!fn) return undefined;
  return ((...args: Parameters<T>) => {
    void triggerSelectionHaptic();
    fn(...args);
  }) as T;
}
