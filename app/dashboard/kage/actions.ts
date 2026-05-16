"use server";

import { revalidatePath } from "next/cache";

import { requireKageProfile } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";

function readNullableString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updatePlayerAction(formData: FormData) {
  await requireKageProfile();

  const playerId = formData.get("playerId");
  const roleId = formData.get("roleId");
  const approved = formData.get("approved");

  if (typeof playerId !== "string" || typeof roleId !== "string") {
    return;
  }

  const supabase = await createClient();

  await supabase
    .from("players")
    .update({
      role_id: roleId,
      approved: approved === "true",
      phone: readNullableString(formData, "phone"),
      village_id: readNullableString(formData, "villageId"),
      character_id: readNullableString(formData, "characterId"),
    })
    .eq("id", playerId);

  revalidatePath("/dashboard/kage");
  revalidatePath("/dashboard/profile");
  revalidatePath("/pending");
}

export async function createVillageAction(formData: FormData) {
  await requireKageProfile();

  const name = readNullableString(formData, "name");
  if (!name) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("villages").insert({ name });

  revalidatePath("/dashboard/kage");
}

export async function updateVillageAction(formData: FormData) {
  await requireKageProfile();

  const villageId = formData.get("villageId");
  const name = readNullableString(formData, "name");

  if (typeof villageId !== "string" || !name) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("villages").update({ name }).eq("id", villageId);

  revalidatePath("/dashboard/kage");
}

export async function deleteVillageAction(formData: FormData) {
  await requireKageProfile();

  const villageId = formData.get("villageId");
  if (typeof villageId !== "string") {
    return;
  }

  const supabase = await createClient();
  await supabase.from("villages").delete().eq("id", villageId);

  revalidatePath("/dashboard/kage");
}

export async function createCharacterAction(formData: FormData) {
  await requireKageProfile();

  const name = readNullableString(formData, "name");
  if (!name) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("characters").insert({
    name,
    avatar_url: readNullableString(formData, "avatarUrl"),
  });

  revalidatePath("/dashboard/kage");
}

export async function updateCharacterAction(formData: FormData) {
  await requireKageProfile();

  const characterId = formData.get("characterId");
  const name = readNullableString(formData, "name");

  if (typeof characterId !== "string" || !name) {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("characters")
    .update({
      name,
      avatar_url: readNullableString(formData, "avatarUrl"),
    })
    .eq("id", characterId);

  revalidatePath("/dashboard/kage");
}

export async function deleteCharacterAction(formData: FormData) {
  await requireKageProfile();

  const characterId = formData.get("characterId");
  if (typeof characterId !== "string") {
    return;
  }

  const supabase = await createClient();
  await supabase.from("characters").delete().eq("id", characterId);

  revalidatePath("/dashboard/kage");
}
