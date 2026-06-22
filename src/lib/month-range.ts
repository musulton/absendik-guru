const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function getGuruMonthRange(input: string): {
  start: string;
  end: string;
  yyyymm: string;
  monthLabel: string;
} {
  let y: number;
  let m: number;

  if (/^\d{4}-\d{2}$/.test(input.trim())) {
    const parts = input.trim().split("-").map(Number);
    y = parts[0];
    m = parts[1];
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
    const parts = input.trim().split("-").map(Number);
    y = parts[0];
    m = parts[1];
  } else {
    throw new Error("INVALID_DATE");
  }

  if (m < 1 || m > 12) throw new Error("INVALID_DATE");

  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const yyyymm = `${y}-${String(m).padStart(2, "0")}`;

  return {
    start,
    end,
    yyyymm,
    monthLabel: `${BULAN[m - 1]} ${y}`,
  };
}
