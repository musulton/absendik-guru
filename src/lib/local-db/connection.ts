import * as SQLite from "expo-sqlite";
import { LOCAL_DB_SCHEMA_SQL } from "@/lib/local-db/schema";
import { migrateLegacyAsyncStorageIfNeeded } from "@/lib/local-db/migrate-legacy";
import { migrateLocalDbSchema } from "@/lib/local-db/migrate-schema";

const dbCache = new Map<string, SQLite.SQLiteDatabase>();
/** Cegah dua koneksi paralel ke file DB yang sama (write tidak terbaca). */
const opening = new Map<string, Promise<SQLite.SQLiteDatabase>>();

export function localDbFileName(userId: string) {
  return `guru_${userId.replace(/[^a-zA-Z0-9]/g, "_")}.db`;
}

async function openLocalDb(userId: string): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(localDbFileName(userId), {
    enableChangeListener: false,
  });

  await db.execAsync(LOCAL_DB_SCHEMA_SQL);
  await migrateLegacyAsyncStorageIfNeeded(db, userId);

  await db.runAsync(
    `INSERT OR IGNORE INTO meta (key, value) VALUES ('schema_version', '1')`,
  );
  await migrateLocalDbSchema(db);

  dbCache.set(userId, db);
  return db;
}

export async function getLocalDb(userId: string): Promise<SQLite.SQLiteDatabase> {
  const cached = dbCache.get(userId);
  if (cached) {
    await migrateLocalDbSchema(cached);
    return cached;
  }

  let inflight = opening.get(userId);
  if (!inflight) {
    inflight = openLocalDb(userId).finally(() => {
      opening.delete(userId);
    });
    opening.set(userId, inflight);
  }

  return inflight;
}

export async function closeLocalDb(userId: string): Promise<void> {
  const db = dbCache.get(userId);
  if (db) {
    await db.closeAsync();
    dbCache.delete(userId);
  }
  opening.delete(userId);
}
