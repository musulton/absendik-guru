import { createContext, useContext, type ReactNode } from "react";
import type { GuruAccount, GuruWorkspace } from "@/lib/types";

type WorkspaceContextValue = {
  workspace: GuruWorkspace;
  /** Workspace terhubung cloud (legacy) — kelas/siswa read-only. */
  isSchoolWorkspace: boolean;
  /** Workspace lokal arsip — data sebelum terhubung; rekap/export tetap bisa dibuka. */
  isLocalArchiveWorkspace: boolean;
  account: GuruAccount;
  userId: string;
  onSwitchWorkspace: () => void;
  onSignOut: () => void;
  refreshApp: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  value,
  children,
}: {
  value: WorkspaceContextValue;
  children: ReactNode;
}) {
  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
