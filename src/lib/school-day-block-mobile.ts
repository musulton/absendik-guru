import { supabase } from "@/lib/supabase";

/** 0 = Minggu … 6 = Sabtu (JavaScript Date.getDay). */
type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const WEEKDAY_LABELS: Record<WeekdayIndex, string> = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};

const DEFAULT_WEEKLY_OFF_DAYS: WeekdayIndex[] = [0];

export type SchoolDayBlockReason = "holiday" | "weekly_off";

export type SchoolDayBlock = {
  reason: SchoolDayBlockReason;
  label: string;
  date: string;
};

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getWeekdayIndex(date: string): WeekdayIndex {
  return parseLocalDate(date).getDay() as WeekdayIndex;
}

function getWeekdayLabel(date: string): string {
  return WEEKDAY_LABELS[getWeekdayIndex(date)] ?? "—";
}

function normalizeWeeklyOffDays(days: number[] | null | undefined): WeekdayIndex[] {
  if (!days?.length) return [...DEFAULT_WEEKLY_OFF_DAYS];
  const valid = new Set(Object.keys(WEEKDAY_LABELS).map(Number));
  const unique = [...new Set(days.filter((d) => valid.has(d)))] as WeekdayIndex[];
  return unique.sort((a, b) => a - b);
}

function isWeeklyOffDay(weeklyOffDays: number[], date: string): boolean {
  return normalizeWeeklyOffDays(weeklyOffDays).includes(getWeekdayIndex(date));
}

function normalizeSchoolPlan(value: string | null | undefined): "plus" | "premium" {
  if (!value) return "plus";
  const normalized = value.toLowerCase();
  if (
    normalized === "premium" ||
    normalized === "lengkap" ||
    normalized === "besar" ||
    normalized === "lembaga"
  ) {
    return "premium";
  }
  return "plus";
}

export function formatSchoolDayBlockMessage(block: SchoolDayBlock): string {
  if (block.reason === "weekly_off") {
    return `${getWeekdayLabel(block.date)} libur mingguan sekolah. Absensi tidak dapat diinput.`;
  }
  return `Hari ini libur: ${block.label}. Absensi tidak dapat diinput.`;
}

async function schoolHasHolidayCalendar(schoolId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("schools")
    .select("plan")
    .eq("id", schoolId)
    .maybeSingle();
  if (error) return false;
  return normalizeSchoolPlan(data?.plan) === "premium";
}

/** Cek libur sekolah — selaras `resolveSchoolDayBlock` di backend (paket Lengkap). */
export async function resolveSchoolDayBlockMobile(
  schoolId: string,
  date: string,
): Promise<SchoolDayBlock | null> {
  if (!(await schoolHasHolidayCalendar(schoolId))) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) return null;

  const isoDate = date.trim();

  const { data: exception } = await supabase
    .from("school_calendar_days")
    .select("id")
    .eq("school_id", schoolId)
    .eq("kind", "special_session")
    .eq("calendar_date", isoDate)
    .maybeSingle();

  if (exception) return null;

  const { data: holiday } = await supabase
    .from("school_calendar_days")
    .select("label")
    .eq("school_id", schoolId)
    .eq("kind", "holiday")
    .eq("calendar_date", isoDate)
    .not("holiday_type", "is", null)
    .maybeSingle();

  if (holiday?.label) {
    return { reason: "holiday", label: holiday.label, date: isoDate };
  }

  const { data: school } = await supabase
    .from("schools")
    .select("weekly_off_days")
    .eq("id", schoolId)
    .maybeSingle();

  const weeklyOffDays = (school?.weekly_off_days as number[] | undefined) ?? null;
  if (isWeeklyOffDay(weeklyOffDays ?? [], isoDate)) {
    return {
      reason: "weekly_off",
      label: getWeekdayLabel(isoDate),
      date: isoDate,
    };
  }

  return null;
}
