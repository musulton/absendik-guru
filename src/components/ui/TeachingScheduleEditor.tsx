import { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import {
  ISO_WEEKDAYS,
  dateToTimeHm,
  formatSlotSummary,
  isoWeekdayLabel,
  timeHmToDate,
  toggleTeachingSlotDay,
} from "@/lib/teaching-schedule";
import type { TeachingSlotDraft } from "@/lib/types";
import { elevation, radius, space } from "@/lib/theme";

type Props = {
  value: TeachingSlotDraft[];
  onChange: (slots: TeachingSlotDraft[]) => void;
};

function newSlot(): TeachingSlotDraft {
  return { daysOfWeek: [1], startTime: "07:00", endTime: null };
}

function slotTimeValue(
  slot: TeachingSlotDraft | undefined,
  field: "start" | "end",
): string {
  if (field === "start") return slot?.startTime ?? "07:00";
  return slot?.endTime?.trim() || slot?.startTime || "07:00";
}

export function TeachingScheduleEditor({ value, onChange }: Props) {
  const { colors, font, scale, t, locale, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const dayChipTextStyle = useMemo(
    () => ({ fontSize: scale(11), fontWeight: "700" as const }),
    [scale],
  );
  const sheetTitleStyle = useMemo(
    () => ({ flex: 1, fontSize: scale(16) }),
    [scale],
  );
  const [timePickerIndex, setTimePickerIndex] = useState<number | null>(null);
  const [timePickerField, setTimePickerField] = useState<"start" | "end">("start");
  const [draftTime, setDraftTime] = useState(() => timeHmToDate("07:00"));

  function updateSlot(index: number, patch: Partial<TeachingSlotDraft>) {
    onChange(value.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  }

  function removeSlot(index: number) {
    onChange(value.filter((_, i) => i !== index));
    if (timePickerIndex === index) setTimePickerIndex(null);
  }

  function toggleDay(index: number, day: number) {
    const slot = value[index];
    if (!slot) return;
    const nextDays = toggleTeachingSlotDay(slot.daysOfWeek, day);
    if (!nextDays) return;
    updateSlot(index, { daysOfWeek: nextDays });
  }

  function addSlot() {
    onChange([...value, newSlot()]);
  }

  function closeTimePicker() {
    setTimePickerIndex(null);
  }

  function openTimePicker(index: number, field: "start" | "end") {
    setDraftTime(timeHmToDate(slotTimeValue(value[index], field)));
    setTimePickerIndex(index);
    setTimePickerField(field);
  }

  function confirmTimePicker() {
    if (timePickerIndex === null) return;
    const hm = dateToTimeHm(draftTime);
    if (timePickerField === "start") {
      updateSlot(timePickerIndex, { startTime: hm });
    } else {
      updateSlot(timePickerIndex, { endTime: hm });
    }
    closeTimePicker();
  }

  function applyPickedTime(index: number, field: "start" | "end", date: Date) {
    const hm = dateToTimeHm(date);
    if (field === "start") {
      updateSlot(index, { startTime: hm });
    } else {
      updateSlot(index, { endTime: hm });
    }
  }

  function handleAndroidTimeValue(date: Date) {
    const index = timePickerIndex;
    const field = timePickerField;
    setTimePickerIndex(null);
    if (index === null) return;
    applyPickedTime(index, field, date);
  }

  function handleAndroidTimeDismiss() {
    setTimePickerIndex(null);
  }

  const pickerOpen = timePickerIndex !== null;
  const pickerLabel =
    timePickerField === "start" ? t("schedule.start") : t("schedule.end");

  return (
    <View style={styles.wrap}>
      <Text style={[font.caption, { fontWeight: "600" }]}>
        {t("schedule.title")}
      </Text>
      <Text style={font.caption}>{t("schedule.hint")}</Text>

      {value.length === 0 ? (
        <Text style={[font.caption, { color: colors.textMuted }]}>
          {t("schedule.empty")}
        </Text>
      ) : null}

      {value.map((slot, index) => (
        <View
          key={slot.id ?? `slot-${index}`}
          style={[
            styles.slotCard,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
        >
          <View style={styles.slotHeader}>
            <Text style={[font.caption, { fontWeight: "600" }]}>
              {formatSlotSummary(
                slot.daysOfWeek,
                slot.startTime,
                slot.endTime,
                locale,
              )}
            </Text>
            <Pressable onPress={withHaptic(() => removeSlot(index))}>
              <Text style={[font.caption, { color: colors.danger }]}>
                {t("schedule.remove")}
              </Text>
            </Pressable>
          </View>

          <View style={styles.dayRow}>
            {ISO_WEEKDAYS.map((day) => {
              const active = slot.daysOfWeek.includes(day);
              return (
                <Pressable
                  key={day}
                  style={[
                    styles.dayChip,
                    active
                      ? {
                          backgroundColor: colors.primaryMuted,
                          borderColor: colors.primaryBorder,
                        }
                      : {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                  ]}
                  onPress={withHaptic(() => toggleDay(index, day))}
                >
                  <Text
                    style={[
                      dayChipTextStyle,
                      { color: active ? colors.primary : colors.textMuted },
                    ]}
                  >
                    {isoWeekdayLabel(day, locale)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.timeRow}>
            <Pressable
              style={[
                styles.timeBtn,
                {
                  borderColor:
                    pickerOpen && timePickerIndex === index && timePickerField === "start"
                      ? colors.primaryBorder
                      : colors.border,
                  backgroundColor:
                    pickerOpen && timePickerIndex === index && timePickerField === "start"
                      ? colors.primaryMuted
                      : "transparent",
                },
              ]}
              onPress={withHaptic(() => openTimePicker(index, "start"))}
            >
              <Text style={font.caption}>{t("schedule.start")}</Text>
              <Text style={[font.body, { fontWeight: "600" }]}>{slot.startTime}</Text>
            </Pressable>
            <Pressable
              style={[
                styles.timeBtn,
                {
                  borderColor:
                    pickerOpen && timePickerIndex === index && timePickerField === "end"
                      ? colors.primaryBorder
                      : colors.border,
                  backgroundColor:
                    pickerOpen && timePickerIndex === index && timePickerField === "end"
                      ? colors.primaryMuted
                      : "transparent",
                },
              ]}
              onPress={withHaptic(() => openTimePicker(index, "end"))}
            >
              <Text style={font.caption}>{t("schedule.end")}</Text>
              <Text style={[font.body, { fontWeight: "600" }]}>
                {slot.endTime?.trim() || "—"}
              </Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable
        style={[styles.addBtn, { borderColor: colors.primaryBorder }]}
        onPress={withHaptic(addSlot)}
      >
        <Text style={[font.caption, { color: colors.primary, fontWeight: "600" }]}>
          + {t("schedule.add")}
        </Text>
      </Pressable>

      {Platform.OS === "android" && pickerOpen ? (
        <DateTimePicker
          value={draftTime}
          mode="time"
          is24Hour
          onValueChange={(_, date) => handleAndroidTimeValue(date)}
          onDismiss={handleAndroidTimeDismiss}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal
          visible={pickerOpen}
          transparent
          animationType="fade"
          onRequestClose={closeTimePicker}
        >
          <View style={styles.overlay}>
            <Pressable
              style={[
                styles.backdrop,
                {
                  backgroundColor: isDark
                    ? "rgba(0,0,0,0.62)"
                    : "rgba(15,23,42,0.38)",
                },
              ]}
              onPress={withHaptic(closeTimePicker)}
              accessibilityRole="button"
              accessibilityLabel={t("common.cancel")}
            />
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  paddingBottom: Math.max(insets.bottom, space.md),
                },
                elevation(colors.cardShadow, "lg"),
              ]}
            >
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
                <Text
                  style={[font.title, sheetTitleStyle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {t("schedule.pickTime")} · {pickerLabel}
                </Text>
                <Pressable
                  onPress={withHaptic(closeTimePicker)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t("common.cancel")}
                >
                  <Text style={[font.caption, { color: colors.textMuted }]}>
                    {t("common.cancel")}
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={draftTime}
                mode="time"
                display="spinner"
                themeVariant={isDark ? "dark" : "light"}
                style={styles.picker}
                onValueChange={(_, date) => setDraftTime(date)}
              />
              <Pressable
                style={[
                  styles.doneBtn,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.primaryBorder,
                  },
                ]}
                onPress={withHaptic(confirmTimePicker)}
              >
                <Text style={[font.body, { color: "#fff", fontWeight: "700" }]}>
                  {t("common.done")}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm, marginBottom: space.md },
  slotCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.sm,
    gap: space.sm,
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dayChip: {
    minWidth: 36,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  timeRow: { flexDirection: "row", gap: space.sm },
  timeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: space.sm,
    gap: 2,
  },
  addBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: radius.sm,
    borderStyle: "dashed",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: space.xs,
    paddingHorizontal: space.md,
    gap: space.sm,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: space.xs,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    paddingBottom: space.sm,
    borderBottomWidth: 1,
  },
  picker: {
    height: 180,
    width: "100%",
  },
  doneBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 12,
    marginTop: space.xs,
  },
});
