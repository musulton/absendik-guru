import * as SecureStore from "expo-secure-store";

export const STORAGE_KEYS = {
  ACTIVE_WORKSPACE_ID: "guru_active_workspace_id",
} as const;

/** @deprecated gunakan STORAGE_MODE_KEY dari storage-mode.ts */
export { STORAGE_MODE_KEY } from "@/lib/storage-mode";

export const storage = {
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};
