import { apiMe } from "@/lib/guru-repository";
import { getSchoolLinkSnapshot } from "@/lib/school-link";
import type { ApiResult, GuruSchoolLinkResponse, MeResponse } from "@/lib/types";

export type GuruSessionBootstrap = {
  link: GuruSchoolLinkResponse;
  proActive: boolean;
  me: ApiResult<MeResponse>;
};

/**
 * Setelah login berhasil: sinkron tier Pro/Gratis dari server,
 * refresh status school-link legacy, muat profil guru.
 */
export async function bootstrapGuruSession(
  accessToken?: string | null,
): Promise<GuruSessionBootstrap> {
  const me = await apiMe(accessToken, { force: true });

  return {
    link: getSchoolLinkSnapshot(),
    proActive: me.ok ? Boolean(me.data.cloudSubscriptionActive) : false,
    me,
  };
}
