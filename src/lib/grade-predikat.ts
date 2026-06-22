/** Predikat nilai per sekolah — selaras dengan src/lib/grade-predikat.ts (web). */

export type GradeBand = "sangat_baik" | "baik" | "cukup" | "kurang";

export const GRADE_BAND_ORDER: GradeBand[] = [
  "sangat_baik",
  "baik",
  "cukup",
  "kurang",
];

export type GradePredikatBandConfig = {
  id: GradeBand;
  label: string;
  minScore: number;
};

export type SchoolGradePredikatSettings = {
  bands: GradePredikatBandConfig[];
};

export const DEFAULT_GRADE_PREDIKAT: SchoolGradePredikatSettings = {
  bands: [
    { id: "sangat_baik", label: "Sangat baik", minScore: 90 },
    { id: "baik", label: "Baik", minScore: 80 },
    { id: "cukup", label: "Cukup", minScore: 70 },
    { id: "kurang", label: "Kurang", minScore: 0 },
  ],
};

function sortBandsByMinDesc(bands: GradePredikatBandConfig[]) {
  return [...bands].sort((a, b) => b.minScore - a.minScore);
}

function isGradeBand(value: unknown): value is GradeBand {
  return (
    value === "sangat_baik" ||
    value === "baik" ||
    value === "cukup" ||
    value === "kurang"
  );
}

export function parseGradePredikatSettings(
  raw: unknown,
): SchoolGradePredikatSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_GRADE_PREDIKAT;
  const bandsRaw = (raw as { bands?: unknown }).bands;
  if (!Array.isArray(bandsRaw)) return DEFAULT_GRADE_PREDIKAT;

  const parsed = bandsRaw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const band = row as Record<string, unknown>;
      if (!isGradeBand(band.id)) return null;
      const label = String(band.label ?? "").trim();
      const minScore = Number(band.minScore);
      if (!label || !Number.isFinite(minScore)) return null;
      if (band.id === "kurang" && minScore !== 0) return null;
      return {
        id: band.id,
        label,
        minScore: Math.round(minScore),
      } satisfies GradePredikatBandConfig;
    })
    .filter((row): row is GradePredikatBandConfig => row !== null);

  if (parsed.length !== GRADE_BAND_ORDER.length) {
    return DEFAULT_GRADE_PREDIKAT;
  }

  const byId = new Map(parsed.map((band) => [band.id, band]));
  for (const id of GRADE_BAND_ORDER) {
    if (!byId.has(id)) return DEFAULT_GRADE_PREDIKAT;
  }

  const ordered = GRADE_BAND_ORDER.map((id) => byId.get(id)!);
  const sorted = sortBandsByMinDesc(ordered);
  for (let i = 0; i < sorted.length - 1; i += 1) {
    if (sorted[i].minScore <= sorted[i + 1].minScore) {
      return DEFAULT_GRADE_PREDIKAT;
    }
  }

  return { bands: ordered };
}

export function validateGradePredikatForm(
  settings: SchoolGradePredikatSettings,
): string | null {
  const byId = Object.fromEntries(
    settings.bands.map((band) => [band.id, band]),
  ) as Partial<Record<GradeBand, GradePredikatBandConfig>>;

  for (const id of GRADE_BAND_ORDER) {
    const band = byId[id];
    if (!band?.label?.trim()) return "Semua label predikat wajib diisi.";
    if (band.label.trim().length > 40) {
      return "Label predikat maksimal 40 karakter.";
    }
  }

  const sangat = byId.sangat_baik?.minScore;
  const baik = byId.baik?.minScore;
  const cukup = byId.cukup?.minScore;
  if (
    byId.kurang?.minScore !== 0 ||
    sangat == null ||
    baik == null ||
    cukup == null ||
    !(sangat > baik && baik > cukup && cukup >= 1 && sangat <= 100)
  ) {
    return "Ambang batas harus turun: Sangat baik > Baik > Cukup (1–100). Kurang otomatis di bawah Cukup.";
  }

  return null;
}

export function gradePredikatToJson(
  settings: SchoolGradePredikatSettings,
): SchoolGradePredikatSettings {
  return parseGradePredikatSettings(settings);
}

export function parseGradePredikatDraft(
  draft: SchoolGradePredikatSettings,
): SchoolGradePredikatSettings | { error: string } {
  const error = validateGradePredikatForm(draft);
  if (error) return { error };
  return parseGradePredikatSettings(draft);
}

export function getGradeBandForScore(
  score: number,
  settings: SchoolGradePredikatSettings = DEFAULT_GRADE_PREDIKAT,
): GradeBand {
  const sorted = sortBandsByMinDesc(settings.bands);
  for (const band of sorted) {
    if (score >= band.minScore) return band.id;
  }
  return "kurang";
}

export function getGradeBandLabel(
  band: GradeBand,
  settings: SchoolGradePredikatSettings = DEFAULT_GRADE_PREDIKAT,
): string {
  return (
    settings.bands.find((row) => row.id === band)?.label ??
    DEFAULT_GRADE_PREDIKAT.bands.find((row) => row.id === band)?.label ??
    band
  );
}

export function formatGradePredikatRange(
  band: GradeBand,
  settings: SchoolGradePredikatSettings = DEFAULT_GRADE_PREDIKAT,
): string {
  const sorted = sortBandsByMinDesc(settings.bands);
  const idx = sorted.findIndex((row) => row.id === band);
  if (idx < 0) return "—";
  const min = sorted[idx].minScore;
  if (idx === 0) return `≥${min}`;
  if (band === "kurang") {
    const cukupMin =
      settings.bands.find((row) => row.id === "cukup")?.minScore ?? min;
    return `<${cukupMin}`;
  }
  return `${min}–${sorted[idx - 1].minScore - 1}`;
}
