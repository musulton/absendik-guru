import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";
import { closeLocalDb, localDbFileName } from "@/lib/local-db/connection";
import { storage, STORAGE_KEYS } from "@/lib/storage";

function legacyStorageKey(userId: string) {
  return `guru_local_db_v1_${userId}`;
}

/** Hapus SQLite, cadangan JSON lama, dan sekolah aktif — tanpa logout. */
export async function wipeAllLocalDeviceData(userId: string): Promise<void> {
  await closeLocalDb(userId);
  try {
    await SQLite.deleteDatabaseAsync(localDbFileName(userId));
  } catch {
    /* berkas DB belum ada */
  }
  await AsyncStorage.removeItem(legacyStorageKey(userId));
  await storage.remove(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
}
