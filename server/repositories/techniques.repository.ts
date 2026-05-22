import "server-only";

import type { DbInsert, DbRow, DbUpdate } from "@/lib/db";
import {
  mapTechniqueCostRowToModel,
  mapTechniqueEffectRowToModel,
  mapTechniqueLimitsRowToModel,
  mapTechniquePriceRowToModel,
  mapTechniqueRowToModel,
} from "@/lib/modules/techniques/mappers";
import type {
  TechniqueAggregateModel,
  TechniqueCostModel,
  TechniqueEffectModel,
  TechniqueFilters,
  TechniqueKind,
  TechniqueLimitsModel,
  TechniqueModel,
  TechniquePriceModel,
} from "@/lib/modules/techniques/types";
import { createClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/types";

type TechniqueWithTypeCode = TechniqueModel & {
  techniqueTypeCode: string;
};

type TechniqueRowWithRelations = DbRow<"techniques"> & {
  technique_types: { code: string } | Array<{ code: string }> | null;
};

export type CreateTechniqueCoreInput = {
  kind: TechniqueKind;
  name: string;
  techniqueTypeId: string;
  rankId: string;
  link?: string | null;
  observations?: string | null;
  updatedBy?: string | null;
};

export type PatchTechniqueCoreInput = {
  kind?: TechniqueKind;
  name?: string;
  techniqueTypeId?: string;
  rankId?: string;
  link?: string | null;
  observations?: string | null;
  updatedBy?: string | null;
};

export class TechniqueRelationsRepository {
  constructor(private readonly getClient: () => Promise<TypedSupabaseClient>) {}

  async getCostsByTechniqueId(techniqueId: string): Promise<TechniqueCostModel[]> {
    const client = await this.getClient();
    const { data, error } = await client
      .from("technique_costs")
      .select("*")
      .eq("technique_id", techniqueId)
      .order("created_at", { ascending: true });

    if (error) {
      return [];
    }

    return (data ?? []).map((row) => mapTechniqueCostRowToModel(row));
  }

  async getPricesByTechniqueId(techniqueId: string): Promise<TechniquePriceModel[]> {
    const client = await this.getClient();
    const { data, error } = await client
      .from("technique_prices")
      .select("*")
      .eq("technique_id", techniqueId)
      .order("created_at", { ascending: true });

    if (error) {
      return [];
    }

    return (data ?? []).map((row) => mapTechniquePriceRowToModel(row));
  }

  async getLimitsByTechniqueId(techniqueId: string): Promise<TechniqueLimitsModel | null> {
    const client = await this.getClient();
    const { data, error } = await client
      .from("technique_limits")
      .select("*")
      .eq("technique_id", techniqueId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapTechniqueLimitsRowToModel(data);
  }

  async getEffectsByTechniqueId(techniqueId: string): Promise<TechniqueEffectModel[]> {
    const client = await this.getClient();
    const { data: effects, error: effectsError } = await client
      .from("technique_effects")
      .select("*")
      .eq("technique_id", techniqueId)
      .order("execution_order", { ascending: true, nullsFirst: false });

    const typedEffects = (effects ?? []) as DbRow<"technique_effects">[];

    if (effectsError || typedEffects.length === 0) {
      return [];
    }

    const effectIds = typedEffects.map((effect) => effect.id);
    const { data: values } = await client
      .from("technique_effect_values")
      .select("*")
      .in("effect_id", effectIds);

    const typedValues = (values ?? []) as DbRow<"technique_effect_values">[];
    const valueMap = new Map(typedValues.map((value) => [value.effect_id, value]));

    return typedEffects.map((effect) => mapTechniqueEffectRowToModel(effect, valueMap.get(effect.id)));
  }

  async getTargetIdsByTechniqueId(techniqueId: string): Promise<string[]> {
    const client = await this.getClient();
    const { data, error } = await client
      .from("technique_targets")
      .select("target_id")
      .eq("technique_id", techniqueId);

    if (error) {
      return [];
    }

    const rows = (data ?? []) as Array<Pick<DbRow<"technique_targets">, "target_id">>;
    return rows.map((row) => row.target_id);
  }

  async getEscapeIdsByTechniqueId(techniqueId: string): Promise<string[]> {
    const client = await this.getClient();
    const { data, error } = await client
      .from("technique_escapes")
      .select("escape_id")
      .eq("technique_id", techniqueId);

    if (error) {
      return [];
    }

    const rows = (data ?? []) as Array<Pick<DbRow<"technique_escapes">, "escape_id">>;
    return rows.map((row) => row.escape_id);
  }

  async getAggregateByTechniqueId(
    technique: TechniqueModel,
  ): Promise<TechniqueAggregateModel> {
    const [costs, prices, limits, effects, targetIds, escapeIds] = await Promise.all([
      this.getCostsByTechniqueId(technique.id),
      this.getPricesByTechniqueId(technique.id),
      this.getLimitsByTechniqueId(technique.id),
      this.getEffectsByTechniqueId(technique.id),
      this.getTargetIdsByTechniqueId(technique.id),
      this.getEscapeIdsByTechniqueId(technique.id),
    ]);

    return {
      technique,
      costs,
      prices,
      limits,
      effects,
      targetIds,
      escapeIds,
    };
  }
}

export class TechniquesRepository {
  private supabasePromise: Promise<TypedSupabaseClient> | null = null;
  public readonly relations: TechniqueRelationsRepository;

  constructor() {
    this.relations = new TechniqueRelationsRepository(() => this.getSupabase());
  }

  private async getSupabase(): Promise<TypedSupabaseClient> {
    if (!this.supabasePromise) {
      this.supabasePromise = createClient().catch((error) => {
        this.supabasePromise = null;
        throw error;
      });
    }

    return this.supabasePromise;
  }

  private mapWithTypeCode(row: TechniqueRowWithRelations): TechniqueWithTypeCode {
    const relation = Array.isArray(row.technique_types)
      ? row.technique_types[0]
      : row.technique_types;

    return {
      ...mapTechniqueRowToModel(row),
      techniqueTypeCode: relation?.code ?? "UNKNOWN",
    };
  }

  async list(filters?: TechniqueFilters): Promise<TechniqueModel[]> {
    const client = await this.getSupabase();
    let query = client.from("techniques").select("*").order("name", { ascending: true });

    if (filters?.kind) {
      query = query.eq("kind", filters.kind);
    }

    if (filters?.rankId) {
      query = query.eq("rank_id", filters.rankId);
    }

    if (filters?.techniqueTypeId) {
      query = query.eq("technique_type_id", filters.techniqueTypeId);
    }

    if (filters?.q) {
      const escaped = filters.q.replaceAll(",", "\\,").trim();
      if (escaped) {
        query = query.or(`name.ilike.%${escaped}%,observations.ilike.%${escaped}%`);
      }
    }

    const { data, error } = await query;
    if (error) {
      return [];
    }

    return (data ?? []).map((row) => mapTechniqueRowToModel(row));
  }

  async listWithTypeCodeByKind(kind: TechniqueKind): Promise<TechniqueWithTypeCode[]> {
    const client = await this.getSupabase();
    const joinTable = kind === "JUTSU" ? "jutsus" : "summonings";

    const { data, error } = await client
      .from("techniques")
      .select(`id,kind,technique_type_id,rank_id,name,link,observations,updated_by,created_at,updated_at,technique_types(code),${joinTable}!inner(technique_id)`)
      .eq("kind", kind)
      .order("name", { ascending: true });

    if (error) {
      return [];
    }

    return (data ?? []).map((row) => this.mapWithTypeCode(row as TechniqueRowWithRelations));
  }

  async getById(techniqueId: string): Promise<TechniqueModel | null> {
    const client = await this.getSupabase();
    const { data, error } = await client
      .from("techniques")
      .select("*")
      .eq("id", techniqueId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapTechniqueRowToModel(data);
  }

  async getByIdWithTypeCode(
    techniqueId: string,
    kind?: TechniqueKind,
  ): Promise<TechniqueWithTypeCode | null> {
    const client = await this.getSupabase();
    const baseQuery = client
      .from("techniques")
      .select("id,kind,technique_type_id,rank_id,name,link,observations,updated_by,created_at,updated_at,technique_types(code)")
      .eq("id", techniqueId);

    const query = kind ? baseQuery.eq("kind", kind) : baseQuery;
    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }

    return this.mapWithTypeCode(data as TechniqueRowWithRelations);
  }

  async getAggregateById(techniqueId: string): Promise<TechniqueAggregateModel | null> {
    const technique = await this.getById(techniqueId);
    if (!technique) {
      return null;
    }

    return this.relations.getAggregateByTechniqueId(technique);
  }

  async createCore(input: CreateTechniqueCoreInput): Promise<TechniqueModel | null> {
    const client = await this.getSupabase();
    const payload: DbInsert<"techniques"> = {
      kind: input.kind,
      name: input.name,
      technique_type_id: input.techniqueTypeId,
      rank_id: input.rankId,
      link: input.link ?? null,
      observations: input.observations ?? null,
      updated_by: input.updatedBy ?? null,
    };

    const { data, error } = await client
      .from("techniques")
      .insert(payload as never)
      .select("*")
      .single();

    if (error || !data) {
      return null;
    }

    const created = data as DbRow<"techniques">;
    await this.syncTechniqueSubtype(created.id, created.kind);
    return mapTechniqueRowToModel(created);
  }

  async patchCore(
    techniqueId: string,
    input: PatchTechniqueCoreInput,
  ): Promise<TechniqueModel | null> {
    const client = await this.getSupabase();
    const payload: DbUpdate<"techniques"> = {
      updated_by: input.updatedBy ?? null,
    };

    if (input.kind) payload.kind = input.kind;
    if (input.name !== undefined) payload.name = input.name;
    if (input.techniqueTypeId !== undefined) payload.technique_type_id = input.techniqueTypeId;
    if (input.rankId !== undefined) payload.rank_id = input.rankId;
    if (input.link !== undefined) payload.link = input.link;
    if (input.observations !== undefined) payload.observations = input.observations;

    const { data, error } = await client
      .from("techniques")
      .update(payload as never)
      .eq("id", techniqueId)
      .select("*")
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const patched = data as DbRow<"techniques">;
    await this.syncTechniqueSubtype(patched.id, patched.kind);
    return mapTechniqueRowToModel(patched);
  }

  async deleteById(techniqueId: string): Promise<boolean> {
    const client = await this.getSupabase();
    const { error, count } = await client
      .from("techniques")
      .delete({ count: "exact" })
      .eq("id", techniqueId);

    if (error) {
      return false;
    }

    return (count ?? 0) > 0;
  }

  async syncTechniqueSubtype(techniqueId: string, kind: TechniqueKind): Promise<void> {
    const client = await this.getSupabase();
    const keepTable = kind === "JUTSU" ? "jutsus" : "summonings";
    const dropTable = kind === "JUTSU" ? "summonings" : "jutsus";

    await client
      .from(keepTable)
      .upsert(({ technique_id: techniqueId } as never), { onConflict: "technique_id" });

    await client.from(dropTable).delete().eq("technique_id", techniqueId);
  }
}

export const techniquesRepository = new TechniquesRepository();
