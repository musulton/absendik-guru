import type { NavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "@/navigation/types";

export const TEACHING_NOTIFICATION_TYPE = "teaching_reminder";

export type TeachingNotificationPayload = {
  type: typeof TEACHING_NOTIFICATION_TYPE;
  workspaceId: string;
  classId: string;
  className: string;
  labelColor: string | null;
  subjectName: string | null;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function parseTeachingNotificationData(
  data: Record<string, unknown> | undefined,
): TeachingNotificationPayload | null {
  if (!data) return null;

  const workspaceId = readString(data.workspaceId);
  const classId = readString(data.classId);
  const className = readString(data.className);
  if (!workspaceId || !classId || !className) return null;

  const type = readString(data.type);
  if (type && type !== TEACHING_NOTIFICATION_TYPE) return null;

  const labelColor = readString(data.labelColor);
  const subjectName = readString(data.subjectName);

  return {
    type: TEACHING_NOTIFICATION_TYPE,
    workspaceId,
    classId,
    className,
    labelColor,
    subjectName,
  };
}

export function navigateToTeachingAttendance(
  navigationRef: NavigationContainerRef<RootStackParamList>,
  payload: TeachingNotificationPayload,
): void {
  if (!navigationRef.isReady()) return;

  navigationRef.navigate("App", {
    screen: "Attendance",
    params: {
      classId: payload.classId,
      className: payload.className,
      labelColor: payload.labelColor,
      subjectName: payload.subjectName,
    },
  });
}
