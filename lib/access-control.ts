import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
    .select("id,email,phone,role_id,approved")
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

  // Get role name from role_id
  const { data: roleData } = await supabase
    .from("roles")
    .select("name")
    .eq("id", data.role_id)
    .single();

  const roleName = (roleData?.name as AppRole) ?? "MEMBER";
  const approvalStatus = data.approved ? "APPROVED" : "PENDING";

  return {
    id: data.id,
    email: data.email ?? null,
    phone: data.phone ?? null,
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
