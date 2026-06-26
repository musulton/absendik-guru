import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AccentCard } from "@/components/ui/AccentCard";
import { useTheme } from "@/context/AppPreferencesContext";
import { formatDateId } from "@/lib/dates";
import { getModuleTheme } from "@/lib/module-theme";
import { radius, space } from "@/lib/theme";
import type { GuruTeachingJournalEntry } from "@/lib/types";

type Props = {
  entry: GuruTeachingJournalEntry;
  showSubject?: boolean;
};

function JournalRecapEntryRowInner({ entry, showSubject }: Props) {
  const { colors, font, scale, isDark, t } = useTheme();
  const theme = getModuleTheme("teachingJournal", colors, isDark);
  const textStyles = useMemo(
    () => ({
      date: { fontWeight: "700" as const, fontSize: scale(13) },
      subject: { fontSize: scale(12) },
      fieldLabel: { fontWeight: "700" as const, fontSize: scale(11) },
      fieldValue: { fontSize: scale(12), lineHeight: scale(17) },
    }),
    [scale],
  );

  const fields = [
    { label: t("teachingJournal.material"), value: entry.material?.trim() },
    { label: t("teachingJournal.method"), value: entry.method?.trim() },
    { label: t("teachingJournal.notes"), value: entry.notes?.trim() },
  ].filter((field) => field.value);

  return (
    <AccentCard
      accentColor={theme.accent}
      tintColor={theme.tint}
      style={styles.outer}
      contentStyle={styles.body}
    >
      <View style={styles.top}>
        <Text style={[font.caption, textStyles.date, { color: colors.text }]}>
          {formatDateId(entry.sessionDate)}
        </Text>
        {showSubject && entry.subjectName ? (
          <Text
            style={[
              font.caption,
              textStyles.subject,
              { color: colors.textMuted, flex: 1 },
            ]}
            numberOfLines={1}
          >
            {entry.subjectName}
          </Text>
        ) : null}
      </View>
      {fields.map((field) => (
        <View key={field.label} style={styles.field}>
          <Text
            style={[
              font.caption,
              textStyles.fieldLabel,
              { color: colors.textMuted },
            ]}
          >
            {field.label}
          </Text>
          <Text
            style={[font.body, textStyles.fieldValue, { color: colors.text }]}
          >
            {field.value}
          </Text>
        </View>
      ))}
    </AccentCard>
  );
}

export const JournalRecapEntryRow = memo(JournalRecapEntryRowInner);

const styles = StyleSheet.create({
  outer: { marginBottom: space.sm },
  body: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    gap: space.sm,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    flexWrap: "wrap",
  },
  field: { gap: 2 },
});
