import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { playersRepository } from "@/server/repositories/players.repository";
import type { ActorContext } from "@/lib/types/common";
import { ApiError } from "@/lib/types/errors";

export type AppRole = "KAGE" | "MEMBER";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AppProfile = {
  id: string;
  email: string | null;
  phone: string | null;
  role: AppRole;
  approval_status: ApprovalStatus;
};

export async function getAuthSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function getCurrentProfile() {
  const user = await getAuthSession();

  if (!user) {
    return null;
  }

  const player = await playersRepository.getByIdWithRelations(user.id);
  if (!player) {
    return null;
  }

  const approvalStatus = player.approved ? "APPROVED" : "PENDING";

  return {
    id: player.id,
    email: player.email ?? null,
    phone: player.phone ?? null,
    role: player.role,
    approval_status: approvalStatus,
  } as AppProfile;
}

export async function requireAuthenticatedUser() {
  const user = await getAuthSession();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

export async function requireApprovedProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.approval_status !== "APPROVED") {
    redirect("/pending");
  }

  return profile;
}

export async function requireKageProfile() {
  const profile = await requireApprovedProfile();

  if (profile.role !== "KAGE") {
    redirect("/dashboard");
  }

  return profile;
}

export function requireApprovedActorContext(
  actor: ActorContext | null,
): asserts actor is ActorContext {
  if (!actor) {
    throw new ApiError("UNAUTHORIZED", "User is not authenticated");
  }

  if (actor.approvalStatus !== "APPROVED") {
    throw new ApiError("FORBIDDEN", "User is not approved");
  }
}

export function requireKageActorContext(
  actor: ActorContext | null,
): asserts actor is ActorContext {
  requireApprovedActorContext(actor);

  if (actor.role !== "KAGE") {
    throw new ApiError("FORBIDDEN", "Only KAGE users can mutate techniques");
  }
}
