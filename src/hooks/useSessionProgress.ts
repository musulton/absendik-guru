import { useCallback, useEffect, useState } from "react";
import {
  fetchSessionProgress,
  type SessionProgress,
} from "@/lib/session-progress";

const EMPTY: SessionProgress = {
  attendanceDone: false,
  journalDone: false,
};

export function useSessionProgress(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
) {
  const [progress, setProgress] = useState<SessionProgress>(EMPTY);

  const reload = useCallback(async () => {
    const next = await fetchSessionProgress(
      workspaceId,
      classId,
      sessionDate,
      subjectName,
    );
    setProgress(next);
  }, [workspaceId, classId, sessionDate, subjectName]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { progress, reload };
}
