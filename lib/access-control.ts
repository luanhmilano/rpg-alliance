import { redirect } from "next/navigation";

import type { DbRow } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    // User not found in players table - not fully registered yet
    if (error.code === "PGRST116") {
      return null;
    }

    return null;
  }

  if (!data) {
    return null;
  }

  const player = data as DbRow<"players">;

  // Get role name from role_id
  const { data: roleData } = await supabase
    .from("roles")
    .select("*")
    .eq("id", player.role_id)
    .single();

  const role = roleData as DbRow<"roles"> | null;
  const roleName = (role?.name as AppRole) ?? "MEMBER";
  const approvalStatus = player.approved ? "APPROVED" : "PENDING";

  return {
    id: player.id,
    email: player.email ?? null,
    phone: player.phone ?? null,
    role: roleName,
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
