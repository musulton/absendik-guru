import { Fragment, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/context/AppPreferencesContext";
import { useWorkspaceModules } from "@/context/WorkspaceModulesContext";
import { getModuleTheme } from "@/lib/module-theme";
import type { SessionProgress } from "@/lib/session-progress";
import { radius, space } from "@/lib/theme";
import type { HomeModule } from "@/navigation/types";

type Props = {
  progress: SessionProgress;
  /** Menempel di atas konten scroll — tidak ikut scroll. */
  pinned?: boolean;
  currentModule?: HomeModule;
  onStepPress?: (module: HomeModule) => void;
};

type StepDef = {
  module: HomeModule;
  shortLabel: string;
  optional?: boolean;
  done?: boolean;
};

const BUBBLE_SIZE = 30;
const ICON_SIZE = 14;
const CONNECTOR_WIDTH = 20;

export function SessionProgressStrip({
  progress,
  pinned = false,
  currentModule,
  onStepPress,
}: Props) {
  const { colors, font, scale, t, isDark } = useTheme();
  const { modules } = useWorkspaceModules();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pinned: {
          flexShrink: 0,
          borderBottomWidth: StyleSheet.hairlineWidth,
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
        },
        card: {
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: radius.md,
          paddingHorizontal: space.md,
          paddingVertical: space.sm,
          marginBottom: space.sm,
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        },
        step: {
          alignItems: "center",
          gap: 4,
          minWidth: 52,
          flexShrink: 0,
        },
        bubble: {
          width: BUBBLE_SIZE,
          height: BUBBLE_SIZE,
          borderRadius: radius.pill,
          alignItems: "center",
          justifyContent: "center",
        },
        shortLabel: {
          fontSize: scale(11),
          lineHeight: scale(14),
          textAlign: "center",
        },
        connector: {
          height: 2,
          width: CONNECTOR_WIDTH,
          borderRadius: radius.pill,
          marginHorizontal: 4,
          marginBottom: 16,
        },
      }),
    [scale],
  );

  const steps = useMemo(() => {
    const list: StepDef[] = [];
    if (modules.attendance) {
      list.push({
        module: "attendance",
        shortLabel: t("sessionFlow.stepShortAttendance"),
        done: progress.attendanceDone,
      });
    }
    if (modules.teachingJournal) {
      list.push({
        module: "teachingJournal",
        shortLabel: t("sessionFlow.stepShortJournal"),
        done: progress.journalDone,
      });
    }
    if (modules.grades) {
      list.push({
        module: "grades",
        shortLabel: t("sessionFlow.stepShortGrades"),
        optional: true,
      });
    }
    if (modules.studentNotes) {
      list.push({
        module: "studentNotes",
        shortLabel: t("sessionFlow.stepShortNotes"),
        optional: true,
      });
    }
    return list;
  }, [modules, progress, t]);

  if (steps.length < 2) return null;

  return (
    <View
      style={[
        pinned ? styles.pinned : styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        {steps.map((step, index) => {
          const theme = getModuleTheme(step.module, colors, isDark);
          const prevDone = index > 0 ? Boolean(steps[index - 1].done) : false;
          const prevTheme =
            index > 0
              ? getModuleTheme(steps[index - 1].module, colors, isDark)
              : null;
          const isDone = Boolean(step.done);
          const isOptional = Boolean(step.optional);
          const isCurrent = currentModule === step.module;
          const canPress = Boolean(onStepPress) && !isCurrent;
          const fullLabel =
            step.module === "attendance"
              ? t("modules.attendance")
              : step.module === "teachingJournal"
                ? t("modules.teachingJournal")
                : step.module === "grades"
                  ? t("modules.grades")
                  : t("modules.studentNotes");

          const stepBody = (
            <>
              <View
                style={[
                  styles.bubble,
                  {
                    backgroundColor: isDone ? theme.tint : colors.bg,
                    borderColor: isCurrent
                      ? theme.accent
                      : isDone
                        ? theme.accent
                        : isOptional
                          ? colors.border
                          : theme.border,
                    borderStyle:
                      isOptional && !isDone ? "dashed" : "solid",
                    borderWidth: isCurrent ? 2 : 1,
                  },
                ]}
              >
                {isDone ? (
                  <Icon name="check" size={ICON_SIZE} color={theme.accent} />
                ) : (
                  <Icon
                    name={theme.icon}
                    size={ICON_SIZE}
                    color={isOptional ? colors.textMuted : theme.accent}
                  />
                )}
              </View>
              <Text
                style={[
                  font.caption,
                  styles.shortLabel,
                  {
                    color: isCurrent || isDone ? theme.accent : colors.textMuted,
                    fontWeight: isCurrent || isDone ? "700" : "600",
                  },
                ]}
                numberOfLines={2}
              >
                {step.shortLabel}
              </Text>
            </>
          );

          return (
            <Fragment key={step.module}>
              {index > 0 ? (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: prevDone
                        ? (prevTheme?.accent ?? colors.border)
                        : colors.border,
                    },
                  ]}
                />
              ) : null}
              {canPress ? (
                <Pressable
                  style={styles.step}
                  onPress={() => onStepPress?.(step.module)}
                  accessibilityRole="button"
                  accessibilityLabel={fullLabel}
                  accessibilityState={{ selected: isCurrent || isDone }}
                >
                  {stepBody}
                </Pressable>
              ) : (
                <View
                  style={styles.step}
                  accessibilityLabel={fullLabel}
                  accessibilityState={{
                    selected: isCurrent || isDone,
                    disabled: isOptional && !isDone,
                  }}
                >
                  {stepBody}
                </View>
              )}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}
