import type { GuruWorkspace } from "@/lib/types";

/** Placeholder saat belum ada sekolah — hanya untuk WorkspaceProvider di Pengaturan. */
export const PLACEHOLDER_WORKSPACE: GuruWorkspace = {
  id: "__none__",
  name: "",
  city: null,
  npsn: null,
  province: null,
  address: null,
  schoolLevel: null,
  contactName: null,
  contactPhone: null,
  contactEmail: null,
  identityKey: null,
  attendanceMode: "class",
  role: "owner",
  createdAt: "1970-01-01T00:00:00.000Z",
};
