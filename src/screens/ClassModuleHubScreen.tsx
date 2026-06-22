import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AdFooterStack } from "@/components/ads/AdFooterStack";
import { ScreenScroll } from "@/components/ScreenScroll";
import { ClassContextHeader } from "@/components/ui/ClassContextHeader";
import { HubNavCard } from "@/components/ui/HubNavCard";
import { ScreenHint } from "@/components/ui/ScreenHint";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useTheme } from "@/context/AppPreferencesContext";
import { useWorkspaceModules } from "@/context/WorkspaceModulesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { promptAddStudentsForClass } from "@/navigation/homeClassFlow";
import { goToSettingsTab } from "@/navigation/navHelpers";
import type { HomeModule } from "@/navigation/types";
import { space } from "@/lib/theme";

type Props = {
  className: string;
  labelColor?: string | null;
  activeStudentCount: number;
  onOpenModule: (module: HomeModule) => void;
  onAddStudent: () => void;
};

export function ClassModuleHubScreen({
  className,
  labelColor,
  activeStudentCount,
  onOpenModule,
  onAddStudent,
}: Props) {
  const navigation = useNavigation();
  const { colors, t } = useTheme();
  const { modules } = useWorkspaceModules();
  const { isSchoolWorkspace } = useWorkspace();

  const cards = [
    ...(modules.attendance
      ? [
          {
            module: "attendance" as const,
            icon: "attendance" as const,
            title: t("modules.attendance"),
            subtitle: t("home.hubAttendanceSub"),
            accentColor: colors.primary,
            tintColor: colors.primaryMuted,
          },
        ]
      : []),
    ...(modules.grades
      ? [
          {
            module: "grades" as const,
            icon: "grades" as const,
            title: t("modules.grades"),
            subtitle: t("home.hubGradesSub"),
            accentColor: colors.accent,
            tintColor: colors.successBg,
          },
        ]
      : []),
  ];

  function promptAddStudent() {
    promptAddStudentsForClass(t, {
      isSchoolWorkspace,
      onAddStudent,
    });
  }

  function handleOpenModule(module: HomeModule) {
    if (activeStudentCount === 0) {
      promptAddStudent();
      return;
    }
    onOpenModule(module);
  }

  return (
    <StickyScreen
      footer={
        <AdFooterStack
          placement="class_hub"
          onUpgrade={() => goToSettingsTab(navigation)}
        />
      }
    >
      <ScreenScroll contentContainerStyle={styles.scrollContent}>
        <ClassContextHeader
          className={className}
          labelColorId={labelColor}
          studentCount={activeStudentCount}
          studentsLabel={t("common.students")}
        />
        <ScreenHint>
          {cards.length > 0 ? t("home.classModuleHint") : t("home.noModulesHint")}
        </ScreenHint>
        <View style={styles.list}>
          {cards.map((card) => (
            <HubNavCard
              key={card.module}
              icon={card.icon}
              title={card.title}
              subtitle={card.subtitle}
              accentColor={card.accentColor}
              tintColor={card.tintColor}
              onPress={() => handleOpenModule(card.module)}
            />
          ))}
        </View>
      </ScreenScroll>
    </StickyScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: space.sm },
  list: { gap: space.sm, paddingTop: space.xs },
});
