import {
  loadNotificationsModule,
  supportsLocalNotifications,
} from "@/lib/notifications-runtime";
import {
  parseTeachingNotificationData,
  type TeachingNotificationPayload,
} from "@/navigation/teachingNotificationNav";

let lastHandledNotificationId: string | null = null;

function handleNotificationResponse(
  response: {
    notification: { request: { identifier: string; content: { data?: Record<string, unknown> } } };
  },
  onNavigate: (payload: TeachingNotificationPayload) => void,
): void {
  const id = response.notification.request.identifier;
  if (id === lastHandledNotificationId) return;
  lastHandledNotificationId = id;

  const payload = parseTeachingNotificationData(
    response.notification.request.content.data,
  );
  if (payload) onNavigate(payload);
}

/** Pasang listener tap notifikasi jadwal mengajar. */
export async function bindTeachingNotificationNavigation(
  onNavigate: (payload: TeachingNotificationPayload) => void,
): Promise<() => void> {
  if (!supportsLocalNotifications()) return () => {};

  const Notifications = await loadNotificationsModule();
  if (!Notifications) return () => {};

  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => handleNotificationResponse(response, onNavigate),
  );

  const last = await Notifications.getLastNotificationResponseAsync();
  if (last) {
    handleNotificationResponse(last, onNavigate);
  }

  return () => subscription.remove();
}
