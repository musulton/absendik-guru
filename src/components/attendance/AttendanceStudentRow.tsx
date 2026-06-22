import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  ATTENDANCE_STATUS_ORDER,
  getAttendanceStatusLabel,
  getAttendanceStatusShort,
} from "@/lib/attendance-labels";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { withHaptic } from "@/lib/haptics";
import type { Locale } from "@/lib/i18n/translations";
import { elevation, radius, space } from "@/lib/theme";
import type { GuruAttendanceStatus, GuruAttendanceStudent } from "@/lib/types";

type Palette = { bg: string; border: string; text: string };

type Props = {
  item: GuruAttendanceStudent;
  noteOpen: boolean;
  readOnly?: boolean;
  locale: Locale;
  notePlaceholder: string;
  noteToggleLabel: string;
  noteHideLabel: string;
  statusPalette: (status: GuruAttendanceStatus) => Palette;
  onStudentDetail: (student: GuruAttendanceStudent) => void;
  onSetStatus: (studentId: string, status: GuruAttendanceStatus) => void;
  onSetNote: (studentId: string, note: string) => void;
  onToggleNote: (studentId: string) => void;
  onNoteFocus?: () => void;
};

function studentInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function AttendanceStudentRowInner({
  item,
  noteOpen,
  readOnly = false,
  locale,
  notePlaceholder,
  noteToggleLabel,
  noteHideLabel,
  statusPalette,
  onStudentDetail,
  onSetStatus,
  onSetNote,
  onToggleNote,
  onNoteFocus,
}: Props) {
  const { colors, font, scale } = useTheme();
  const textStyles = useMemo(
    () => ({
      nameText: { fontWeight: "700" as const, fontSize: scale(14), lineHeight: scale(20) },
      statusChipText: { fontSize: scale(12), fontWeight: "800" as const, textAlign: "center" as const },
      noteText: { flex: 1, fontSize: scale(12), lineHeight: scale(16) },
      noteInput: { fontSize: scale(13) },
      avatarText: { fontSize: scale(14), fontWeight: "800" as const },
    }),
    [scale],
  );
  const statusShort = getAttendanceStatusShort(locale);
  const statusLabels = getAttendanceStatusLabel(locale);
  const notePreview = item.note?.trim();
  const hasNote = Boolean(notePreview);
  const activePalette = item.status ? statusPalette(item.status) : null;

  const noteBtnColors = hasNote
    ? {
        bg: colors.primaryMuted,
        border: colors.primaryBorder,
        icon: colors.primary,
      }
    : {
        bg: colors.bg,
        border: colors.border,
        icon: colors.textMuted,
      };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: activePalette?.border ?? colors.border,
        },
        elevation(colors.cardShadow, "sm"),
      ]}
    >
      {activePalette ? (
        <View style={[styles.statusStrip, { backgroundColor: activePalette.text }]} />
      ) : (
        <View style={[styles.statusStrip, { backgroundColor: colors.border }]} />
      )}
      <View style={styles.cardBody}>
        <View style={styles.mainRow}>
          <Pressable
            style={styles.nameWrap}
            onPress={withHaptic(() => onStudentDetail(item))}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: activePalette?.bg ?? colors.primaryMuted,
                  borderColor: activePalette?.border ?? colors.primaryBorder,
                },
              ]}
            >
              <Text
                style={[
                  textStyles.avatarText,
                  { color: activePalette?.text ?? colors.primary },
                ]}
              >
                {studentInitial(item.fullName)}
              </Text>
            </View>
            <Text
              style={[font.caption, textStyles.nameText, { color: colors.primary }]}
              numberOfLines={1}
            >
              {item.fullName}
            </Text>
          </Pressable>
          <View style={[styles.statusRow, readOnly && styles.statusRowReadOnly]}>
            {ATTENDANCE_STATUS_ORDER.map((status) => {
              const active = item.status === status;
              const palette = statusPalette(status);
              const chipStyle = [
                styles.statusChip,
                active
                  ? {
                      backgroundColor: palette.bg,
                      borderColor: palette.border,
                    }
                  : {
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                    },
              ];
              const chipText = (
                <Text
                  style={[
                    textStyles.statusChipText,
                    { color: active ? palette.text : colors.textMuted },
                  ]}
                >
                  {statusShort[status]}
                </Text>
              );
              if (readOnly) {
                return (
                  <View
                    key={status}
                    style={chipStyle}
                    accessibilityLabel={statusLabels[status]}
                  >
                    {chipText}
                  </View>
                );
              }
              return (
                <Pressable
                  key={status}
                  style={chipStyle}
                  onPress={withHaptic(() => onSetStatus(item.studentId, status))}
                  accessibilityRole="button"
                  accessibilityLabel={statusLabels[status]}
                  accessibilityState={{ selected: active }}
                >
                  {chipText}
                </Pressable>
              );
            })}
          </View>
          {!readOnly ? (
            <Pressable
              style={[
                styles.noteBtn,
                {
                  backgroundColor: noteOpen ? colors.primaryMuted : noteBtnColors.bg,
                  borderColor: noteOpen ? colors.primaryBorder : noteBtnColors.border,
                },
              ]}
              onPress={withHaptic(() => onToggleNote(item.studentId))}
              accessibilityRole="button"
              accessibilityLabel={noteOpen ? noteHideLabel : noteToggleLabel}
              accessibilityState={{ expanded: noteOpen }}
            >
              <Icon name="note" size={15} color={noteOpen ? colors.primary : noteBtnColors.icon} />
            </Pressable>
          ) : null}
        </View>
        {readOnly && hasNote ? (
          <View
            style={[
              styles.noteReadOnly,
              {
                backgroundColor: colors.primaryMuted,
                borderColor: colors.primaryBorder,
              },
            ]}
          >
            <Icon name="note" size={14} color={colors.primary} />
            <Text style={[font.caption, textStyles.noteText, { color: colors.text }]}>
              {notePreview}
            </Text>
          </View>
        ) : null}
        {noteOpen && !readOnly ? (
          <View style={styles.noteEditor}>
            <TextInput
              style={[
                textStyles.noteInput,
                styles.noteInput,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder={notePlaceholder}
              placeholderTextColor={colors.textMuted}
              value={item.note ?? ""}
              onChangeText={(text) => onSetNote(item.studentId, text)}
              onFocus={onNoteFocus}
            />
            <Pressable
              onPress={withHaptic(() => onToggleNote(item.studentId))}
              style={styles.noteHideBtn}
              accessibilityRole="button"
              accessibilityLabel={noteHideLabel}
            >
              <Icon name="chevronUp" size={14} color={colors.textMuted} />
              <Text style={[font.caption, textStyles.noteText, { color: colors.textMuted }]}>
                {noteHideLabel}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export const AttendanceStudentRow = memo(AttendanceStudentRowInner);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: space.sm,
    overflow: "hidden",
  },
  statusStrip: {
    width: 4,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: space.md,
    paddingVertical: 8,
    gap: 6,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  nameWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statusRow: { flexDirection: "row", gap: 4, flexShrink: 0 },
  statusRowReadOnly: { opacity: 0.92 },
  statusChip: {
    width: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    minHeight: 32,
  },
  noteBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  noteEditor: {
    gap: 4,
  },
  noteHideBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 2,
  },
  noteReadOnly: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    minHeight: 34,
  },
});
