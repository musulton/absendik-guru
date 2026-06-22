import { Platform } from "react-native";
import { storage } from "@/lib/storage";

const DEVICE_ID_KEY = "guru_device_id";

function createDeviceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getGuruDeviceId(): Promise<string> {
  const existing = await storage.get(DEVICE_ID_KEY);
  if (existing && existing.length >= 8) {
    return existing;
  }
  const next = createDeviceId();
  await storage.set(DEVICE_ID_KEY, next);
  return next;
}

export async function getGuruDeviceLabel(): Promise<string> {
  const os = Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : Platform.OS;
  return `${os} ${String(Platform.Version)}`;
}

export async function getGuruDeviceHeaders(): Promise<Record<string, string>> {
  const [deviceId, deviceLabel] = await Promise.all([
    getGuruDeviceId(),
    getGuruDeviceLabel(),
  ]);
  return {
    "X-Guru-Device-Id": deviceId,
    "X-Guru-Device-Label": deviceLabel,
  };
}
