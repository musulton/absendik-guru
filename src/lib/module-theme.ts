import type { IconName } from "@/components/ui/Icon";
import type { ThemeColors } from "@/lib/theme-palettes";
import type { HomeModule } from "@/navigation/types";

export type ModuleTheme = {
  icon: IconName;
  accent: string;
  tint: string;
  border: string;
};

const MODULE_ICONS: Record<HomeModule, IconName> = {
  attendance: "attendance",
  teachingJournal: "journal",
  grades: "grades",
  studentNotes: "studentNote",
};

export function getModuleTheme(
  module: HomeModule,
  colors: ThemeColors,
  _isDark: boolean,
): ModuleTheme {
  return {
    icon: MODULE_ICONS[module],
    accent: colors.primary,
    tint: colors.primaryMuted,
    border: colors.primaryBorder,
  };
}
