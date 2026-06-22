import { sanitizeXlsxFilename } from "@/lib/xlsx-share";
import type { GuruGradePeriodRecap } from "@/lib/types";

function thinBorder() {
  const s = { style: "thin" as const };
  return { top: s, left: s, bottom: s, right: s };
}

const BLUE = "DDEEFF";
const GRAY = "F5F5F5";

type Worksheet = import("exceljs").Worksheet;
type Workbook = import("exceljs").Workbook;

function hdr(ws: Worksheet, row: number, col: number, value: string | number) {
  const c = ws.getCell(row, col);
  c.value = value;
  c.font = { name: "Arial", bold: true, size: 11 };
  c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } };
  c.border = thinBorder();
}

function dat(
  ws: Worksheet,
  row: number,
  col: number,
  value: string | number,
  align: "left" | "center" = "center",
  bg = "FFFFFF",
  bold = false,
) {
  const c = ws.getCell(row, col);
  c.value = value;
  c.font = { name: "Arial", bold, size: 11 };
  c.alignment = { horizontal: align, vertical: "middle", wrapText: true };
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
  c.border = thinBorder();
}

const BULAN_ID = [
  "januari",
  "februari",
  "maret",
  "april",
  "mei",
  "juni",
  "juli",
  "agustus",
  "september",
  "oktober",
  "november",
  "desember",
];

function buildGradeSheet(wb: Workbook, report: GuruGradePeriodRecap) {
  const ws = wb.addWorksheet("Nilai");
  const fixedCols = 3;
  const taskCount = report.tasks.length;
  const totalCols = fixedCols + Math.max(taskCount, 1);

  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 28;
  ws.getColumn(3).width = 14;
  for (let i = 0; i < Math.max(taskCount, 1); i++) {
    ws.getColumn(fixedCols + 1 + i).width = 14;
  }

  const lastColLetter = String.fromCharCode(64 + Math.min(totalCols, 26));
  ws.mergeCells(`A1:${lastColLetter}1`);
  const title = ws.getCell("A1");
  title.value = `REKAP NILAI — ${report.className} — ${report.periodLabel}`;
  title.font = { name: "Arial", bold: true, size: 13 };
  title.alignment = { horizontal: "center", vertical: "middle" };

  ws.mergeCells(`A2:${lastColLetter}2`);
  const info = ws.getCell("A2");
  const subjectNote = report.subjectName
    ? `  |  Mata pelajaran: ${report.subjectName}`
    : "";
  info.value = `Periode: ${report.startDate} s/d ${report.endDate}  |  Tugas: ${taskCount}  |  Siswa: ${report.students.length}${subjectNote}`;
  info.font = { name: "Arial", size: 11 };

  hdr(ws, 3, 1, "NO");
  hdr(ws, 3, 2, "NAMA SISWA");
  hdr(ws, 3, 3, "NIS");
  if (taskCount === 0) {
    hdr(ws, 3, 4, "—");
  } else {
    report.tasks.forEach((task, idx) => {
      hdr(ws, 3, fixedCols + 1 + idx, `${task.title}\n${task.taskDate}`);
    });
  }

  report.students.forEach((s, idx) => {
    const r = 4 + idx;
    const bg = idx % 2 === 1 ? GRAY : "FFFFFF";
    dat(ws, r, 1, idx + 1, "center", bg);
    dat(ws, r, 2, s.fullName, "left", bg, true);
    dat(ws, r, 3, s.studentNumber ?? "-", "center", bg);
    if (taskCount === 0) {
      dat(ws, r, 4, "-", "center", bg);
    } else {
      report.tasks.forEach((task, tIdx) => {
        const score = s.scores[task.taskId]?.trim() || "";
        dat(ws, r, fixedCols + 1 + tIdx, score, "center", bg);
      });
    }
  });
}

export async function buildGuruGradePeriodRecapXlsx(
  report: GuruGradePeriodRecap,
): Promise<ArrayBuffer> {
  const ExcelJS =
    (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  buildGradeSheet(wb, report);
  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}

export function guruGradeExportFilename(
  report: GuruGradePeriodRecap,
  anchor: string,
): string {
  const base = sanitizeXlsxFilename(report.className);
  switch (report.periodType) {
    case "weekly":
      return `nilai_mingguan_${base}_${anchor}.xlsx`;
    case "monthly": {
      const [y, m] = anchor.split("-").map(Number);
      const bulan = BULAN_ID[(m ?? 1) - 1] ?? "bulan";
      return `nilai_bulanan_${base}_${bulan}${y}.xlsx`;
    }
    case "semester":
      return `nilai_semester_${base}_${anchor}.xlsx`;
    default:
      return `nilai_${base}.xlsx`;
  }
}

export type StudentGradeExportInput = {
  className: string;
  fullName: string;
  studentNumber: string | null;
  subjectName?: string | null;
  records: { taskDate: string; title: string; score: string | null }[];
};

function buildStudentGradeSheet(wb: Workbook, input: StudentGradeExportInput) {
  const ws = wb.addWorksheet("Nilai Siswa");
  [5, 14, 36, 12].forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  ws.mergeCells("A1:D1");
  const title = ws.getCell("A1");
  title.value = `RIWAYAT NILAI — ${input.fullName} — ${input.className}`;
  title.font = { name: "Arial", bold: true, size: 13 };
  title.alignment = { horizontal: "center", vertical: "middle" };

  ws.mergeCells("A2:D2");
  const info = ws.getCell("A2");
  const subjectNote = input.subjectName
    ? `  |  Mata pelajaran: ${input.subjectName}`
    : "";
  const nis = input.studentNumber ? `  |  NIS: ${input.studentNumber}` : "";
  info.value = `Tugas tercatat: ${input.records.length}${nis}${subjectNote}`;
  info.font = { name: "Arial", size: 11 };

  hdr(ws, 3, 1, "NO");
  hdr(ws, 3, 2, "TANGGAL");
  hdr(ws, 3, 3, "JUDUL TUGAS");
  hdr(ws, 3, 4, "NILAI");

  input.records.forEach((rec, idx) => {
    const r = 4 + idx;
    const bg = idx % 2 === 1 ? GRAY : "FFFFFF";
    dat(ws, r, 1, idx + 1, "center", bg);
    dat(ws, r, 2, rec.taskDate, "center", bg);
    dat(ws, r, 3, rec.title, "left", bg, true);
    dat(ws, r, 4, rec.score?.trim() || "-", "center", bg);
  });
}

export async function buildGuruStudentGradeDetailXlsx(
  input: StudentGradeExportInput,
): Promise<ArrayBuffer> {
  const ExcelJS =
    (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  buildStudentGradeSheet(wb, input);
  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}

export function guruStudentGradeExportFilename(
  className: string,
  fullName: string,
): string {
  const cls = sanitizeXlsxFilename(className);
  const name = sanitizeXlsxFilename(fullName);
  return `nilai_siswa_${cls}_${name}.xlsx`;
}
