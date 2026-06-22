import {
  buildGuruPeriodRecapXlsx,
  guruRecapExportFilename,
} from "@/lib/recap-xlsx";
import { getAppLocale, translate } from "@/lib/i18n/translations";
import { hasCloudSubscription } from "@/lib/storage-mode";
import { shareXlsxFile } from "@/lib/xlsx-share";
import type { GuruPeriodRecap } from "@/lib/types";

export type RecapExportParams = {
  workspaceId: string;
  classId: string;
  recap: GuruPeriodRecap;
  weekDate: string;
  month: string;
  semesterYear: number;
  semesterType: "ganjil" | "genap";
  academicStartYear: number;
  subjectName?: string | null;
};

function exportAnchor(recap: GuruPeriodRecap, input: RecapExportParams): string {
  switch (recap.periodType) {
    case "weekly":
      return input.weekDate;
    case "monthly":
      return input.month;
    case "semester":
      return `${input.semesterType}_${input.semesterYear}`;
    case "academicYear":
      return String(input.academicStartYear);
    default:
      return input.weekDate;
  }
}

export async function exportLocalRecapXlsx(
  recap: GuruPeriodRecap,
  anchor: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const locale = await getAppLocale();
  try {
    const buffer = await buildGuruPeriodRecapXlsx(recap);
    const filename = guruRecapExportFilename(recap, anchor);
    return await shareXlsxFile(
      buffer,
      filename,
      translate(locale, "export.shareRecap"),
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : translate(locale, "export.createFileFailed");
    return { ok: false, message };
  }
}

export async function exportAndShareGuruRecap(
  input: RecapExportParams,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const locale = await getAppLocale();

  if (!input.recap.students.length) {
    return { ok: false, message: translate(locale, "export.noData") };
  }

  const subscribed = await hasCloudSubscription();
  if (
    !subscribed &&
    input.recap.periodType !== "weekly" &&
    input.recap.periodType !== "monthly"
  ) {
    return {
      ok: false,
      message: translate(locale, "export.semesterRecapPro"),
    };
  }

  return exportLocalRecapXlsx(
    input.recap,
    exportAnchor(input.recap, input),
  );
}

/** @deprecated gunakan exportAndShareGuruRecap */
export async function downloadAndShareGuruRecapExport(
  input: Omit<RecapExportParams, "recap"> & { period: "weekly" | "monthly" },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const locale = await getAppLocale();
  return {
    ok: false,
    message: translate(locale, "export.loadRecapFirst"),
  };
}
