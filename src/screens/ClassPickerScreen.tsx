import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { ClassListCard } from "@/components/ui/ClassListCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ScreenHint } from "@/components/ui/ScreenHint";
import { StickyScreen } from "@/components/ui/StickyScreen";
import { useTheme } from "@/context/AppPreferencesContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { useListMutations } from "@/hooks/useListMutations";
import { appendClassToList } from "@/lib/list-mutation-events";
import {
  useBlockingScreenLoad,
  useFetchLoadingState,
  shouldShowFetchLoading,
} from "@/hooks/useBlockingScreenLoad";
import { ScreenLoadingView } from "@/components/ui/ScreenLoadingView";
import { apiListClasses } from "@/lib/guru-repository";
import { useListStyles } from "@/lib/use-themed-styles";
import { EmptyState } from "@/components/ui/EmptyState";
import type { GuruClass } from "@/lib/types";

type Props = {
  mode: "subjects" | "students";
  onPickClass: (guruClass: GuruClass) => void;
};

export function ClassPickerScreen({ mode, onPickClass }: Props) {
  const hintKey =
    mode === "subjects" ? "classPicker.subjects" : "classPicker.students";
  const listStyles = useListStyles();
  const { colors, t } = useTheme();
  const { workspace, isSchoolWorkspace } = useWorkspace();
  const [loading, setLoading] = useFetchLoadingState();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState<GuruClass[]>([]);

  const load = useCallback(async (silent?: boolean) => {
    setError("");
    if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(true);
    const classRes = await apiListClasses(workspace.id, { force: true });
    if (shouldShowFetchLoading(isSchoolWorkspace, silent)) setLoading(false);
    setRefreshing(false);
    if (!classRes.ok) {
      setError(classRes.error.message);
      return;
    }
    setClasses(classRes.data.classes);
  }, [workspace.id, isSchoolWorkspace, setLoading]);

  const showBlockingLoad = useBlockingScreenLoad(loading, classes.length > 0);

  useEffect(() => {
    void load();
  }, [load]);

  useRefreshOnFocus(() => {
    void load(true);
  }, { staleMs: 0 });

  useListMutations((event) => {
    if (event.workspaceId !== workspace.id) return;
    if (event.type === "class-created") {
      setClasses((prev) => appendClassToList(prev, event.guruClass));
    }
    if (event.type === "class-updated") {
      setClasses((prev) =>
        prev.map((row) =>
          row.id === event.guruClass.id ? event.guruClass : row,
        ),
      );
    }
    if (event.type === "class-deleted") {
      setClasses((prev) => prev.filter((row) => row.id !== event.classId));
    }
  });

  if (showBlockingLoad) {
    return (
      <View style={[listStyles.centered, { backgroundColor: colors.bg }]}>
        <ScreenLoadingView fill={false} />
      </View>
    );
  }

  return (
    <StickyScreen>
      <FlatList
        style={[listStyles.list, { backgroundColor: colors.bg }]}
        contentContainerStyle={listStyles.listContent}
        data={classes}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
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
        ListHeaderComponent={
          <>
            <ScreenHint>{t(hintKey)}</ScreenHint>
            <ErrorBanner message={error} />
          </>
        }
        ListEmptyComponent={
          <EmptyState icon="classes" message={t("classes.empty")} />
        }
        renderItem={({ item }) => (
          <ClassListCard
            variant="navigate"
            name={item.name}
            labelColorId={item.labelColor}
            studentCount={item.activeStudentCount}
            studentsLabel={t("common.students")}
            actionHint={t("classPicker.tapToOpen")}
            onPress={() => onPickClass(item)}
          />
        )}
      />
    </StickyScreen>
  );
}
