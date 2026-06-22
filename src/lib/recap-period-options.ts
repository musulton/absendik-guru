import { addMonthsYyyymm } from "@/lib/dates";
import { getGuruMonthRange } from "@/lib/month-range";
import type { FilterOption } from "@/components/ui/FilterPicker";

/** Opsi bulan untuk picker rekap (terbaru di atas). */
export function buildRecapMonthOptions(
  anchorYyyymm: string,
  back = 24,
  forward = 0,
): FilterOption[] {
  const keys: string[] = [];
  for (let i = forward; i >= -back; i--) {
    keys.push(addMonthsYyyymm(anchorYyyymm, i));
  }
  return keys.map((yyyymm) => ({
    key: yyyymm,
    label: getGuruMonthRange(yyyymm).monthLabel,
  }));
}
