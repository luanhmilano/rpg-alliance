import "server-only";

import type { DbRow } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { PlayerProfileDto, UpdatePlayerByKageInput } from "@/lib/types/player";

export type { PlayerProfileDto, UpdatePlayerByKageInput };

class PlayersRepository {
  private supabasePromise: Promise<TypedSupabaseClient> | null = null;

  private async getSupabase(): Promise<TypedSupabaseClient> {
    if (!this.supabasePromise) {
      this.supabasePromise = createClient().catch((error) => {
        this.supabasePromise = null;
        throw error;
      });
    }

    return this.supabasePromise;
  }

  private mapPlayerWithRelations(row: {
    id: string;
    email: string;
    phone: string | null;
    approved: boolean;
    role_id: string;
    village_id: string | null;
    character_id: string | null;
    created_at: string;
    updated_at: string;
    roles: { name?: string } | { name?: string }[] | null;
    villages: { name?: string } | { name?: string }[] | null;
    characters: { name?: string } | { name?: string }[] | null;
  }): PlayerProfileDto {
    const roleRelation = Array.isArray(row.roles) ? row.roles[0] : row.roles;
    const villageRelation = Array.isArray(row.villages) ? row.villages[0] : row.villages;
    const characterRelation = Array.isArray(row.characters) ? row.characters[0] : row.characters;

    const roleName = roleRelation?.name === "KAGE" ? "KAGE" : "MEMBER";

    const approvalStatus = row.approved ? "APPROVED" : "PENDING";

    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      approved: row.approved,
      approvalStatus,
      role: roleName,
      roleId: row.role_id,
      villageId: row.village_id,
      villageName: villageRelation?.name ?? "-",
      characterId: row.character_id,
      characterName: characterRelation?.name ?? "-",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getByIdWithRelations(playerId: string): Promise<PlayerProfileDto | null> {
    const client = await this.getSupabase();
    const { data, error } = await client
      .from("players")
      .select("id,email,phone,approved,role_id,village_id,character_id,created_at,updated_at,roles(name),villages(name),characters(name)")
      .eq("id", playerId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return this.mapPlayerWithRelations(data as never);
  }

  async listWithRelations(): Promise<PlayerProfileDto[]> {
    const client = await this.getSupabase();
    const { data, error } = await client
      .from("players")
      .select("id,email,phone,approved,role_id,village_id,character_id,created_at,updated_at,roles(name),villages(name),characters(name)")
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return (data ?? []).map((row) => this.mapPlayerWithRelations(row as never));
  }

  async updateByKage(input: UpdatePlayerByKageInput): Promise<boolean> {
    const client = await this.getSupabase();
    const { error } = await client
      .from("players")
      .update({
        role_id: input.roleId,
        approved: input.approved,
        phone: input.phone,
        village_id: input.villageId,
        character_id: input.characterId,
      } as never)
      .eq("id", input.playerId);
    return !error;
  }

  async updatePhone(playerId: string, phone: string | null): Promise<boolean> {
    const client = await this.getSupabase();
    const { error } = await client
      .from("players")
      .update({ phone } as never)
      .eq("id", playerId);
    return !error;
  }

  async setApprovalForRole(playerId: string, roleId: string, approved: boolean): Promise<boolean> {
    const client = await this.getSupabase();
    const { error } = await client
      .from("players")
      .update({ approved } as never)
      .eq("id", playerId)
      .eq("role_id", roleId);
    return !error;
  }

  async getApprovedById(playerId: string): Promise<{ approved: boolean } | null> {
    const client = await this.getSupabase();
    const { data, error } = await client
      .from("players")
      .select("approved")
      .eq("id", playerId)
      .maybeSingle();

    if (error || !data) return null;
    const row = data as Pick<DbRow<"players">, "approved">;
    return { approved: Boolean(row.approved) };
  }
}

export const playersRepository = new PlayersRepository();
