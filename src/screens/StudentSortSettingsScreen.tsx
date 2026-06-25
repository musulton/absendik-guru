import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenScroll } from "@/components/ScreenScroll";
import { OkBanner } from "@/components/ui/OkBanner";
import { ScreenHint } from "@/components/ui/ScreenHint";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SegmentedChoice } from "@/components/ui/SegmentedChoice";
import { useTheme } from "@/context/AppPreferencesContext";
import { useWorkspaceStudentSort } from "@/context/WorkspaceStudentSortContext";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import type { StudentSortMode } from "@/lib/student-sort";
import { space } from "@/lib/theme";

export function StudentSortSettingsScreen() {
  const { colors, font, t } = useTheme();
  const { sortMode, updateSortMode } = useWorkspaceStudentSort();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useTranslatedScreenTitle(t("studentSort.title"));

  const handleChange = useCallback(
    async (next: string) => {
      const mode = next as StudentSortMode;
      if (mode !== "name" && mode !== "nis") return;
      if (mode === sortMode) return;

      setSaving(true);
      setMessage("");
      try {
        await updateSortMode(mode);
        setMessage(t("studentSort.saved"));
      } finally {
        setSaving(false);
      }
    },
    [sortMode, updateSortMode, t],
  );

  return (
    <ScreenScroll>
      <ScreenHint>{t("studentSort.desc")}</ScreenHint>
      <SectionLabel title={t("studentSort.section")} dense />
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <SegmentedChoice
          value={sortMode}
          options={[
            { key: "name", label: t("studentSort.byName") },
            { key: "nis", label: t("studentSort.byNis") },
          ]}
          onChange={(next) => void handleChange(next)}
        />
        <Text style={[font.caption, { color: colors.textMuted, lineHeight: 18 }]}>
          {saving ? t("common.loading") : t("studentSort.hint")}
        </Text>
      </View>
      {message ? <OkBanner message={message} /> : null}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: space.md,
    gap: space.sm,
  },
});
