import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AdFooterStack } from "@/components/ads/AdFooterStack";
import { ErrorBanner } from "@/components/ErrorBanner";
import { HeaderActions } from "@/components/ui/HeaderActions";
import { ListRow } from "@/components/ui/ListRow";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import {
  apiListLocalWorkspaces,
  apiListWorkspaces,
  apiMe,
  clearFetchCache,
} from "@/lib/guru-repository";
import {
  ensureSchoolLinkLoaded,
  refreshSchoolLink,
} from "@/lib/school-link";
import { filterArchiveWorkspaces, filterMainWorkspaces } from "@/lib/workspace-quota";
import { getWorkspaceKind } from "@/lib/workspace-kind";
import type { GuruSchoolLinkResponse } from "@/lib/types";
import { canAddBillableWorkspace } from "@/lib/guru-limits";
import { useListStyles } from "@/lib/use-themed-styles";
import { useTheme } from "@/context/AppPreferencesContext";
import {
  formatWorkspaceLocation,
  formatWorkspaceStatsLine,
} from "@/lib/workspace-display";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHint } from "@/components/ui/ScreenHint";
import type { GuruWorkspace } from "@/lib/types";

type Props = {
  manualPick?: boolean;
  onSelect: (workspace: GuruWorkspace) => void;
  onCreate: () => void;
  onOpenArchive?: () => void;
  onUpgrade?: () => void;
};

