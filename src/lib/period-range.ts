/** Rentang semester & tahun ajaran — selaras dengan src/lib/period.ts (web). */

export type SemesterType = "ganjil" | "genap";

export type SemesterValue = {
  year: number;
  semester: SemesterType;
};

export type AcademicYearValue = {
  startYear: number;
};

export function currentSemester(): SemesterValue {
  const now = new Date();
  return now.getMonth() >= 6
    ? { year: now.getFullYear(), semester: "ganjil" }
    : { year: now.getFullYear(), semester: "genap" };
}

export function semesterLabel(sv: SemesterValue): string {
  const academicStart = sv.semester === "ganjil" ? sv.year : sv.year - 1;
  const name = sv.semester === "ganjil" ? "Ganjil" : "Genap";
  return `Semester ${name} ${academicStart}/${academicStart + 1}`;
}

export function semesterRange(sv: SemesterValue): { start: string; end: string } {
  return sv.semester === "ganjil"
    ? { start: `${sv.year}-07-01`, end: `${sv.year}-12-31` }
    : { start: `${sv.year}-01-01`, end: `${sv.year}-06-30` };
}

export function prevSemester(sv: SemesterValue): SemesterValue {
  return sv.semester === "genap"
    ? { year: sv.year - 1, semester: "ganjil" }
    : { year: sv.year, semester: "genap" };
}

export function nextSemester(sv: SemesterValue): SemesterValue {
  return sv.semester === "ganjil"
    ? { year: sv.year + 1, semester: "genap" }
    : { year: sv.year, semester: "ganjil" };
}

export function currentAcademicYear(): AcademicYearValue {
  const now = new Date();
  return {
    startYear: now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1,
  };
}

export function academicYearLabel(ay: AcademicYearValue): string {
  return `Tahun Ajaran ${ay.startYear}/${ay.startYear + 1}`;
}

export function academicYearRange(ay: AcademicYearValue): {
  start: string;
  end: string;
} {
  return {
    start: `${ay.startYear}-07-01`,
    end: `${ay.startYear + 1}-06-30`,
  };
}

export function prevAcademicYear(ay: AcademicYearValue): AcademicYearValue {
  return { startYear: ay.startYear - 1 };
}

export function nextAcademicYear(ay: AcademicYearValue): AcademicYearValue {
  return { startYear: ay.startYear + 1 };
}
