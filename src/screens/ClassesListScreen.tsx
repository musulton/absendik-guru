import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AdFooterStack } from "@/components/ads/AdFooterStack";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ClassListCard } from "@/components/ui/ClassListCard";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { HubNavCard } from "@/components/ui/HubNavCard";
import { ScreenHint } from "@/components/ui/ScreenHint";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useAdsOptional } from "@/context/AdContext";
import { useTheme } from "@/context/AppPreferencesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useWorkspaceModules } from "@/context/WorkspaceModulesContext";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useListMutations } from "@/hooks/useListMutations";
import { appendClassToList } from "@/lib/list-mutation-events";
import {
  useBlockingScreenLoad,
  useFetchLoadingState,
  shouldShowFetchLoading,
  finishScreenFetch,
} from "@/hooks/useBlockingScreenLoad";
import { apiListClasses } from "@/lib/guru-repository";
import { space } from "@/lib/theme";
import { useListStyles } from "@/lib/use-themed-styles";
import { useTranslatedScreenTitle } from "@/hooks/useTranslatedScreenTitle";
import { ScreenLoadingView } from "@/components/ui/ScreenLoadingView";
import { EmptyState } from "@/components/ui/EmptyState";
import type { GuruClass, GuruWorkspace } from "@/lib/types";
import { getHomeClassListCopy } from "@/navigation/homeClassFlow";
import { goToSettingsTab } from "@/navigation/navHelpers";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "HomeHub">;

type HomeProps = {
  purpose?: "home";
  workspace: GuruWorkspace;
  onOpenClass: (guruClass: GuruClass) => void;
  onOpenManage: () => void;
  onOpenSettings: () => void;
};

type ManageProps = {
  purpose: "manage";
  workspace: GuruWorkspace;
  onEditClass: (guruClass: GuruClass) => void;
  onCreateClass: () => void;
};

type Props = HomeProps | ManageProps;

