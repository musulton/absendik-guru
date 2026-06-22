import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_GRADE_PREDIKAT,
  type SchoolGradePredikatSettings,
} from "@/lib/grade-predikat";
import {
  canEditWorkspaceGradePredikat,
  getWorkspaceGradePredikatSettings,
  resetWorkspaceGradePredikatSettings,
  saveWorkspaceGradePredikatSettings,
} from "@/lib/workspace-grade-predikat";

type WorkspaceGradePredikatContextValue = {
  settings: SchoolGradePredikatSettings;
  loading: boolean;
  canEdit: boolean;
  refreshSettings: () => Promise<void>;
  saveSettings: (
    draft: SchoolGradePredikatSettings,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  resetSettings: () => Promise<{ ok: true } | { ok: false; error: string }>;
};

const WorkspaceGradePredikatContext =
  createContext<WorkspaceGradePredikatContextValue | null>(null);

export function WorkspaceGradePredikatProvider({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<SchoolGradePredikatSettings>(
    DEFAULT_GRADE_PREDIKAT,
  );
  const [loading, setLoading] = useState(false);
  const canEdit = canEditWorkspaceGradePredikat(workspaceId);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getWorkspaceGradePredikatSettings(workspaceId);
      setSettings(next);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void refreshSettings();
  }, [refreshSettings]);

  const saveSettings = useCallback(
    async (draft: SchoolGradePredikatSettings) => {
      const result = await saveWorkspaceGradePredikatSettings(workspaceId, draft);
      if (result.ok) {
        setSettings(await getWorkspaceGradePredikatSettings(workspaceId));
      }
      return result;
    },
    [workspaceId],
  );

  const resetSettings = useCallback(async () => {
    const result = await resetWorkspaceGradePredikatSettings(workspaceId);
    if (result.ok) {
      setSettings(DEFAULT_GRADE_PREDIKAT);
    }
    return result;
  }, [workspaceId]);

  const value = useMemo(
    () => ({
      settings,
      loading,
      canEdit,
      refreshSettings,
      saveSettings,
      resetSettings,
    }),
    [settings, loading, canEdit, refreshSettings, saveSettings, resetSettings],
  );

  return (
    <WorkspaceGradePredikatContext.Provider value={value}>
      {children}
    </WorkspaceGradePredikatContext.Provider>
  );
}

export function useWorkspaceGradePredikat() {
  const ctx = useContext(WorkspaceGradePredikatContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceGradePredikat must be used within WorkspaceGradePredikatProvider",
    );
  }
  return ctx;
}
