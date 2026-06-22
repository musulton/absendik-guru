import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenScroll } from "@/components/ScreenScroll";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ScreenHint } from "@/components/ui/ScreenHint";
import { useTheme } from "@/context/AppPreferencesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { withHaptic } from "@/lib/haptics";
import { elevation, radius, space } from "@/lib/theme";

type HubItem = {
  icon: IconName;
  titleKey: "manage.hubClasses" | "manage.hubSubjects" | "manage.hubStudents";
  subtitleKey:
    | "manage.hubClassesSub"
    | "manage.hubSubjectsSub"
    | "manage.hubStudentsSub";
  onPress: () => void;
};

type Props = {
  onManageClasses: () => void;
  onManageSubjects: () => void;
  onManageStudents: () => void;
};

export function ManageHubScreen({
  onManageClasses,
  onManageSubjects,
  onManageStudents,
}: Props) {
  const { colors, t, scale } = useTheme();
  const { workspace } = useWorkspace();
  const isSubjectMode = workspace.attendanceMode === "subject";

  useTranslatedScreenTitle(t("nav.tabManage"));

  const items: HubItem[] = [
    {
      icon: "classes",
      titleKey: "manage.hubClasses",
      subtitleKey: "manage.hubClassesSub",
      onPress: onManageClasses,
    },
    ...(isSubjectMode
      ? [
          {
            icon: "subject" as const,
            titleKey: "manage.hubSubjects" as const,
            subtitleKey: "manage.hubSubjectsSub" as const,
            onPress: onManageSubjects,
          },
        ]
      : []),
    {
      icon: "students",
      titleKey: "manage.hubStudents",
      subtitleKey: "manage.hubStudentsSub",
      onPress: onManageStudents,
    },
  ];

  return (
    <ScreenScroll>
      <ScreenHint>{t("manage.hubHint")}</ScreenHint>
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.titleKey}
            onPress={withHaptic(item.onPress)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              elevation(colors.cardShadow, "sm"),
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}
            >
              <Icon name={item.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.textWrap}>
              <Text
                style={[
                  styles.title,
                  { color: colors.text, fontSize: scale(15) },
                ]}
              >
                {t(item.titleKey)}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: colors.textMuted, fontSize: scale(12) },
                ]}
              >
                {t(item.subtitleKey)}
              </Text>
            </View>
            <Icon name="chevronRight" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.sm, paddingTop: space.xs },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: { opacity: 0.88 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1, gap: 2 },
  title: { fontWeight: "700" },
  subtitle: { lineHeight: 18 },
});
