import { config } from "@/lib/config";

/** Selaras dengan src/lib/guru/quota-config.ts di backend. */
export type GuruStorageMode = "local" | "cloud";

export type GuruLimits = {
  maxWorkspaces: number;
  maxClasses: number;
  maxSubjects: number;
  maxActiveStudents: number;
};

export type GuruLimitsPayload = {
  maxWorkspaces: number | null;
  maxClasses: number | null;
  maxSubjects: number | null;
  maxActiveStudents: number | null;
};

export type GuruQuotaConfigPayload = {
  local: GuruLimitsPayload;
  pro: GuruLimitsPayload;
};

export const GURU_QUOTA_UNLIMITED = 1_000_000;

const UNLIMITED_TOKENS = new Set([
  "unlimited",
  "none",
  "null",
  "*",
  "∞",
  "inf",
  "infinity",
]);

const DEFAULTS = {
  local: {
    maxWorkspaces: 1,
    maxClasses: 5,
    maxSubjects: GURU_QUOTA_UNLIMITED,
    maxActiveStudents: 120,
  },
  pro: {
    maxWorkspaces: GURU_QUOTA_UNLIMITED,
    maxClasses: GURU_QUOTA_UNLIMITED,
    maxSubjects: GURU_QUOTA_UNLIMITED,
    maxActiveStudents: GURU_QUOTA_UNLIMITED,
  },
} satisfies Record<"local" | "pro", GuruLimits>;

let remoteConfig: GuruQuotaConfigPayload | null = null;

function readExpoEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function parseGuruQuotaEnv(
  raw: string | undefined,
  fallback: number | "unlimited",
): number {
  if (raw === undefined || raw === "") {
    return fallback === "unlimited"
      ? GURU_QUOTA_UNLIMITED
      : fallback;
  }

  const normalized = raw.trim().toLowerCase();
  if (UNLIMITED_TOKENS.has(normalized) || normalized === "-1") {
    return GURU_QUOTA_UNLIMITED;
  }

  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback === "unlimited"
      ? GURU_QUOTA_UNLIMITED
      : fallback;
  }

  return parsed >= GURU_QUOTA_UNLIMITED ? GURU_QUOTA_UNLIMITED : parsed;
}

export function isQuotaUnlimited(value: number): boolean {
  return value >= GURU_QUOTA_UNLIMITED;
}

function buildTierFromExpoEnv(tier: "local" | "pro"): GuruLimits {
  const prefix =
    tier === "local" ? "EXPO_PUBLIC_GURU_LOCAL" : "EXPO_PUBLIC_GURU_PRO";
  const defaults = DEFAULTS[tier];

  return {
    maxWorkspaces: parseGuruQuotaEnv(
      readExpoEnv(`${prefix}_MAX_WORKSPACES`),
      defaults.maxWorkspaces,
    ),
    maxClasses: parseGuruQuotaEnv(
      readExpoEnv(`${prefix}_MAX_CLASSES`),
      defaults.maxClasses,
    ),
    maxSubjects: parseGuruQuotaEnv(
      readExpoEnv(`${prefix}_MAX_SUBJECTS`),
      isQuotaUnlimited(defaults.maxSubjects) ? "unlimited" : defaults.maxSubjects,
    ),
    maxActiveStudents: parseGuruQuotaEnv(
      readExpoEnv(`${prefix}_MAX_STUDENTS`),
      isQuotaUnlimited(defaults.maxActiveStudents)
        ? "unlimited"
        : defaults.maxActiveStudents,
    ),
  };
}

export function deserializeGuruLimits(payload: GuruLimitsPayload): GuruLimits {
  return {
    maxWorkspaces: payload.maxWorkspaces ?? GURU_QUOTA_UNLIMITED,
    maxClasses: payload.maxClasses ?? GURU_QUOTA_UNLIMITED,
    maxSubjects: payload.maxSubjects ?? GURU_QUOTA_UNLIMITED,
    maxActiveStudents: payload.maxActiveStudents ?? GURU_QUOTA_UNLIMITED,
  };
}

export function getGuruLocalLimitsFromEnv(): GuruLimits {
  if (remoteConfig) return deserializeGuruLimits(remoteConfig.local);
  return buildTierFromExpoEnv("local");
}

export function getGuruProLimitsFromEnv(): GuruLimits {
  if (remoteConfig) return deserializeGuruLimits(remoteConfig.pro);
  return buildTierFromExpoEnv("pro");
}

export function getGuruLimitsForMode(mode: GuruStorageMode): GuruLimits {
  return mode === "local"
    ? getGuruLocalLimitsFromEnv()
    : getGuruProLimitsFromEnv();
}

export function setRemoteGuruQuotaConfig(payload: GuruQuotaConfigPayload | null) {
  remoteConfig = payload;
}

export async function refreshGuruQuotaConfigFromApi(): Promise<boolean> {
  if (!config.apiBaseUrl) return false;

  try {
    const response = await fetch(`${config.apiBaseUrl}/api/guru/v1/quota-config`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return false;

    const payload = (await response.json()) as GuruQuotaConfigPayload;
    if (!payload?.local || !payload?.pro) return false;

    remoteConfig = payload;
    return true;
  } catch {
    return false;
  }
}
