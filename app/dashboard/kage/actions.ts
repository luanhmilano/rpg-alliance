"use server";

import { revalidatePath } from "next/cache";

import { requireKageProfile } from "@/lib/access-control";
import { catalogsRepository } from "@/server/repositories/catalogs.repository";
import { playersService } from "@/server/services/players.service";

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

  await playersService.updateByKage({
    playerId,
    roleId,
    approved: approved === "true",
    phone: readNullableString(formData, "phone"),
    villageId: readNullableString(formData, "villageId"),
    characterId: readNullableString(formData, "characterId"),
  });

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

  await catalogsRepository.createVillage(name);

  revalidatePath("/dashboard/kage");
}

export async function updateVillageAction(formData: FormData) {
  await requireKageProfile();

  const villageId = formData.get("villageId");
  const name = readNullableString(formData, "name");

  if (typeof villageId !== "string" || !name) {
    return;
  }

  await catalogsRepository.updateVillage({
    villageId,
    name,
  });

  revalidatePath("/dashboard/kage");
}

export async function deleteVillageAction(formData: FormData) {
  await requireKageProfile();

  const villageId = formData.get("villageId");
  if (typeof villageId !== "string") {
    return;
  }

  await catalogsRepository.deleteVillage(villageId);

  revalidatePath("/dashboard/kage");
}

export async function createCharacterAction(formData: FormData) {
  await requireKageProfile();

  const name = readNullableString(formData, "name");
  if (!name) {
    return;
  }

  await catalogsRepository.createCharacter(name, readNullableString(formData, "avatarUrl"));

  revalidatePath("/dashboard/kage");
}

export async function updateCharacterAction(formData: FormData) {
  await requireKageProfile();

  const characterId = formData.get("characterId");
  const name = readNullableString(formData, "name");

  if (typeof characterId !== "string" || !name) {
    return;
  }

  await catalogsRepository.updateCharacter({
    characterId,
    name,
    avatarUrl: readNullableString(formData, "avatarUrl"),
  });

  revalidatePath("/dashboard/kage");
}

export async function deleteCharacterAction(formData: FormData) {
  await requireKageProfile();

  const characterId = formData.get("characterId");
  if (typeof characterId !== "string") {
    return;
  }

  await catalogsRepository.deleteCharacter(characterId);

  revalidatePath("/dashboard/kage");
}
