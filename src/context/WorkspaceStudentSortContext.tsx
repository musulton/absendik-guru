import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearFetchCache } from "@/lib/guru-repository";
import {
  DEFAULT_STUDENT_SORT_MODE,
  getWorkspaceStudentSort,
  setWorkspaceStudentSort,
  type StudentSortMode,
} from "@/lib/workspace-student-sort";
import { setCachedStudentSort } from "@/lib/student-sort-cache";

type WorkspaceStudentSortContextValue = {
  sortMode: StudentSortMode;
  loading: boolean;
  updateSortMode: (next: StudentSortMode) => Promise<void>;
  refreshSortMode: () => Promise<void>;
};

const WorkspaceStudentSortContext =
  createContext<WorkspaceStudentSortContextValue | null>(null);

export function WorkspaceStudentSortProvider({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: ReactNode;
}) {
  const [sortMode, setSortMode] = useState<StudentSortMode>(
    DEFAULT_STUDENT_SORT_MODE,
  );
  const [loading, setLoading] = useState(false);

  const refreshSortMode = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getWorkspaceStudentSort(workspaceId);
      setSortMode(next);
      setCachedStudentSort(workspaceId, next);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    let active = true;
    void getWorkspaceStudentSort(workspaceId)
      .then((next) => {
        if (!active) return;
        setSortMode(next);
        setCachedStudentSort(workspaceId, next);
      })
      .catch(() => {
        /* pertahankan default */
      });
    return () => {
      active = false;
    };
  }, [workspaceId]);

  const updateSortMode = useCallback(
    async (next: StudentSortMode) => {
      await setWorkspaceStudentSort(workspaceId, next);
      setSortMode(next);
      setCachedStudentSort(workspaceId, next);
      clearFetchCache();
    },
    [workspaceId],
  );

  const value = useMemo(
    () => ({ sortMode, loading, updateSortMode, refreshSortMode }),
    [sortMode, loading, updateSortMode, refreshSortMode],
  );

  return (
    <WorkspaceStudentSortContext.Provider value={value}>
      {children}
    </WorkspaceStudentSortContext.Provider>
  );
}

export function useWorkspaceStudentSort() {
  const ctx = useContext(WorkspaceStudentSortContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceStudentSort must be used within WorkspaceStudentSortProvider",
    );
  }
  return ctx;
}
