import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ListRow } from "@/components/ui/ListRow";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { apiListWorkspaces } from "@/lib/guru-repository";
import { ensureSchoolLinkLoaded, refreshSchoolLink } from "@/lib/school-link";
import { filterArchiveWorkspaces } from "@/lib/workspace-quota";
import type { GuruWorkspace } from "@/lib/types";
import { useListStyles } from "@/lib/use-themed-styles";
import { useTheme } from "@/context/AppPreferencesContext";
import {
  formatWorkspaceLocation,
  formatWorkspaceStatsLine,
} from "@/lib/workspace-display";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHint } from "@/components/ui/ScreenHint";

type Props = {
  onSelect: (workspace: GuruWorkspace) => void;
};

export function LocalArchivePickerScreen({ onSelect }: Props) {
  const { colors, t } = useTheme();
  const listStyles = useListStyles();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [workspaces, setWorkspaces] = useState<GuruWorkspace[]>([]);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) setLoading(true);
    setError("");
    try {
      const link = await refreshSchoolLink().catch(() =>
        ensureSchoolLinkLoaded(),
      );
      const merged = await apiListWorkspaces();
      if (!merged.ok) {
        setError(merged.error.message);
        setWorkspaces([]);
        return;
      }
      setWorkspaces(filterArchiveWorkspaces(merged.data.workspaces, link));
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useRefreshOnFocus(() => {
    void load({ silent: true });
  });

  const archiveCountLabel = useMemo(() => {
    if (workspaces.length === 0) return "";
    return t("workspace.localArchiveCount", { count: workspaces.length });
  }, [workspaces.length, t]);

  async function pick(workspace: GuruWorkspace) {
    await storage.set(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, workspace.id);
    onSelect(workspace);
  }

  if (loading && workspaces.length === 0) {
    return (
      <View style={listStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <StickyScreen>
      <FlatList
        style={listStyles.list}
        contentContainerStyle={listStyles.listContent}
        data={workspaces}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load({ silent: true });
            }}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <ScreenHint>{t("workspace.localArchiveScreenHint")}</ScreenHint>
            {archiveCountLabel ? (
              <ScreenHint>{archiveCountLabel}</ScreenHint>
            ) : null}
            <ErrorBanner message={error} />
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="school"
            title={t("workspace.localArchiveEmptyTitle")}
            message={t("workspace.localArchiveEmptyBody")}
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
          return (
            <ListRow
              title={item.name}
              subtitle={subtitle}
              leadingIcon="download"
              accentColor={colors.textMuted}
              workspaceKind="localArchive"
              workspaceKindLabel={t("workspace.badgeLocalArchive")}
              onPress={() => void pick(item)}
            />
          );
        }}
      />
    </StickyScreen>
  );
}
