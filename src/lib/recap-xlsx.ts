import type { GuruPeriodRecap } from "@/lib/types";
import { sanitizeXlsxFilename } from "@/lib/xlsx-share";

function thinBorder() {
  const s = { style: "thin" as const };
  return { top: s, left: s, bottom: s, right: s };
}

const BLUE = "DDEEFF";
const YELLOW = "FFFF00";
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
  c.alignment = { horizontal: align, vertical: "middle" };
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
  c.border = thinBorder();
}

function num(ws: Worksheet, row: number, col: number, n: number) {
  const c = ws.getCell(row, col);
  c.value = n;
  c.font = { name: "Arial", italic: true, size: 11 };
  c.alignment = { horizontal: "center", vertical: "middle" };
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: YELLOW } };
  c.border = thinBorder();
}

function buildPeriodSheet(wb: Workbook, report: GuruPeriodRecap) {
  const ws = wb.addWorksheet("Rekap");
  [5, 30, 14, 10, 10, 10, 10, 12].forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  ws.mergeCells("A1:H1");
  const t = ws.getCell("A1");
  t.value = `REKAP ABSENSI — ${report.className} — ${report.periodLabel}`;
  t.font = { name: "Arial", bold: true, size: 13 };
  t.alignment = { horizontal: "center", vertical: "middle" };

  ws.mergeCells("A2:H2");
  const info = ws.getCell("A2");
  const subjectNote = report.subjectName
    ? `  |  Mata pelajaran: ${report.subjectName}`
    : "";
  info.value = `Periode: ${report.startDate} s/d ${report.endDate}  |  Hari tercatat: ${report.daysRecorded}/${report.totalSessions}  |  Siswa: ${report.students.length}${subjectNote}`;
  info.font = { name: "Arial", size: 11 };

  hdr(ws, 3, 1, "NO");
  hdr(ws, 3, 2, "NAMA SISWA");
  hdr(ws, 3, 3, "NIS");
  hdr(ws, 3, 4, "HADIR");
  hdr(ws, 3, 5, "SAKIT");
  hdr(ws, 3, 6, "IZIN");
  hdr(ws, 3, 7, "ALPHA");
  hdr(ws, 3, 8, "% HADIR");

  [1, 2, 3, 4, 5, 6, 7, 8].forEach((n2, i) => num(ws, 4, i + 1, n2));

  report.students.forEach((s, idx) => {
    const r = 5 + idx;
    const bg = idx % 2 === 1 ? GRAY : "FFFFFF";
    const alphaBg = s.counts.alpha > 0 ? "FFE8E8" : bg;
    dat(ws, r, 1, idx + 1, "center", bg);
    dat(ws, r, 2, s.fullName, "left", bg, true);
    dat(ws, r, 3, s.studentNumber ?? "-", "center", bg);
    dat(ws, r, 4, s.counts.hadir, "center", bg);
    dat(ws, r, 5, s.counts.sakit || "", "center", bg);
    dat(ws, r, 6, s.counts.izin || "", "center", bg);
    dat(ws, r, 7, s.counts.alpha || "", "center", alphaBg);
    dat(ws, r, 8, `${s.pctHadir}%`, "center", bg);
  });

  const rTot = 5 + report.students.length;
  ws.mergeCells(`A${rTot}:C${rTot}`);
  hdr(ws, rTot, 1, "TOTAL");
  hdr(ws, rTot, 4, report.totals.hadir);
  hdr(ws, rTot, 5, report.totals.sakit);
  hdr(ws, rTot, 6, report.totals.izin);
  hdr(ws, rTot, 7, report.totals.alpha);
  const pctTotal =
    report.daysRecorded > 0 && report.students.length > 0
      ? Math.round(
          (report.totals.hadir /
            (report.daysRecorded * report.students.length)) *
            100,
        )
      : 0;
  hdr(ws, rTot, 8, `${pctTotal}%`);
}

export async function buildGuruPeriodRecapXlsx(
  report: GuruPeriodRecap,
): Promise<ArrayBuffer> {
  const ExcelJS =
    (await import("exceljs")).default ?? (await import("exceljs"));
  const wb = new ExcelJS.Workbook();
  buildPeriodSheet(wb, report);
  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}

function sanitizeFilename(str: string): string {
  return sanitizeXlsxFilename(str);
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

export function guruRecapExportFilename(
  report: GuruPeriodRecap,
  anchor: string,
): string {
  const base = sanitizeFilename(report.className);
  switch (report.periodType) {
    case "weekly":
      return `rekap_mingguan_${base}_${anchor}.xlsx`;
    case "monthly": {
      const [y, m] = anchor.split("-").map(Number);
      const bulan = BULAN_ID[(m ?? 1) - 1] ?? "bulan";
      return `rekap_bulanan_${base}_${bulan}${y}.xlsx`;
    }
    case "semester":
      return `rekap_semester_${base}_${anchor}.xlsx`;
    case "academicYear":
      return `rekap_tahun_ajaran_${base}_${anchor}.xlsx`;
    default:
      return `rekap_${base}.xlsx`;
  }
}
