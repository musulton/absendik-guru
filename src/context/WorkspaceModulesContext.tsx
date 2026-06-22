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
  DEFAULT_WORKSPACE_MODULES,
  getWorkspaceModules,
  normalizeWorkspaceModules,
  setWorkspaceModules,
  type WorkspaceModules,
} from "@/lib/workspace-modules";

type WorkspaceModulesContextValue = {
  modules: WorkspaceModules;
  loading: boolean;
  refreshModules: () => Promise<void>;
  updateModules: (next: WorkspaceModules) => Promise<void>;
};

const WorkspaceModulesContext =
  createContext<WorkspaceModulesContextValue | null>(null);

export function WorkspaceModulesProvider({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: ReactNode;
}) {
  const [modules, setModulesState] = useState<WorkspaceModules>(
    DEFAULT_WORKSPACE_MODULES,
  );
  const [loading, setLoading] = useState(false);

  const refreshModules = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getWorkspaceModules(workspaceId);
      setModulesState(next);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    let active = true;
    void getWorkspaceModules(workspaceId)
      .then((next) => {
        if (active) setModulesState(next);
      })
      .catch(() => {
        /* pertahankan default */
      });
    return () => {
      active = false;
    };
  }, [workspaceId]);

  const updateModules = useCallback(
    async (next: WorkspaceModules) => {
      const normalized = normalizeWorkspaceModules(next);
      await setWorkspaceModules(workspaceId, normalized);
      setModulesState(normalized);
    },
    [workspaceId],
  );

  const value = useMemo(
    () => ({ modules, loading, refreshModules, updateModules }),
    [modules, loading, refreshModules, updateModules],
  );

  return (
    <WorkspaceModulesContext.Provider value={value}>
      {children}
    </WorkspaceModulesContext.Provider>
  );
}

export function useWorkspaceModules() {
  const ctx = useContext(WorkspaceModulesContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceModules must be used within WorkspaceModulesProvider",
    );
  }
  return ctx;
}

export function useWorkspaceModulesOptional() {
  return useContext(WorkspaceModulesContext);
}
