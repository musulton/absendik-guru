export type LabelColorOption = {
  id: string;
  bg: string;
  text: string;
};

/** Palet warna label kelas & mata pelajaran (background + teks). */
export const LABEL_COLOR_OPTIONS: LabelColorOption[] = [
  { id: "teal", bg: "#ccfbf1", text: "#0f766e" },
  { id: "sky", bg: "#e0f2fe", text: "#0369a1" },
  { id: "cyan", bg: "#cffafe", text: "#0e7490" },
  { id: "indigo", bg: "#e0e7ff", text: "#4338ca" },
  { id: "navy", bg: "#dbeafe", text: "#1e3a8a" },
  { id: "violet", bg: "#ede9fe", text: "#6d28d9" },
  { id: "purple", bg: "#f3e8ff", text: "#7e22ce" },
  { id: "fuchsia", bg: "#fdf4ff", text: "#a21caf" },
  { id: "pink", bg: "#fce7f3", text: "#be185d" },
  { id: "rose", bg: "#ffe4e6", text: "#be123c" },
  { id: "orange", bg: "#ffedd5", text: "#c2410c" },
  { id: "amber", bg: "#fef3c7", text: "#b45309" },
  { id: "lime", bg: "#ecfccb", text: "#4d7c0f" },
  { id: "emerald", bg: "#d1fae5", text: "#047857" },
  { id: "brown", bg: "#fef3e2", text: "#92400e" },
  { id: "slate", bg: "#f1f5f9", text: "#334155" },
  { id: "mint", bg: "#ecfdf5", text: "#065f46" },
  { id: "coral", bg: "#fff1f2", text: "#e11d48" },
  { id: "grape", bg: "#f5f3ff", text: "#5b21b6" },
  { id: "olive", bg: "#f7fee7", text: "#3f6212" },
];

export const DEFAULT_LABEL_COLOR_ID = LABEL_COLOR_OPTIONS[0]!.id;

export function labelColorById(id: string): LabelColorOption {
  return (
    LABEL_COLOR_OPTIONS.find((c) => c.id === id) ?? LABEL_COLOR_OPTIONS[0]!
  );
}

/** Warna default stabil dari nama (kelas/mata pelajaran lama tanpa warna tersimpan). */
export function pickDefaultLabelColorId(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h + seed.charCodeAt(i) * (i + 1)) % LABEL_COLOR_OPTIONS.length;
  }
  return LABEL_COLOR_OPTIONS[h]!.id;
}

export function resolveLabelColor(
  colorId: string | null | undefined,
  seed: string,
): LabelColorOption {
  if (colorId) return labelColorById(colorId);
  return labelColorById(pickDefaultLabelColorId(seed));
}
