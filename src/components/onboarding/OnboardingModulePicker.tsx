import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import type { WorkspaceModules } from "@/lib/workspace-modules-shared";
import { radius, space } from "@/lib/theme";

type ModuleKey = keyof WorkspaceModules;

const MODULE_ROWS: { key: ModuleKey; labelKey: "settings.moduleAttendance" | "settings.moduleGrades" | "settings.moduleTeachingJournal" | "settings.moduleStudentNotes"; icon: IconName }[] = [
  { key: "attendance", labelKey: "settings.moduleAttendance", icon: "attendance" },
  { key: "grades", labelKey: "settings.moduleGrades", icon: "grades" },
  { key: "teachingJournal", labelKey: "settings.moduleTeachingJournal", icon: "journal" },
  { key: "studentNotes", labelKey: "settings.moduleStudentNotes", icon: "studentNote" },
];

type Props = {
  modules: WorkspaceModules;
  onChange: (next: WorkspaceModules) => void;
};

export function OnboardingModulePicker({ modules, onChange }: Props) {
  const { colors, font, scale, t } = useTheme();

  function toggle(key: ModuleKey, next: boolean) {
    const enabledCount = Object.values(modules).filter(Boolean).length;
    if (!next && enabledCount <= 1 && modules[key]) {
      Alert.alert(t("settings.modulesMinOne"));
      return;
    }
    onChange({ ...modules, [key]: next });
  }

  return (
    <View style={styles.wrap}>
      {MODULE_ROWS.map((row, index) => (
        <View key={row.key}>
          {index > 0 ? (
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          ) : null}
          <View style={styles.row}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.primaryMuted },
              ]}
            >
              <Icon name={row.icon} size={14} color={colors.primary} />
            </View>
            <Text
              style={[
                font.body,
                styles.label,
                { color: colors.text, fontSize: scale(15), fontWeight: "600" },
              ]}
            >
              {t(row.labelKey)}
            </Text>
            <Switch
              value={modules[row.key]}
              onValueChange={(next) => toggle(row.key, next)}
              trackColor={{ false: colors.border, true: colors.primaryBorder }}
              thumbColor={modules[row.key] ? colors.primary : colors.textMuted}
            />
          </View>
        </View>
      ))}
      <Text style={[font.caption, styles.hint, { color: colors.textMuted }]}>
        {t("onboarding.modules.settingsHint")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: space.sm,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { flex: 1 },
  divider: { height: StyleSheet.hairlineWidth },
  hint: { marginTop: space.md, lineHeight: 18 },
});
