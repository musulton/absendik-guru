import { isExpoGo } from "@/lib/auth";

/** Local notifications need a dev build — Expo Go logs warnings and limits support. */
export function supportsLocalNotifications(): boolean {
  return !isExpoGo();
}

type NotificationsModule = typeof import("expo-notifications");

let notificationsModule: NotificationsModule | null = null;
let handlerReady = false;

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!supportsLocalNotifications()) return null;
  if (!notificationsModule) {
    notificationsModule = await import("expo-notifications");
  }
  return notificationsModule;
}

export async function initTeachingNotificationHandler(): Promise<void> {
  if (handlerReady || !supportsLocalNotifications()) return;
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerReady = true;
}

export { loadNotifications as loadNotificationsModule };
