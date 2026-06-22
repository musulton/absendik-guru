import AsyncStorage from "@react-native-async-storage/async-storage";
import * as schoolApi from "@/lib/school-api";
import { fetchSchoolLinkFromSupabase } from "@/lib/school-link-supabase";
import type {
  GuruClass,
  GuruSchoolLinkResponse,
  SchoolLinkSummary,
} from "@/lib/types";

export const SCHOOL_WORKSPACE_PREFIX = "school:";
const SCHOOL_LINK_PROBE_KEY = "guru_school_link_probe";
const UNLINKED: GuruSchoolLinkResponse = { linked: false };

let cachedLink: GuruSchoolLinkResponse | undefined;

/** Snapshot tanpa jaringan — untuk quota / tampilan awal paket gratis. */
export function getSchoolLinkSnapshot(): GuruSchoolLinkResponse {
  return cachedLink ?? UNLINKED;
}

export function isSchoolWorkspaceId(workspaceId: string): boolean {
  return workspaceId.startsWith(SCHOOL_WORKSPACE_PREFIX);
}

export function parseSchoolIdFromWorkspace(workspaceId: string): string | null {
  if (!isSchoolWorkspaceId(workspaceId)) return null;
  const schoolId = workspaceId.slice(SCHOOL_WORKSPACE_PREFIX.length).trim();
  return schoolId || null;
}

export function clearSchoolLinkCache() {
  cachedLink = undefined;
  void AsyncStorage.removeItem(SCHOOL_LINK_PROBE_KEY);
}

async function persistUnlinkedProbe() {
  await AsyncStorage.setItem(SCHOOL_LINK_PROBE_KEY, "unlinked");
}

async function clearUnlinkedProbe() {
  await AsyncStorage.removeItem(SCHOOL_LINK_PROBE_KEY);
}

export function setCachedSchoolLink(link: GuruSchoolLinkResponse) {
  if (!link.linked) {
    cachedLink = link;
    void persistUnlinkedProbe();
    return;
  }
  void clearUnlinkedProbe();
  if (cachedLink?.linked) {
    cachedLink = {
      ...cachedLink,
      ...link,
      classes: link.classes ?? cachedLink.classes,
      stats: link.stats ?? cachedLink.stats,
      timezone: link.timezone ?? cachedLink.timezone,
      gradePredikat: link.gradePredikat ?? cachedLink.gradePredikat,
    };
    return;
  }
  cachedLink = link;
}

function schoolLinkNeedsStatsRefresh(link: GuruSchoolLinkResponse): boolean {
  return link.linked && !link.stats;
}

export function getCachedSchoolLink(): GuruSchoolLinkResponse | null {
  if (cachedLink === undefined) return null;
  if (!cachedLink.linked) return null;
  return cachedLink;
}

export function getCachedSchoolClasses(): GuruClass[] | null {
  const link = getCachedSchoolLink();
  if (!link || !link.linked || !link.classes?.length) return null;
  return link.classes;
}

export function getSchoolLinkSummary(): SchoolLinkSummary | null {
  const link = getCachedSchoolLink();
  if (!link?.linked) return null;
  return {
    workspaceId: link.workspaceId,
    schoolId: link.schoolId,
    schoolName: link.schoolName,
    attendanceMode: link.attendanceMode,
    timezone: link.timezone,
    classCount: link.stats?.classCount ?? link.classes?.length,
    subjectCount: link.stats?.subjectCount,
    activeStudentCount: link.stats?.activeStudentCount,
  };
}

export async function refreshSchoolLink(): Promise<GuruSchoolLinkResponse> {
  const result = await schoolApi.apiFetchSchoolLink();
  if (result.ok && result.data.linked) {
    cachedLink = result.data;
    void clearUnlinkedProbe();
    return cachedLink;
  }

  const supabaseLink = await fetchSchoolLinkFromSupabase();
  if (supabaseLink?.linked) {
    cachedLink = supabaseLink;
    void clearUnlinkedProbe();
    return cachedLink;
  }

  if (result.ok) {
    cachedLink = UNLINKED;
    await persistUnlinkedProbe();
    return cachedLink;
  }

  if (
    result.error.code === "network" ||
    result.error.code === "invalid_response"
  ) {
    if (!cachedLink) {
      cachedLink = UNLINKED;
      await persistUnlinkedProbe();
    }
    return cachedLink;
  }
  if (cachedLink?.linked) return cachedLink;
  cachedLink = UNLINKED;
  await persistUnlinkedProbe();
  return cachedLink;
}

export function updateCachedSchoolClasses(classes: GuruClass[]) {
  if (cachedLink?.linked) {
    cachedLink = { ...cachedLink, classes };
  }
}

export async function ensureSchoolLinkLoaded(): Promise<GuruSchoolLinkResponse> {
  if (cachedLink !== undefined) {
    if (!cachedLink.linked) return cachedLink;
    if (schoolLinkNeedsStatsRefresh(cachedLink)) {
      return refreshSchoolLink();
    }
    return cachedLink;
  }

  const probed = await AsyncStorage.getItem(SCHOOL_LINK_PROBE_KEY);
  if (probed === "unlinked") {
    cachedLink = UNLINKED;
    return cachedLink;
  }

  return refreshSchoolLink();
}
