import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { DatePickerInline } from "@/components/ui/DatePickerInline";
import { CompactNavRow } from "@/components/ui/CompactNavRow";
import { IconBadge } from "@/components/ui/IconBadge";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius, space } from "@/lib/theme";

type Props = {
  className: string;
  subjectName?: string | null;
  isToday: boolean;
  dateLabel: string;
  todayPrefix: string;
  goTodayLabel: string;
  showDatePicker: boolean;
  pickerDate: Date;
  maxDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onTogglePicker: () => void;
  onGoToday: () => void;
  onDateChange: (event: DateTimePickerEvent, date?: Date) => void;
  compact?: boolean;
};

function AttendanceSessionHeaderInner({
  className,
  subjectName,
  isToday,
  dateLabel,
  todayPrefix,
  goTodayLabel,
  showDatePicker,
  pickerDate,
  maxDate,
  onPrev,
  onNext,
  onTogglePicker,
  onGoToday,
  onDateChange,
  compact,
}: Props) {
  const { colors, font, scale } = useTheme();
  const textStyles = useMemo(
    () => ({
      subjectName: { fontWeight: "700" as const, fontSize: scale(15), lineHeight: scale(20) },
      todayText: { fontWeight: "700" as const, fontSize: scale(12) },
      classLabel: { fontWeight: "600" as const, textTransform: "uppercase" as const, letterSpacing: 0.4 },
    }),
    [scale],
  );
  const dateText = isToday ? `${todayPrefix} · ${dateLabel}` : dateLabel;
  const contextLabel = subjectName ? `${className} · ${subjectName}` : className;

  if (compact) {
    return (
      <View
        style={[
          styles.cardCompactOuter,
          { backgroundColor: colors.surface, borderColor: colors.border },
          elevation(colors.cardShadow, "sm"),
        ]}
      >
        <View style={styles.compactMeta}>
          <Text
            style={[font.caption, textStyles.classLabel, { color: colors.textMuted, flex: 1 }]}
            numberOfLines={1}
          >
            {contextLabel}
          </Text>
          {isToday ? (
            <View
              style={[
                styles.todayBadgeCompact,
                { backgroundColor: colors.successBg, borderColor: colors.success },
              ]}
            >
              <Text style={[font.caption, textStyles.todayText, { color: colors.success }]}>
                {todayPrefix}
              </Text>
            </View>
          ) : (
            <Pressable
              style={[
                styles.todayPillCompact,
                { backgroundColor: colors.primaryMuted, borderColor: colors.primaryBorder },
              ]}
              onPress={withHaptic(onGoToday)}
            >
              <Text style={[font.caption, textStyles.todayText, { color: colors.primary }]}>
                {goTodayLabel}
              </Text>
            </Pressable>
          )}
        </View>
        <CompactNavRow
          mini
          dense
          label={dateText}
          onPrev={onPrev}
          onNext={onNext}
          onLabelPress={onTogglePicker}
          nextDisabled={isToday}
        />
        <DatePickerInline
          visible={showDatePicker}
          value={pickerDate}
          maximumDate={maxDate}
          onChange={onDateChange}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        compact && styles.cardCompact,
        { backgroundColor: colors.surface, borderColor: colors.border },
        elevation(colors.cardShadow, "md"),
      ]}
    >
      <View style={[styles.heroBand, { backgroundColor: colors.primaryMuted, borderBottomColor: colors.primaryBorder }]}>
        <View style={styles.heroRow}>
          <IconBadge
            icon={subjectName ? "subject" : "classes"}
            backgroundColor={colors.surface}
            color={colors.primary}
            size="sm"
          />
          <View style={styles.heroText}>
            <Text style={[font.caption, textStyles.classLabel, { color: colors.textMuted }]} numberOfLines={1}>
              {className}
            </Text>
            {subjectName ? (
              <Text
                style={[font.body, textStyles.subjectName, { color: colors.text }]}
                numberOfLines={1}
              >
                {subjectName}
              </Text>
            ) : (
              <Text style={[font.body, textStyles.subjectName, { color: colors.text }]} numberOfLines={1}>
                {className}
              </Text>
            )}
          </View>
          {isToday ? (
            <View
              style={[
                styles.todayBadge,
                {
                  backgroundColor: colors.successBg,
                  borderColor: colors.success,
                },
              ]}
            >
              <Icon name="check" size={12} color={colors.success} />
              <Text style={[font.caption, textStyles.todayText, { color: colors.success }]}>
                {todayPrefix}
              </Text>
            </View>
          ) : (
            <Pressable
              style={[
                styles.todayPill,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primaryBorder,
                },
              ]}
              onPress={withHaptic(onGoToday)}
            >
              <Icon name="calendar" size={14} color={colors.primary} />
              <Text style={[font.caption, textStyles.todayText, { color: colors.primary }]}>
                {goTodayLabel}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.dateSection}>
        <CompactNavRow
          label={dateText}
          onPrev={onPrev}
          onNext={onNext}
          onLabelPress={onTogglePicker}
          nextDisabled={isToday}
        />
      </View>

      <DatePickerInline
        visible={showDatePicker}
        value={pickerDate}
        maximumDate={maxDate}
        onChange={onDateChange}
      />
    </View>
  );
}

export const AttendanceSessionHeader = memo(AttendanceSessionHeaderInner);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: space.sm,
    overflow: "hidden",
  },
  cardCompact: {
    marginBottom: space.xs,
  },
  heroBand: {
    borderBottomWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  heroText: { flex: 1, minWidth: 0, gap: 2 },
  todayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexShrink: 0,
  },
  todayPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexShrink: 0,
  },
  dateSection: {
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    paddingBottom: space.xs,
  },
  cardCompactOuter: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: space.sm,
    paddingTop: space.xs,
    paddingBottom: space.xs,
    marginBottom: space.xs,
    overflow: "hidden",
  },
  compactMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  todayBadgeCompact: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
  todayPillCompact: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
});