export function WorkspacePickerScreen({
  manualPick = false,
  onSelect,
  onCreate,
  onOpenArchive,
  onUpgrade,
}: Props) {
  const navigation = useNavigation();
  const { colors, t, isDark } = useTheme();
  const listStyles = useListStyles();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [workspaces, setWorkspaces] = useState<GuruWorkspace[]>([]);
  const [canAddSchool, setCanAddSchool] = useState(true);
  const [quotaReady, setQuotaReady] = useState(false);
  const [schoolLink, setSchoolLink] = useState<GuruSchoolLinkResponse>({ linked: false });

  const applyMe = useCallback(
    (me: Awaited<ReturnType<typeof apiMe>>) => {
      if (!me.ok) return;
      setCanAddSchool(
        canAddBillableWorkspace(me.data.usage.workspaceCount, me.data.limits),
      );
      setQuotaReady(true);
    },
    [],
  );

  const applySchoolLink = useCallback((link: GuruSchoolLinkResponse) => {
    setSchoolLink(link);
  }, []);

  const loadWorkspaces = useCallback(async (opts?: { force?: boolean }) => {
    setError("");
    const force = opts?.force ?? false;
    if (force) clearFetchCache();
    try {
      const quick = await apiListLocalWorkspaces();
      if (quick.ok) {
        setWorkspaces(quick.data.workspaces);
      }

      const [me, link] = await Promise.all([
        apiMe(undefined, { force: true }),
        force
          ? refreshSchoolLink().catch(() => ({ linked: false as const }))
          : ensureSchoolLinkLoaded().catch(() => ({ linked: false as const })),
      ]);
      applySchoolLink(link);

      const merged = await apiListWorkspaces();
      if (!merged.ok) {
        setError(merged.error.message);
        return;
      }
      setWorkspaces(merged.data.workspaces);
      applyMe(me);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
    } finally {
      setQuotaReady(true);
      setRefreshing(false);
    }
  }, [applyMe, applySchoolLink, t]);

  useEffect(() => {
    void loadWorkspaces({ force: true }).finally(() => setLoading(false));
  }, [loadWorkspaces]);

  useRefreshOnFocus(() => {
    void loadWorkspaces({ force: true });
  });

  const pick = useCallback(
    async (workspace: GuruWorkspace) => {
      await storage.set(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, workspace.id);
      onSelect(workspace);
    },
    [onSelect],
  );

  const handleCreateRef = useRef<() => void>(() => {});

  handleCreateRef.current = () => {
    if (!quotaReady) return;
    if (!canAddSchool) {
      Alert.alert(
        t("workspace.freeLimitTitle"),
        t("workspace.freeLimitBody"),
        [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("settings.upgradePro"), onPress: onUpgrade },
        ],
      );
      return;
    }
    onCreate();
  };

  const handleCreate = useCallback(() => {
    handleCreateRef.current();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderActions
          layoutKey={canAddSchool ? "add-school" : "add-school-blocked"}
          actions={[
            {
              icon: "plus",
              onPress: () => handleCreateRef.current(),
              accessibilityLabel: t("workspace.addSchool"),
            },
          ]}
        />
      ),
    });
  }, [navigation, canAddSchool, quotaReady, t, isDark]);

  const addSchoolFooter = useMemo(
    () => (
      <PrimaryButton
        title={t("workspace.addSchool")}
        size="compact"
        disabled={!quotaReady}
        onPress={handleCreate}
      />
    ),
    [handleCreate, quotaReady, t],
  );

  const mainWorkspaces = useMemo(
    () => filterMainWorkspaces(workspaces, schoolLink),
    [workspaces, schoolLink],
  );

  const archiveWorkspaces = useMemo(
    () => filterArchiveWorkspaces(workspaces, schoolLink),
    [workspaces, schoolLink],
  );

  if (loading && mainWorkspaces.length === 0) {
    return (
      <View style={listStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <StickyScreen
      footer={
        <AdFooterStack
          placement="workspace_picker"
          onUpgrade={onUpgrade}
          actions={addSchoolFooter}
        />
      }
    >
    <FlatList
      style={listStyles.list}
      contentContainerStyle={listStyles.listContent}
      data={mainWorkspaces}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void loadWorkspaces({ force: true }).finally(() => {
              setRefreshing(false);
            });
          }}
          tintColor={colors.primary}
        />
      }
      ListHeaderComponent={
        <>
          <ScreenHint>
            {manualPick && schoolLink.linked
              ? t("workspace.manualPickHint")
              : t("nav.switchSchoolSub")}
          </ScreenHint>
          <ErrorBanner message={error} />
        </>
      }
      ListFooterComponent={
        archiveWorkspaces.length > 0 && onOpenArchive ? (
          <Pressable
            onPress={onOpenArchive}
            style={({ pressed }) => [
              styles.archiveLink,
              {
                borderColor: colors.border,
                backgroundColor: pressed ? colors.bg : colors.surface,
              },
            ]}
          >
            <Text style={[styles.archiveLinkTitle, { color: colors.text }]}>
              {t("workspace.openLocalArchive")}
            </Text>
            <Text style={[styles.archiveLinkBody, { color: colors.textMuted }]}>
              {t("workspace.openLocalArchiveBody", {
                count: archiveWorkspaces.length,
              })}
            </Text>
          </Pressable>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState
          icon="school"
          title={t("workspace.emptyTitle")}
          message={
            schoolLink.linked
              ? t("workspace.emptyBody")
              : t("workspace.notLinkedSchoolHint")
          }
        />
      }
      renderItem={({ item }) => {
        const loc = formatWorkspaceLocation(item);
        const stats = formatWorkspaceStatsLine({
          classCount: item.classCount ?? 0,
          subjectCount: item.subjectCount ?? 0,
          activeStudentCount: item.activeStudentCount ?? 0,
        });
        const subtitle = loc ? `${loc} · ${stats}` : stats;
        const kind = getWorkspaceKind(item, schoolLink);
        const kindLabel =
          kind === "school"
            ? t("workspace.badgeSchool")
            : kind === "localArchive"
              ? t("workspace.badgeLocalArchive")
              : t("workspace.badgeLocal");
        return (
          <ListRow
            title={item.name}
            subtitle={subtitle}
            workspaceKind={kind}
            workspaceKindLabel={kindLabel}
            onPress={() => void pick(item)}
          />
        );
      }}
    />
    </StickyScreen>
  );
}

const styles = {
  archiveLink: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  archiveLinkTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  archiveLinkBody: {
    fontSize: 12,
    lineHeight: 17,
  },
};
