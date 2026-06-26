import type { TranslationKey } from "@/lib/i18n/translations";
import type { GuruStudentNote, GuruStudentNoteCategory } from "@/lib/types";

export type GuruStudentNotePresetKey =
  | "active_questions"
  | "helps_friends"
  | "discipline"
  | "needs_remedial"
  | "needs_support"
  | "understands_well"
  | "often_late"
  | "absent_unexcused"
  | "lacks_focus"
  | "disrupts_peers"
  | "good_attitude";

export const STUDENT_NOTE_PRESET_GROUPS: {
  category: Exclude<GuruStudentNoteCategory, "other">;
  presets: GuruStudentNotePresetKey[];
}[] = [
  {
    category: "positive",
    presets: ["active_questions", "helps_friends", "discipline"],
  },
  {
    category: "academic",
    presets: ["needs_remedial", "needs_support", "understands_well"],
  },
  {
    category: "attendance",
    presets: ["often_late", "absent_unexcused"],
  },
  {
    category: "attitude",
    presets: ["lacks_focus", "disrupts_peers", "good_attitude"],
  },
];

const PRESET_TO_CATEGORY = new Map<GuruStudentNotePresetKey, GuruStudentNoteCategory>(
  STUDENT_NOTE_PRESET_GROUPS.flatMap((group) =>
    group.presets.map((preset) => [preset, group.category]),
  ),
);

export const VALID_STUDENT_NOTE_CATEGORIES: GuruStudentNoteCategory[] = [
  "positive",
  "academic",
  "attendance",
  "attitude",
  "other",
];

export function isStudentNotePresetKey(
  raw: string | null | undefined,
): raw is GuruStudentNotePresetKey {
  return raw != null && PRESET_TO_CATEGORY.has(raw as GuruStudentNotePresetKey);
}

export function presetCategory(
  presetKey: GuruStudentNotePresetKey,
): GuruStudentNoteCategory {
  return PRESET_TO_CATEGORY.get(presetKey) ?? "other";
}

export function normalizeStudentNoteCategory(
  raw: string,
): GuruStudentNoteCategory {
  if (raw === "attention") return "attitude";
  if (raw === "counseling") return "other";
  return VALID_STUDENT_NOTE_CATEGORIES.includes(raw as GuruStudentNoteCategory)
    ? (raw as GuruStudentNoteCategory)
    : "other";
}

export function presetTranslationKey(
  presetKey: GuruStudentNotePresetKey,
): TranslationKey {
  return `studentNotes.preset.${presetKey}` as TranslationKey;
}

export function groupTranslationKey(
  category: GuruStudentNoteCategory,
): TranslationKey {
  return `studentNotes.group.${category}` as TranslationKey;
}

export function resolveStudentNoteText(
  note: GuruStudentNote,
  t: (key: TranslationKey) => string,
): string {
  if (note.category === "other" || !note.presetKey) {
    return note.noteText;
  }
  if (isStudentNotePresetKey(note.presetKey)) {
    return t(presetTranslationKey(note.presetKey));
  }
  return note.noteText;
}

export function noteDisplayDate(note: GuruStudentNote): string {
  return note.noteDate ?? note.createdAt.slice(0, 10);
}
