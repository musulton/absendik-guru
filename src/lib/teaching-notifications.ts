import { getTeachRemindersEnabled } from "@/lib/app-notification-prefs";
import { localListTeachingSlotsForNotifications } from "@/lib/local-store";
import {
  initTeachingNotificationHandler,
  loadNotificationsModule,
  supportsLocalNotifications,
} from "@/lib/notifications-runtime";
import {
  isoToExpoWeekday,
  subtractMinutesFromTime,
} from "@/lib/teaching-schedule";

const NOTIFY_BEFORE_MINUTES = 10;
const ID_PREFIX = "teach-";

async function cancelTeachingNotifications(
  Notifications: NonNullable<Awaited<ReturnType<typeof loadNotificationsModule>>>,
) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

async function ensureNotificationPermission(
  Notifications: NonNullable<Awaited<ReturnType<typeof loadNotificationsModule>>>,
  requestPermission: boolean,
): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (permissionGranted(current)) return true;
  if (!requestPermission) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return permissionGranted(requested);
}

function permissionGranted(status: { granted?: boolean }): boolean {
  return Boolean(status.granted);
}

function buildNotificationBody(
  className: string,
  subjectName: string | null,
): string {
  if (subjectName?.trim()) {
    return `Mulai absensi ${className} · ${subjectName.trim()}`;
  }
  return `Mulai absensi kelas ${className}`;
}

/** Jadwalkan ulang pengingat mingguan untuk semua slot mengajar. */
export async function rescheduleTeachingNotifications(
  options: { requestPermission?: boolean } = {},
): Promise<void> {
  if (!supportsLocalNotifications()) return;

  await initTeachingNotificationHandler();
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return;

  await cancelTeachingNotifications(Notifications);

  const enabled = await getTeachRemindersEnabled();
  if (!enabled) return;

  const permitted = await ensureNotificationPermission(
    Notifications,
    options.requestPermission === true,
  );
  if (!permitted) return;

  const result = await localListTeachingSlotsForNotifications();
  if (!result.ok) return;

  for (const slot of result.data.slots) {
    const triggerTime = subtractMinutesFromTime(
      slot.startTime,
      NOTIFY_BEFORE_MINUTES,
    );
    if (!triggerTime) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `${ID_PREFIX}${slot.id}`,
      content: {
        title: "Waktunya absensi",
        body: buildNotificationBody(slot.className, slot.subjectName),
        data: {
          workspaceId: slot.workspaceId,
          classId: slot.classId,
          subjectName: slot.subjectName,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: isoToExpoWeekday(slot.dayOfWeek),
        hour: triggerTime.hour,
        minute: triggerTime.minute,
      },
    });
  }
}

export { initTeachingNotificationHandler };
