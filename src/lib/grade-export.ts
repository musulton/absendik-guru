import {
  buildGuruGradePeriodRecapXlsx,
  buildGuruStudentGradeDetailXlsx,
  guruGradeExportFilename,
  guruStudentGradeExportFilename,
  type StudentGradeExportInput,
} from "@/lib/grade-xlsx";
import { getAppLocale, translate } from "@/lib/i18n/translations";
import { hasCloudSubscription } from "@/lib/storage-mode";
import { shareXlsxFile } from "@/lib/xlsx-share";
import type { GuruGradePeriodRecap } from "@/lib/types";

export type GradeExportParams = {
  recap: GuruGradePeriodRecap;
  weekDate: string;
  month: string;
  semesterYear: number;
  semesterType: "ganjil" | "genap";
  subjectName?: string | null;
};

function exportAnchor(recap: GuruGradePeriodRecap, input: GradeExportParams): string {
  switch (recap.periodType) {
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

export async function exportAndShareGuruGradeRecap(
  input: GradeExportParams,
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
      message: translate(locale, "export.semesterGradePro"),
    };
  }

  try {
    const buffer = await buildGuruGradePeriodRecapXlsx(input.recap);
    const filename = guruGradeExportFilename(
      input.recap,
      exportAnchor(input.recap, input),
    );
    return await shareXlsxFile(
      buffer,
      filename,
      translate(locale, "export.shareGradeRecap"),
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : translate(locale, "export.createFileFailed");
    return { ok: false, message };
  }
}

export async function exportAndShareStudentGradeDetail(
  input: StudentGradeExportInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const locale = await getAppLocale();

  if (!input.records.length) {
    return { ok: false, message: translate(locale, "export.noData") };
  }

  try {
    const buffer = await buildGuruStudentGradeDetailXlsx(input);
    const filename = guruStudentGradeExportFilename(
      input.className,
      input.fullName,
    );
    return await shareXlsxFile(
      buffer,
      filename,
      translate(locale, "export.shareGradeHistory"),
    );
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : translate(locale, "export.createFileFailed");
    return { ok: false, message };
  }
}
