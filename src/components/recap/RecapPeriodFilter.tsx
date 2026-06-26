import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { CompactNavRow } from "@/components/ui/CompactNavRow";
import { DatePickerInline } from "@/components/ui/DatePickerInline";
import { FilterPicker, type FilterOption } from "@/components/ui/FilterPicker";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { dateToIso, isoToDate } from "@/lib/dates";
import { withHaptic } from "@/lib/haptics";
import { buildRecapMonthOptions } from "@/lib/recap-period-options";
import { elevation, radius, space } from "@/lib/theme";

export type RecapPeriodKind = "weekly" | "monthly" | "semester";

type Props = {
  periodKind: RecapPeriodKind;
  onPeriodKindChange: (kind: RecapPeriodKind) => void;
  periodOptions: FilterOption[];
  navLabel: string;
  onPrev: () => void;
  onNext: () => void;
  subjectFilter?: ReactNode;
  weekDate?: string;
  onWeekDateChange?: (iso: string) => void;
  month?: string;
  onMonthChange?: (yyyymm: string) => void;
  maxDate?: string;
};

export function RecapPeriodFilter({
  periodKind,
  onPeriodKindChange,
  periodOptions,
  navLabel,
  onPrev,
  onNext,
  subjectFilter,
  weekDate,
  onWeekDateChange,
  month,
  onMonthChange,
  maxDate,
}: Props) {
  const { colors, font, scale, t } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [monthModalOpen, setMonthModalOpen] = useState(false);

  const monthOptions = useMemo(
    () => (month ? buildRecapMonthOptions(month) : []),
    [month],
  );

  const canPickWeek = periodKind === "weekly" && weekDate && onWeekDateChange;
  const canPickMonth = periodKind === "monthly" && month && onMonthChange;

  useEffect(() => {
    setShowWeekPicker(false);
    setMonthModalOpen(false);
  }, [periodKind]);

  function handleNavLabelPress() {
    if (canPickWeek) {
      setShowWeekPicker((open) => !open);
      return;
    }
    if (canPickMonth) {
      setMonthModalOpen(true);
    }
  }

  function handleWeekDateChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === "android") {
      setShowWeekPicker(false);
      if (event.type === "dismissed" || !date) return;
      onWeekDateChange?.(dateToIso(date));
      return;
    }
    if (event.type === "dismissed" || !date) {
      setShowWeekPicker(false);
      return;
    }
    onWeekDateChange?.(dateToIso(date));
    setShowWeekPicker(false);
  }

  const sheetMaxHeight = Math.min(windowHeight * 0.72, 420);

  return (
    <>
      <View
        style={[
          styles.wrap,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          elevation(colors.cardShadow, "sm"),
        ]}
      >
        <View style={styles.periodKindRow}>
          <FilterPicker
            inline
            dense
            label={t("recap.periodLabel")}
            modalTitle={t("recap.choosePeriod")}
            options={periodOptions}
            value={periodKind}
            onChange={(key) => onPeriodKindChange(key as RecapPeriodKind)}
          />
        </View>

        <CompactNavRow
          dense
          label={navLabel}
          onPrev={onPrev}
          onNext={onNext}
          onLabelPress={
            canPickWeek || canPickMonth ? handleNavLabelPress : undefined
          }
          pickHint={
            canPickWeek
              ? t("recap.chooseWeek")
              : canPickMonth
                ? t("recap.chooseMonth")
                : undefined
          }
        />

        {canPickWeek && showWeekPicker ? (
          <View style={[styles.pickerBox, { borderColor: colors.border, backgroundColor: colors.bg }]}>
            <Text style={[font.caption, { color: colors.textMuted, marginBottom: space.xs }]}>
              {t("recap.weekPickerHint")}
            </Text>
            <DatePickerInline
              visible
              value={isoToDate(weekDate!)}
              maximumDate={maxDate ? isoToDate(maxDate) : undefined}
              onChange={handleWeekDateChange}
            />
          </View>
        ) : null}

        {subjectFilter ? <View style={styles.subjectRow}>{subjectFilter}</View> : null}
      </View>

      <BottomSheetModal
        visible={monthModalOpen}
        onClose={() => setMonthModalOpen(false)}
      >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                maxHeight: sheetMaxHeight,
                paddingBottom: Math.max(insets.bottom, space.md),
              },
              elevation(colors.cardShadow, "lg"),
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
              <Text style={[font.title, { flex: 1, fontSize: scale(16), color: colors.text }]}>
                {t("recap.chooseMonth")}
              </Text>
              <Pressable
                onPress={withHaptic(() => setMonthModalOpen(false))}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: colors.bg },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Icon name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            <FlatList
              data={monthOptions}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
              )}
              renderItem={({ item }) => {
                const active = item.key === month;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.optionRow,
                      active && { backgroundColor: colors.primaryMuted },
                      pressed && !active && { backgroundColor: colors.bg },
                    ]}
                    onPress={withHaptic(() => {
                      onMonthChange?.(item.key);
                      setMonthModalOpen(false);
                    })}
                  >
                    <Text
                      style={[
                        font.body,
                        { flex: 1, color: colors.text, fontWeight: active ? "700" : "500" },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {active ? (
                      <Icon name="check" size={16} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </View>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.sm,
  },
  periodKindRow: {
    alignSelf: "stretch",
  },
  pickerBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: space.sm,
  },
  subjectRow: {
    minWidth: 0,
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    marginTop: space.sm,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: space.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: space.md,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: 14,
  },
});
