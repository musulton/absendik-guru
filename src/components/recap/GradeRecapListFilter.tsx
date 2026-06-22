import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { FilterPicker } from "@/components/ui/FilterPicker";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import type { TranslationKey } from "@/lib/i18n/translations";
import {
  GRADE_BAND_ORDER,
  getGradeBandLabel,
  type GradeListFilter,
  type GradeListPredikatFilter,
  type SchoolGradePredikatSettings,
} from "@/lib/grade-recap-display";
import { radius, space } from "@/lib/theme";

type Props = {
  settings: SchoolGradePredikatSettings;
  value: GradeListFilter;
  onChange: (next: GradeListFilter) => void;
  resultCount: number;
  totalCount: number;
  /** Satu baris: pencarian + filter predikat. */
  inline?: boolean;
  /** Bisa dibuka/tutup — default collapsed. */
  collapsible?: boolean;
};

function predikatOptions(
  settings: SchoolGradePredikatSettings,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
) {
  return [
    { key: "all", label: t("grades.listFilterAll") },
    { key: "any_kurang", label: t("grades.listFilterRemedial") },
    ...GRADE_BAND_ORDER.map((band) => ({
      key: band,
      label: t("grades.listFilterAverageBand", {
        band: getGradeBandLabel(band, settings),
      }),
    })),
  ];
}

function predikatLabel(
  predikat: GradeListPredikatFilter,
  settings: SchoolGradePredikatSettings,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
): string {
  if (predikat === "all") return t("grades.listFilterAll");
  if (predikat === "any_kurang") return t("grades.listFilterRemedial");
  return t("grades.listFilterAverageBand", {
    band: getGradeBandLabel(predikat, settings),
  });
}

function FilterFields({
  settings,
  value,
  onChange,
  resultCount,
  totalCount,
  inline,
}: Omit<Props, "collapsible">) {
  const { colors, font, scale, t } = useTheme();
  const predikat = value.predikat ?? "all";
  const options = predikatOptions(settings, t);

  if (inline) {
    return (
      <View style={styles.inlineWrap}>
        <View style={styles.inlineRow}>
          <TextInput
            value={value.query ?? ""}
            onChangeText={(query) => onChange({ ...value, query })}
            placeholder={t("grades.listSearchPlaceholder")}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            style={[
              styles.searchInline,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.text,
                fontSize: font.body.fontSize,
              },
            ]}
          />
          <FilterPicker
            inline
            inlineMinimal
            dense
            label={t("grades.listPredikatLabel")}
            modalTitle={t("grades.listPredikatChoose")}
            options={options}
            value={predikat}
            onChange={(key) =>
              onChange({ ...value, predikat: key as GradeListPredikatFilter })
            }
          />
        </View>
        <Text style={{ fontSize: scale(11), color: colors.textMuted }}>
          {t("grades.listShowingCount", {
            shown: resultCount,
            total: totalCount,
          })}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <TextInput
        value={value.query ?? ""}
        onChangeText={(query) => onChange({ ...value, query })}
        placeholder={t("grades.listSearchPlaceholder")}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={[
          styles.search,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
            fontSize: font.body.fontSize,
          },
        ]}
      />
      <FilterPicker
        inline
        label={t("grades.listPredikatLabel")}
        modalTitle={t("grades.listPredikatChoose")}
        options={options}
        value={predikat}
        onChange={(key) =>
          onChange({ ...value, predikat: key as GradeListPredikatFilter })
        }
      />
      <Text style={{ fontSize: scale(12), color: colors.textMuted }}>
        {t("grades.listShowingCount", {
          shown: resultCount,
          total: totalCount,
        })}
      </Text>
    </View>
  );
}

export function GradeRecapListFilter({
  settings,
  value,
  onChange,
  resultCount,
  totalCount,
  inline,
  collapsible = false,
}: Props) {
  const { colors, font, scale, t } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const predikat = value.predikat ?? "all";
  const query = value.query?.trim() ?? "";

  const hasActiveFilter = predikat !== "all" || query.length > 0;

  const collapsedLabel = useMemo(() => {
    const parts: string[] = [];
    if (query) parts.push(`"${query}"`);
    if (predikat !== "all") parts.push(predikatLabel(predikat, settings, t));
    if (parts.length === 0) return t("grades.listFilterToggle");
    return parts.join(" · ");
  }, [query, predikat, settings, t]);

  if (!collapsible) {
    return (
      <FilterFields
        settings={settings}
        value={value}
        onChange={onChange}
        resultCount={resultCount}
        totalCount={totalCount}
        inline={inline}
      />
    );
  }

  return (
    <View style={styles.collapsibleWrap}>
      <Pressable
        onPress={withHaptic(() => setExpanded((open) => !open))}
        style={({ pressed }) => [
          styles.toggleRow,
          {
            borderColor: colors.border,
            backgroundColor: hasActiveFilter ? colors.primaryMuted : colors.surface,
          },
          pressed && styles.togglePressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Icon
          name="search"
          size={15}
          color={hasActiveFilter ? colors.primary : colors.textMuted}
        />
        <Text
          style={[
            font.caption,
            styles.toggleLabel,
            {
              color: hasActiveFilter ? colors.primary : colors.text,
              fontSize: scale(12),
            },
          ]}
          numberOfLines={1}
        >
          {collapsedLabel}
        </Text>
        {!expanded && hasActiveFilter ? (
          <Text
            style={[
              font.caption,
              styles.toggleMeta,
              { color: colors.textMuted, fontSize: scale(10) },
            ]}
            numberOfLines={1}
          >
            {t("grades.listShowingCount", {
              shown: resultCount,
              total: totalCount,
            })}
          </Text>
        ) : null}
        <Icon
          name={expanded ? "chevronUp" : "chevronDown"}
          size={16}
          color={colors.textMuted}
        />
      </Pressable>
      {expanded ? (
        <FilterFields
          settings={settings}
          value={value}
          onChange={onChange}
          resultCount={resultCount}
          totalCount={totalCount}
          inline={inline}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  inlineWrap: { gap: 4 },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  search: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  searchInline: {
    flex: 1,
    minWidth: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    paddingVertical: 8,
  },
  collapsibleWrap: {
    gap: space.xs,
    marginBottom: space.sm,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    paddingVertical: 8,
  },
  togglePressed: { opacity: 0.92 },
  toggleLabel: {
    flex: 1,
    minWidth: 0,
    fontWeight: "600",
  },
  toggleMeta: {
    flexShrink: 0,
    fontWeight: "600",
  },
});
