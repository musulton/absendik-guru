import * as api from "@/lib/api";
import type { GuruWorkspace } from "@/lib/types";

export type GuruSchoolLeadRegistration = {
  name: string;
  city?: string | null;
  npsn?: string | null;
  attendanceMode?: "class" | "subject";
  schoolLevel?: string | null;
  province?: string | null;
  address?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
};

export function buildSchoolLeadRegistration(
  workspace: GuruWorkspace,
): GuruSchoolLeadRegistration {
  return {
    name: workspace.name,
    city: workspace.city,
    npsn: workspace.npsn,
    attendanceMode: workspace.attendanceMode,
    schoolLevel: workspace.schoolLevel ?? null,
    province: workspace.province,
    address: workspace.address,
    contactName: workspace.contactName,
    contactPhone: workspace.contactPhone,
    contactEmail: workspace.contactEmail,
  };
}

/**
 * Daftarkan metadata sekolah lokal ke server (lead penawaran Absendik Sekolah).
 * Berlaku Gratis & Pro — tidak memblokir UI jika jaringan gagal.
 */
export function registerWorkspaceLeadOnServer(workspace: GuruWorkspace): void {
  void api
    .apiRegisterGuruSchools([buildSchoolLeadRegistration(workspace)])
    .catch(() => undefined);
}
