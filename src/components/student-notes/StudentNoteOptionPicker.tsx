import { Pressable, StyleSheet, Text, View } from "react-native";
import { FormField } from "@/components/ui/FormField";
import { Icon } from "@/components/ui/Icon";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import type { TranslationKey } from "@/lib/i18n/translations";
import {
  groupTranslationKey,
  presetTranslationKey,
  STUDENT_NOTE_PRESET_GROUPS,
  type GuruStudentNotePresetKey,
} from "@/lib/student-note-presets";
import { radius, space } from "@/lib/theme";

type Props = {
  selectedPresets: ReadonlySet<GuruStudentNotePresetKey>;
  otherText: string;
  otherSelected: boolean;
  onTogglePreset: (preset: GuruStudentNotePresetKey) => void;
  onToggleOther: () => void;
  onOtherTextChange: (text: string) => void;
  t: (key: TranslationKey) => string;
};

function Checkbox({
  checked,
  onPress,
  label,
}: {
  checked: boolean;
  onPress: () => void;
  label: string;
}) {
  const { colors, font } = useTheme();

  return (
    <Pressable
      onPress={withHaptic(onPress)}
      style={[
        styles.option,
        {
          backgroundColor: checked ? colors.primaryMuted : colors.surface,
          borderColor: checked ? colors.primary : colors.border,
        },
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? colors.primary : colors.border,
            backgroundColor: checked ? colors.primary : colors.surface,
          },
        ]}
      >
        {checked ? <Icon name="check" size={14} color="#fff" /> : null}
      </View>
      <Text style={[font.body, styles.optionLabel, { color: colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StudentNoteOptionPicker({
  selectedPresets,
  otherText,
  otherSelected,
  onTogglePreset,
  onToggleOther,
  onOtherTextChange,
  t,
}: Props) {
  return (
    <View style={styles.wrap}>
      {STUDENT_NOTE_PRESET_GROUPS.map((group) => (
        <View key={group.category} style={styles.group}>
          <SectionLabel title={t(groupTranslationKey(group.category))} />
          <View style={styles.options}>
            {group.presets.map((preset) => (
              <Checkbox
                key={preset}
                checked={selectedPresets.has(preset)}
                onPress={() => onTogglePreset(preset)}
                label={t(presetTranslationKey(preset))}
              />
            ))}
          </View>
        </View>
      ))}

      <View style={styles.group}>
        <SectionLabel title={t("studentNotes.group.other")} />
        <Checkbox
          checked={otherSelected}
          onPress={onToggleOther}
          label={t("studentNotes.otherOption")}
        />
        {otherSelected ? (
          <FormField
            label={t("studentNotes.otherLabel")}
            value={otherText}
            onChangeText={onOtherTextChange}
            placeholder={t("studentNotes.otherPlaceholder")}
            multiline
            style={styles.otherInput}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  group: { gap: space.sm },
  options: { gap: space.sm },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: { flex: 1, lineHeight: 22 },
  otherInput: { minHeight: 96, textAlignVertical: "top" },
});
