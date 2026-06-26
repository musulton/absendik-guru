import { sanitizeXlsxFilename } from "@/lib/xlsx-share";
import type { GuruTeachingJournalRecap } from "@/lib/types";

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

export type JournalRecapExportInput = {
  className: string;
  recap: GuruTeachingJournalRecap;
  showSubjectColumn: boolean;
};

function buildJournalSheet(wb: Workbook, input: JournalRecapExportInput) {
  const { recap, className, showSubjectColumn } = input;
  const ws = wb.addWorksheet("Jurnal");
  const entries = [...recap.entries].sort((a, b) =>
    a.sessionDate.localeCompare(b.sessionDate),
  );

  const colWidths = showSubjectColumn
    ? [5, 14, 22, 36, 24, 36]
    : [5, 14, 36, 24, 36];
  colWidths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  const lastCol = colWidths.length;
  const lastColLetter = String.fromCharCode(64 + lastCol);
  ws.mergeCells(`A1:${lastColLetter}1`);
  const title = ws.getCell("A1");
  title.value = `REKAP JURNAL MENGAJAR — ${className} — ${recap.periodLabel}`;
  title.font = { name: "Arial", bold: true, size: 13 };
  title.alignment = { horizontal: "center", vertical: "middle" };

  ws.mergeCells(`A2:${lastColLetter}2`);
  const info = ws.getCell("A2");
  const subjectNote = recap.subjectName
    ? `  |  Mata pelajaran: ${recap.subjectName}`
    : "";
  info.value = `Periode: ${recap.startDate} s/d ${recap.endDate}  |  Pertemuan: ${recap.totalSessions}${subjectNote}`;
  info.font = { name: "Arial", size: 11 };

  let col = 1;
  hdr(ws, 3, col++, "NO");
  hdr(ws, 3, col++, "TANGGAL");
  if (showSubjectColumn) {
    hdr(ws, 3, col++, "MAPEL");
  }
  hdr(ws, 3, col++, "MATERI");
  hdr(ws, 3, col++, "METODE");
  hdr(ws, 3, col++, "CATATAN");

  entries.forEach((entry, idx) => {
    const r = 4 + idx;
    const bg = idx % 2 === 1 ? GRAY : "FFFFFF";
    let c = 1;
    dat(ws, r, c++, idx + 1, "center", bg);
    dat(ws, r, c++, entry.sessionDate, "center", bg);
    if (showSubjectColumn) {
      dat(ws, r, c++, entry.subjectName?.trim() || "-", "left", bg);
    }
    dat(ws, r, c++, entry.material?.trim() || "-", "left", bg);
    dat(ws, r, c++, entry.method?.trim() || "-", "left", bg);
    dat(ws, r, c++, entry.notes?.trim() || "-", "left", bg);
  });
}

export async function buildGuruJournalRecapXlsx(
  input: JournalRecapExportInput,
): Promise<ArrayBuffer> {
  const ExcelJS =
    (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  buildJournalSheet(wb, input);
  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}

export function guruJournalExportFilename(
  className: string,
  periodType: "weekly" | "monthly" | "semester",
  anchor: string,
): string {
  const base = sanitizeXlsxFilename(className);
  switch (periodType) {
    case "weekly":
      return `jurnal_mingguan_${base}_${anchor}.xlsx`;
    case "monthly": {
      const [y, m] = anchor.split("-").map(Number);
      const bulan = BULAN_ID[(m ?? 1) - 1] ?? "bulan";
      return `jurnal_bulanan_${base}_${bulan}${y}.xlsx`;
    }
    case "semester":
      return `jurnal_semester_${base}_${anchor}.xlsx`;
    default:
      return `jurnal_${base}.xlsx`;
  }
}
