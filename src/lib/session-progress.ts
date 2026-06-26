import {
  apiGetAttendance,
  apiGetTeachingJournal,
} from "@/lib/guru-repository";
import type { GuruTeachingJournalEntry } from "@/lib/types";

export type SessionProgress = {
  attendanceDone: boolean;
  journalDone: boolean;
};

export function isJournalFilled(
  entry: GuruTeachingJournalEntry | null | undefined,
): boolean {
  if (!entry) return false;
  return Boolean(
    entry.material?.trim() || entry.method?.trim() || entry.notes?.trim(),
  );
}

export async function fetchSessionProgress(
  workspaceId: string,
  classId: string,
  sessionDate: string,
  subjectName?: string | null,
): Promise<SessionProgress> {
  const [attendanceRes, journalRes] = await Promise.all([
    apiGetAttendance(workspaceId, classId, sessionDate, subjectName),
    apiGetTeachingJournal(workspaceId, classId, sessionDate, subjectName),
  ]);

  return {
    attendanceDone:
      attendanceRes.ok && Boolean(attendanceRes.data.attendance.session),
    journalDone:
      journalRes.ok && isJournalFilled(journalRes.data.journal.entry),
  };
}
