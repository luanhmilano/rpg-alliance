import { getAuthSession, getCurrentProfile } from "@/lib/access-control";
import type { ActorContext } from "@/lib/types/common";

export async function getApiActorContext(): Promise<ActorContext | null> {
  const user = await getAuthSession();

  if (!user) {
    return null;
  }

  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  return {
    userId: user.id,
    role: profile.role,
    approvalStatus: profile.approval_status,
  };
}
