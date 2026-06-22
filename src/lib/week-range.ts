/** Senin–Minggu (ISO) dari tanggal acuan YYYY-MM-DD. */
export function getGuruWeekRange(dateStr: string): {
  start: string;
  end: string;
  weekNumber: number;
} {
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) throw new Error("INVALID_DATE");

  const day = d.getDay() === 0 ? 7 : d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - day + 1);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const fmt = (x: Date) => x.toISOString().slice(0, 10);
  const jan4 = new Date(mon.getFullYear(), 0, 4);
  const weekNumber =
    Math.round((mon.getTime() - jan4.getTime()) / (7 * 86400000)) + 1;

  return { start: fmt(mon), end: fmt(sun), weekNumber };
}
