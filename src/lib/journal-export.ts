import {
  buildGuruJournalRecapXlsx,
  guruJournalExportFilename,
} from "@/lib/journal-xlsx";
import { getAppLocale, translate } from "@/lib/i18n/translations";
import { hasCloudSubscription } from "@/lib/storage-mode";
import { shareXlsxFile } from "@/lib/xlsx-share";
import type { GuruTeachingJournalRecap } from "@/lib/types";

export type JournalExportParams = {
  className: string;
  recap: GuruTeachingJournalRecap;
  periodType: "weekly" | "monthly" | "semester";
  showSubjectColumn: boolean;
  weekDate: string;
  month: string;
  semesterYear: number;
  semesterType: "ganjil" | "genap";
};

function exportAnchor(input: JournalExportParams): string {
  switch (input.periodType) {
    case "weekly":
      return input.weekDate;
    case "monthly":
      return input.month;
    case "semester":
      return `${input.semesterType}_${input.semesterYear}`;
    default:
      return input.weekDate;
  }
}

export async function exportAndShareGuruJournalRecap(
  input: JournalExportParams,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const locale = await getAppLocale();

  if (!input.recap.entries.length) {
    return { ok: false, message: translate(locale, "export.noData") };
  }

  const subscribed = await hasCloudSubscription();
  if (
    !subscribed &&
    input.periodType !== "weekly" &&
    input.periodType !== "monthly"
  ) {
    return {
      ok: false,
      message: translate(locale, "export.semesterJournalPro"),
    };
  }

  try {
    const buffer = await buildGuruJournalRecapXlsx({
      className: input.className,
      recap: input.recap,
      showSubjectColumn: input.showSubjectColumn,
    });
    const filename = guruJournalExportFilename(
      input.className,
      input.periodType,
      exportAnchor(input),
    );
    return await shareXlsxFile(
      buffer,
      filename,
      translate(locale, "export.shareJournalRecap"),
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : translate(locale, "export.createFileFailed");
    return { ok: false, message };
  }
}