export function ClassesListScreen(props: Props) {
  const { workspace, purpose = "home" } = props;
  const isManage = purpose === "manage";
  const navigation = useNavigation<Nav>();
  const ads = useAdsOptional();
  const listStyles = useListStyles();
  const { colors, t, isDark } = useTheme();
  const { isSchoolWorkspace, isLocalArchiveWorkspace } = useWorkspace();
  const { modules } = useWorkspaceModules();
  const isMutationLocked = isSchoolWorkspace || isLocalArchiveWorkspace;
  const isSubjectMode = workspace.attendanceMode === "subject";
  const homeClassCopy =
    props.purpose === "home"
      ? getHomeClassListCopy(modules, isSubjectMode)
      : null;

  useTranslatedScreenTitle(
    isManage ? t("nav.tabManageClasses") : workspace.name || t("nav.tabHome"),
  );
  const [loading, setLoading] = useFetchLoadingState();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState<GuruClass[]>([]);

  const load = useCallback(
    async (silent?: boolean) => {
      setError("");
      if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(true);
      try {
        const classRes = await apiListClasses(workspace.id, { force: true });
        if (!classRes.ok) {
          const message =
            isSchoolWorkspace &&
            (classRes.error.code === "network" ||
              classRes.error.code === "invalid_response" ||
              classRes.error.code === "unknown")
              ? t("error.schoolClassesLoadFailed")
              : classRes.error.message;
          setError(message);
          return;
        }
        setClasses(classRes.data.classes);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error.generic"));
      } finally {
        finishScreenFetch({
          isSchoolWorkspace,
          silent,
          setLoading,
          setRefreshing,
        });
      }
    },
    [workspace.id, isSchoolWorkspace, t, setLoading],
  );

  const showBlockingLoad = useBlockingScreenLoad(loading, classes.length > 0);

  useEffect(() => {
    void load();
  }, [load]);

  useRefreshOnFocus(
    () => {
      void load(true);
    },
  );

  useListMutations((event) => {
    if (event.workspaceId !== workspace.id) return;
    if (event.type === "class-created") {
      setClasses((prev) => appendClassToList(prev, event.guruClass));
      return;
    }
    if (event.type === "class-updated") {
      setClasses((prev) =>
        prev.map((row) =>
          row.id === event.guruClass.id ? event.guruClass : row,
        ),
      );
      return;
    }
    if (event.type === "class-deleted") {
      setClasses((prev) => prev.filter((row) => row.id !== event.classId));
      return;
    }
    if (event.type === "student-created") {
      setClasses((prev) =>
        prev.map((row) =>
          row.id === event.classId
            ? {
                ...row,
                activeStudentCount: row.activeStudentCount + 1,
              }
            : row,
        ),
      );
      return;
    }
    if (event.type === "student-deleted") {
      setClasses((prev) =>
        prev.map((row) =>
          row.id === event.classId
            ? {
                ...row,
                activeStudentCount: Math.max(0, row.activeStudentCount - 1),
              }
            : row,
        ),
      );
    }
  });

  useEffect(() => {
    void ads?.refreshAdsState();
  }, [ads]);

  useLayoutEffect(() => {
    if (props.purpose === "manage") {
      navigation.setOptions({
        headerRight: () => (
          <HeaderActions
            layoutKey={isMutationLocked ? "locked" : "full"}
            actions={[
              {
                icon: "plus",
                onPress: props.onCreateClass,
                hidden: isMutationLocked,
              },
            ]}
          />
        ),
      });
      return;
    }

    if (props.purpose === "home") {
      navigation.setOptions({
        headerRight: () => (
          <HeaderActions
            actions={[
              {
                icon: "settings",
                onPress: props.onOpenSettings,
                accessibilityLabel: t("settings.title"),
              },
            ]}
          />
        ),
      });
      return;
    }

    navigation.setOptions({ headerRight: undefined });
  }, [navigation, props, isMutationLocked, isDark, t]);

  const renderItem = useCallback(
    ({ item }: { item: GuruClass }) => {
      if (isManage && props.purpose === "manage") {
        return (
          <ClassListCard
            variant="navigate"
            name={item.name}
            labelColorId={item.labelColor}
            studentCount={item.activeStudentCount}
            studentsLabel={t("common.students")}
            actionHint={t("classes.tapToManage")}
            onPress={() => props.onEditClass(item)}
          />
        );
      }

      if (props.purpose === "home" && homeClassCopy) {
        return (
          <ClassListCard
            variant="navigate"
            name={item.name}
            labelColorId={item.labelColor}
            studentCount={item.activeStudentCount}
            studentsLabel={t("common.students")}
            actionHint={t(homeClassCopy.cardHintKey)}
            onPress={() => props.onOpenClass(item)}
          />
        );
      }

      return null;
    },
    [isManage, t, props, homeClassCopy],
  );

  if (showBlockingLoad) {
    return (
      <View style={[listStyles.centered, { backgroundColor: colors.bg }]}>
        <ScreenLoadingView fill={false} />
      </View>
    );
  }

  const hintBody = isManage
    ? t("classes.manageHint")
    : props.purpose === "home" && homeClassCopy
      ? t(homeClassCopy.screenHintKey)
      : isLocalArchiveWorkspace
        ? t("workspace.localArchiveBanner")
        : isSchoolWorkspace
          ? t("classes.hintBodySchool")
          : isSubjectMode
            ? t("classes.hintBodySubject")
            : t("classes.hintBodyClass");

  const emptyMessage = isManage
    ? isSchoolWorkspace
      ? t("classes.emptySchool")
      : t("classes.empty")
    : isSchoolWorkspace
      ? t("classes.emptySchool")
      : t("classes.emptyHome");

  const listHeader = (
    <>
      <ScreenHint>{hintBody}</ScreenHint>
      <ErrorBanner message={error} />
    </>
  );

  const manageEntry =
    props.purpose === "home" ? (
      <HubNavCard
        icon="edit"
        title={t("nav.tabManage")}
        subtitle={t("home.openManageSub")}
        accentColor={colors.primary}
        tintColor={colors.primaryMuted}
        onPress={props.onOpenManage}
      />
    ) : null;

  return (
    <StickyScreen
      footer={
        <AdFooterStack
          placement={isManage ? "manage_hub" : "classes_list"}
          onUpgrade={() => goToSettingsTab(navigation)}
        />
      }
    >
      <View style={styles.homeLayout}>
        {manageEntry ? (
          <View
            style={[styles.manageEntrySlot, { backgroundColor: colors.bg }]}
          >
            {manageEntry}
          </View>
        ) : null}
        <FlatList
          style={[
            listStyles.list,
            styles.classList,
            { backgroundColor: colors.bg },
          ]}
          contentContainerStyle={listStyles.listContent}
          data={classes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={12}
          windowSize={7}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load(true);
              }}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <EmptyState icon="classes" message={emptyMessage} />
          }
        />
      </View>
    </StickyScreen>
  );
}

const styles = StyleSheet.create({
  homeLayout: { flex: 1, minHeight: 0 },
  manageEntrySlot: {
    flexShrink: 0,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    paddingBottom: space.xs,
  },
  classList: { flex: 1 },
});
