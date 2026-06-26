/** Layar / momen penempatan iklan. */
export type AdBannerPlacement =
  | "classes_list"
  | "workspace_picker"
  | "manage_hub"
  | "class_hub"
  | "class_picker"
  | "class_students"
  | "subject_list"
  | "recap";

/**
 * Interstitial hanya di titik transisi natural (setelah tugas selesai),
 * tidak pernah di tengah input.
 */
export type AdInterstitialPlacement =
  | "attendance_saved"
  | "grade_saved"
  | "recap_export"
  | "sync_complete";

/** Tidak boleh ada iklan banner — fokus kerja guru. */
export const AD_FREE_ZONES = [
  "attendance",
  "grade_entry",
  "teaching_journal",
  "student_notes",
  "create_student",
  "edit_student",
  "create_subject",
  "create_class",
  "edit_class",
  "create_workspace",
  "login",
] as const;

export type AdFreeZone = (typeof AD_FREE_ZONES)[number];
