import "server-only";

import type { DbRow } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type {
  CharacterOptionDto,
  RankOptionDto,
  RoleOptionDto,
  TechniqueTypeOptionDto,
  VillageOptionDto,
  CatalogEntryDto,
} from "@/lib/types/catalog";

export type { RoleOptionDto, VillageOptionDto, CharacterOptionDto, RankOptionDto, TechniqueTypeOptionDto, CatalogEntryDto };

export type UpdateVillageInput = { villageId: string; name: string };
export type UpdateCharacterInput = { characterId: string; name: string; avatarUrl: string | null };

class CatalogsRepository {
  private supabasePromise: Promise<TypedSupabaseClient> | null = null;

  private async getSupabase(): Promise<TypedSupabaseClient> {
    if (!this.supabasePromise) {
      this.supabasePromise = createClient().catch((err) => { this.supabasePromise = null; throw err; });
    }
    return this.supabasePromise;
  }

  async listRoleOptions(): Promise<RoleOptionDto[]> {
    const client = await this.getSupabase();
    const { data, error } = await client.from("roles").select("id,name").order("name", { ascending: true });
    if (error) return [];
    return ((data ?? []) as Array<Pick<DbRow<"roles">, "id" | "name">>).map((r) => ({ id: r.id, name: r.name }));
  }

  async getRoleByName(name: string): Promise<RoleOptionDto | null> {
    const client = await this.getSupabase();
    const { data, error } = await client.from("roles").select("id,name").eq("name", name).maybeSingle();
    if (error || !data) return null;
    const r = data as Pick<DbRow<"roles">, "id" | "name">;
    return { id: r.id, name: r.name };
  }

  async listVillageOptions(): Promise<VillageOptionDto[]> {
    const client = await this.getSupabase();
    const { data, error } = await client.from("villages").select("id,name").order("name", { ascending: true });
    if (error) return [];
    return ((data ?? []) as Array<Pick<DbRow<"villages">, "id" | "name">>).map((r) => ({ id: r.id, name: r.name }));
  }

  async existsVillageById(villageId: string): Promise<boolean> {
    const client = await this.getSupabase();
    const { data, error } = await client.from("villages").select("id").eq("id", villageId).maybeSingle();
    if (error || !data) return false;
    return Boolean((data as Pick<DbRow<"villages">, "id">).id);
  }

  async createVillage(name: string): Promise<VillageOptionDto | null> {
    const client = await this.getSupabase();
    const { data, error } = await client.from("villages").insert({ name } as never).select("id,name").maybeSingle();
    if (error || !data) return null;
    const r = data as Pick<DbRow<"villages">, "id" | "name">;
    return { id: r.id, name: r.name };
  }

  async updateVillage(input: UpdateVillageInput): Promise<boolean> {
    const client = await this.getSupabase();
    const { error } = await client.from("villages").update({ name: input.name } as never).eq("id", input.villageId);
    return !error;
  }

  async deleteVillage(villageId: string): Promise<boolean> {
    const client = await this.getSupabase();
    const { error } = await client.from("villages").delete().eq("id", villageId);
    return !error;
  }

  async listCharacterOptions(): Promise<CharacterOptionDto[]> {
    const client = await this.getSupabase();
    const { data, error } = await client.from("characters").select("id,name,avatar_url").order("name", { ascending: true });
    if (error) return [];
    return ((data ?? []) as Array<Pick<DbRow<"characters">, "id" | "name" | "avatar_url">>).map((r) => ({
      id: r.id, name: r.name, avatarUrl: r.avatar_url,
    }));
  }

  async existsCharacterById(characterId: string): Promise<boolean> {
    const client = await this.getSupabase();
    const { data, error } = await client.from("characters").select("id").eq("id", characterId).maybeSingle();
    if (error || !data) return false;
    return Boolean((data as Pick<DbRow<"characters">, "id">).id);
  }

  async createCharacter(name: string, avatarUrl: string | null): Promise<CharacterOptionDto | null> {
    const client = await this.getSupabase();
    const { data, error } = await client.from("characters").insert({ name, avatar_url: avatarUrl } as never).select("id,name,avatar_url").maybeSingle();
    if (error || !data) return null;
    const r = data as Pick<DbRow<"characters">, "id" | "name" | "avatar_url">;
    return { id: r.id, name: r.name, avatarUrl: r.avatar_url };
  }

  async updateCharacter(input: UpdateCharacterInput): Promise<boolean> {
    const client = await this.getSupabase();
    const { error } = await client.from("characters").update({ name: input.name, avatar_url: input.avatarUrl } as never).eq("id", input.characterId);
    return !error;
  }

  async deleteCharacter(characterId: string): Promise<boolean> {
    const client = await this.getSupabase();
    const { error } = await client.from("characters").delete().eq("id", characterId);
    return !error;
  }

  async listRankOptions(): Promise<RankOptionDto[]> {
    const client = await this.getSupabase();
    const { data, error } = await client.from("ranks").select("id,value").order("value", { ascending: true });
    if (error) return [];
    return ((data ?? []) as Array<Pick<DbRow<"ranks">, "id" | "value">>).map((r) => ({ id: r.id, value: r.value }));
  }

  async listTechniqueTypeOptions(): Promise<TechniqueTypeOptionDto[]> {
    const client = await this.getSupabase();
    const { data, error } = await client.from("technique_types").select("id,code,name").order("name", { ascending: true });
    if (error) return [];
    return ((data ?? []) as Array<Pick<DbRow<"technique_types">, "id" | "code" | "name">>).map((r) => ({
      id: r.id, code: r.code, name: r.name,
    }));
  }

  async listTargetOptions(): Promise<CatalogEntryDto[]> {
    const client = await this.getSupabase();
    const { data, error } = await client.from("targets").select("id,code,description").order("code", { ascending: true });
    if (error) return [];
    return ((data ?? []) as Array<Pick<DbRow<"targets">, "id" | "code" | "description">>).map((r) => ({
      id: r.id, code: r.code, description: r.description,
    }));
  }

  async listEscapeOptions(): Promise<CatalogEntryDto[]> {
    const client = await this.getSupabase();
    const { data, error } = await client.from("escapes").select("id,code,description").order("code", { ascending: true });
    if (error) return [];
    return ((data ?? []) as Array<Pick<DbRow<"escapes">, "id" | "code" | "description">>).map((r) => ({
      id: r.id, code: r.code, description: r.description,
    }));
  }
}

export const catalogsRepository = new CatalogsRepository();