import type { GuruSchoolLevel, GuruWorkspace } from "@/lib/types";

export const SCHOOL_LEVEL_OPTIONS: {
  key: GuruSchoolLevel;
  label: string;
}[] = [
  { key: "sd", label: "SD" },
  { key: "smp", label: "SMP" },
  { key: "sma", label: "SMA" },
  { key: "smk", label: "SMK" },
  { key: "madrasah", label: "Madrasah" },
  { key: "lainnya", label: "Lainnya" },
];

const LEVEL_LABEL: Record<GuruSchoolLevel, string> = {
  sd: "SD",
  smp: "SMP",
  sma: "SMA",
  smk: "SMK",
  madrasah: "Madrasah",
  lainnya: "Lainnya",
};

export function formatSchoolLevel(
  level: GuruSchoolLevel | null | undefined,
): string | undefined {
  if (!level) return undefined;
  return LEVEL_LABEL[level];
}

export function formatWorkspaceLocation(w: GuruWorkspace): string | undefined {
  const parts: string[] = [];
  const level = formatSchoolLevel(w.schoolLevel);
  if (level) parts.push(level);
  if (w.city?.trim()) parts.push(w.city.trim());
  if (w.province?.trim()) parts.push(w.province.trim());
  if (parts.length === 0) return undefined;
  return parts.join(" · ");
}

export function formatWorkspaceStatsLine(stats: {
  classCount: number;
  subjectCount: number;
  activeStudentCount: number;
}): string {
  return `${stats.classCount} kelas · ${stats.subjectCount} mata pelajaran · ${stats.activeStudentCount} siswa`;
}
