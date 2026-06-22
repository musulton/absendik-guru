import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenScroll } from "@/components/ScreenScroll";
import { ErrorBanner } from "@/components/ErrorBanner";
import { OkBanner } from "@/components/ui/OkBanner";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useTheme } from "@/context/AppPreferencesContext";
import { useWorkspaceGradePredikat } from "@/context/WorkspaceGradePredikatContext";
import {
  DEFAULT_GRADE_PREDIKAT,
  formatGradePredikatRange,
  GRADE_BAND_ORDER,
  type GradeBand,
  type GradePredikatBandConfig,
  type SchoolGradePredikatSettings,
} from "@/lib/grade-predikat";
import { RECAP_GRADE_COLORS } from "@/lib/grade-recap-display";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { radius, space } from "@/lib/theme";

function cloneSettings(
  settings: SchoolGradePredikatSettings,
): SchoolGradePredikatSettings {
  return {
    bands: settings.bands.map((band) => ({ ...band })),
  };
}

function bandTierLabel(
  band: GradeBand,
  t: (key: TranslationKey) => string,
): string {
  if (band === "sangat_baik") return t("gradePredikat.tierHighest");
  if (band === "kurang") return t("gradePredikat.tierLowest");
  return "—";
}

export function GradePredikatSettingsScreen() {
  const { colors, font, scale, t } = useTheme();
  const { settings, canEdit, saveSettings, resetSettings } =
    useWorkspaceGradePredikat();
  const [draft, setDraft] = useState(() => cloneSettings(settings));
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useTranslatedScreenTitle(t("gradePredikat.title"));

  useEffect(() => {
    setDraft(cloneSettings(settings));
  }, [settings]);

  const previewSettings = useMemo(() => ({ bands: draft.bands }), [draft]);

  const updateLabel = useCallback((id: GradeBand, label: string) => {
    setDraft((prev) => ({
      bands: prev.bands.map((band) =>
        band.id === id ? { ...band, label } : band,
      ),
    }));
  }, []);

  const updateMin = useCallback((id: GradeBand, value: string) => {
    const minScore = Number.parseInt(value, 10);
    setDraft((prev) => ({
      bands: prev.bands.map((band) =>
        band.id === id
          ? {
              ...band,
              minScore: Number.isFinite(minScore) ? minScore : band.minScore,
            }
          : band,
      ),
    }));
  }, []);

  async function handleSave() {
    setError("");
    setSuccess("");
    setSaving(true);
    const result = await saveSettings(draft);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(t("gradePredikat.saved"));
  }

  function confirmReset() {
    Alert.alert(t("gradePredikat.reset"), t("gradePredikat.resetConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("gradePredikat.reset"),
        style: "destructive",
        onPress: () => void runReset(),
      },
    ]);
  }

  async function runReset() {
    setError("");
    setSuccess("");
    setResetting(true);
    const result = await resetSettings();
    setResetting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft(cloneSettings(DEFAULT_GRADE_PREDIKAT));
    setSuccess(t("gradePredikat.saved"));
  }

  if (!canEdit) {
    return (
      <ScreenScroll contentContainerStyle={styles.scroll}>
        <Text style={[font.body, { color: colors.textMuted }]}>
          {t("gradePredikat.schoolReadOnly")}
        </Text>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll contentContainerStyle={styles.scroll}>
      <Text style={[font.caption, { color: colors.textMuted, lineHeight: scale(18) }]}>
        {t("gradePredikat.desc")}
      </Text>

      <SectionLabel dense title={t("gradePredikat.sectionBands")} />
      {GRADE_BAND_ORDER.map((id) => {
        const band = draft.bands.find((row) => row.id === id)!;
        const palette = RECAP_GRADE_COLORS[id];
        return (
          <BandEditor
            key={id}
            band={band}
            tierLabel={bandTierLabel(id, t)}
            palette={palette}
            onLabelChange={(label) => updateLabel(id, label)}
            onMinChange={(value) => updateMin(id, value)}
            preview={`${formatGradePredikatRange(id, previewSettings)} ${band.label}`}
          />
        );
      })}

      <Text style={[font.caption, { color: colors.textMuted, lineHeight: scale(16) }]}>
        {t("gradePredikat.hint")}
      </Text>

      <ErrorBanner message={error} />
      <OkBanner message={success} />

      <View style={styles.actions}>
        <PrimaryButton
          title={t("gradePredikat.save")}
          loading={saving}
          onPress={() => void handleSave()}
        />
        <PrimaryButton
          title={t("gradePredikat.reset")}
          variant="secondary"
          loading={resetting}
          onPress={confirmReset}
        />
      </View>
    </ScreenScroll>
  );
}

function BandEditor({
  band,
  tierLabel,
  palette,
  preview,
  onLabelChange,
  onMinChange,
}: {
  band: GradePredikatBandConfig;
  tierLabel: string;
  palette: { bg: string; text: string };
  preview: string;
  onLabelChange: (label: string) => void;
  onMinChange: (value: string) => void;
}) {
  const { colors, font, scale, t } = useTheme();

  return (
    <View
      style={[
        styles.bandCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.bandHeader}>
        <View
          style={[
            styles.tierBadge,
            { backgroundColor: palette.bg, borderColor: palette.text },
          ]}
        >
          <Text style={[font.caption, { color: palette.text, fontWeight: "700", fontSize: scale(10) }]}>
            {tierLabel}
          </Text>
        </View>
        <View
          style={[
            styles.previewBadge,
            { backgroundColor: palette.bg, borderColor: palette.text },
          ]}
        >
          <Text style={[font.caption, { color: palette.text, fontWeight: "700", fontSize: scale(11) }]}>
            {preview}
          </Text>
        </View>
      </View>

      <View style={styles.fieldRow}>
        <View style={styles.field}>
          <Text style={[font.caption, styles.fieldLabel, { color: colors.textMuted }]}>
            {t("gradePredikat.labelField")}
          </Text>
          <TextInput
            value={band.label}
            onChangeText={onLabelChange}
            maxLength={40}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: scale(14),
              },
            ]}
          />
        </View>
        <View style={styles.minField}>
          <Text style={[font.caption, styles.fieldLabel, { color: colors.textMuted }]}>
            {t("gradePredikat.minField")}
          </Text>
          {band.id === "kurang" ? (
            <Text style={[font.caption, { color: colors.textMuted, paddingVertical: 10 }]}>
              {t("gradePredikat.minAuto")}
            </Text>
          ) : (
            <TextInput
              value={String(band.minScore)}
              onChangeText={onMinChange}
              keyboardType="number-pad"
              maxLength={3}
              style={[
                styles.input,
                styles.minInput,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.bg,
                  color: colors.text,
                  fontSize: scale(14),
                },
              ]}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: space.sm,
    gap: space.sm,
    paddingBottom: space.lg,
  },
  bandCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.sm,
    gap: space.sm,
  },
  bandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  tierBadge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  previewBadge: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 1,
  },
  fieldRow: {
    flexDirection: "row",
    gap: space.sm,
  },
  field: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  minField: {
    width: 88,
    gap: 4,
  },
  fieldLabel: {
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    paddingVertical: 8,
    minHeight: 40,
  },
  minInput: {
    textAlign: "center",
  },
  actions: {
    gap: space.sm,
    marginTop: space.xs,
  },
});
