/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DbRow, DbUpdate } from "@/lib/db";
import type {
  CreateTechniqueDto,
  PatchTechniqueDto,
  TechniqueAggregateResponseDto,
  TechniqueResponseDto,
} from "@/lib/modules/techniques/dtos";
import {
  mapCreateDtoToTechniqueInsert,
  mapPatchDtoToTechniqueUpdate,
  mapTechniqueCostRowToModel,
  mapTechniqueEffectRowToModel,
  mapTechniqueLimitsRowToModel,
  mapTechniqueRowToModel,
} from "@/lib/modules/techniques/mappers";
import type { TechniqueFilters } from "@/lib/modules/techniques/types";
import { ApiError } from "@/lib/types/errors";

export interface TechniquesRepository {
  list(filters?: TechniqueFilters): Promise<TechniqueResponseDto[]>;
  getById(id: string): Promise<TechniqueAggregateResponseDto | null>;
  create(dto: CreateTechniqueDto, actorId: string): Promise<TechniqueAggregateResponseDto>;
  patch(id: string, dto: PatchTechniqueDto, actorId: string): Promise<TechniqueResponseDto | null>;
  delete(id: string): Promise<boolean>;
}

export class SupabaseTechniquesRepository implements TechniquesRepository {
  constructor(private readonly client: any) {}

  async list(filters?: TechniqueFilters): Promise<TechniqueResponseDto[]> {
    let query = this.client.from("techniques").select("*").order("name", { ascending: true });

    if (filters?.kind) {
      query = query.eq("kind", filters.kind);
    }

    if (filters?.rankId) {
      query = query.eq("rank_id", filters.rankId);
    }

    if (filters?.q) {
      const escaped = filters.q.replaceAll(",", "\\,").trim();
      if (escaped) {
        query = query.or(`name.ilike.%${escaped}%,observations.ilike.%${escaped}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new ApiError("INTERNAL_ERROR", "Failed to list techniques", error);
    }

    return ((data ?? []) as DbRow<"techniques">[]).map((row: DbRow<"techniques">) =>
      mapTechniqueRowToModel(row),
    );
  }

  async getById(id: string): Promise<TechniqueAggregateResponseDto | null> {
    const { data: techniqueRow, error: techniqueError } = await this.client
      .from("techniques")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (techniqueError) {
      throw new ApiError("INTERNAL_ERROR", "Failed to get technique", techniqueError);
    }

    if (!techniqueRow) {
      return null;
    }

    const [costsResult, limitsResult, effectsResult, valuesResult, targetsResult, escapesResult] =
      await Promise.all([
        this.client.from("technique_costs").select("*").eq("technique_id", id),
        this.client.from("technique_limits").select("*").eq("technique_id", id).maybeSingle(),
        this.client
          .from("technique_effects")
          .select("*")
          .eq("technique_id", id)
          .order("execution_order", { ascending: true, nullsFirst: false }),
        this.client.from("technique_effect_values").select("*"),
        this.client.from("technique_targets").select("target_id").eq("technique_id", id),
        this.client.from("technique_escapes").select("escape_id").eq("technique_id", id),
      ]);

    if (
      costsResult.error ||
      limitsResult.error ||
      effectsResult.error ||
      valuesResult.error ||
      targetsResult.error ||
      escapesResult.error
    ) {
      throw new ApiError("INTERNAL_ERROR", "Failed to load technique aggregate", {
        costs: costsResult.error,
        limits: limitsResult.error,
        effects: effectsResult.error,
        values: valuesResult.error,
        targets: targetsResult.error,
        escapes: escapesResult.error,
      });
    }

    const valueRows = (valuesResult.data ?? []) as DbRow<"technique_effect_values">[];
    const valueMap = new Map(valueRows.map((row: DbRow<"technique_effect_values">) => [row.effect_id, row]));

    return {
      technique: mapTechniqueRowToModel(techniqueRow),
      costs: ((costsResult.data ?? []) as DbRow<"technique_costs">[]).map(
        (row: DbRow<"technique_costs">) => mapTechniqueCostRowToModel(row),
      ),
      limits: limitsResult.data ? mapTechniqueLimitsRowToModel(limitsResult.data as DbRow<"technique_limits">) : null,
      effects: ((effectsResult.data ?? []) as DbRow<"technique_effects">[]).map(
        (row: DbRow<"technique_effects">) =>
        mapTechniqueEffectRowToModel(row, valueMap.get(row.id)),
      ),
      targetIds: ((targetsResult.data ?? []) as Array<{ target_id: string }>).map((row) => row.target_id),
      escapeIds: ((escapesResult.data ?? []) as Array<{ escape_id: string }>).map((row) => row.escape_id),
    };
  }

  async create(dto: CreateTechniqueDto, actorId: string): Promise<TechniqueAggregateResponseDto> {
    const techniqueInsert = mapCreateDtoToTechniqueInsert(dto, actorId);

    const { data: techniqueRow, error: techniqueError } = await this.client
      .from("techniques")
      .insert(techniqueInsert)
      .select("*")
      .single();

    if (techniqueError) {
      throw new ApiError("CONFLICT", "Failed to create technique", techniqueError);
    }

    const techniqueId = techniqueRow.id;

    const subtypeInsert = {
      technique_id: techniqueId,
    };

    const subtypeTable = dto.kind === "JUTSU" ? "jutsus" : "summonings";
    const { error: subtypeError } = await this.client.from(subtypeTable).insert(subtypeInsert);

    if (subtypeError) {
      throw new ApiError("INTERNAL_ERROR", "Failed to create technique subtype", subtypeError);
    }

    if (dto.costs.length > 0) {
      const { error: costsError } = await this.client.from("technique_costs").insert(
        dto.costs.map((item) => ({
          technique_id: techniqueId,
          resource: item.resource,
          amount: item.amount,
          frequency: item.frequency,
        })),
      );

      if (costsError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to create technique costs", costsError);
      }
    }

    if (dto.limits) {
      const { error: limitsError } = await this.client.from("technique_limits").insert({
        technique_id: techniqueId,
        has_turn_limit: dto.limits.hasTurnLimit,
        max_active_turns: dto.limits.maxActiveTurns ?? null,
        has_fight_use_limit: dto.limits.hasFightUseLimit,
        max_uses_per_fight: dto.limits.maxUsesPerFight ?? null,
      });

      if (limitsError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to create technique limits", limitsError);
      }
    }

    const { data: effectRows, error: effectsError } = await this.client
      .from("technique_effects")
      .insert(
        dto.effects.map((effect) => ({
          technique_id: techniqueId,
          target_scope: effect.targetScope,
          affected_attribute: effect.affectedAttribute,
          effect_kind: effect.effectKind,
          operation: effect.operation,
          execution_order: effect.executionOrder ?? null,
        })),
      )
      .select("*");

    if (effectsError || !effectRows) {
      throw new ApiError("INTERNAL_ERROR", "Failed to create technique effects", effectsError);
    }

    type EffectValueInsert = {
      effect_id: string;
      value_type: "NUMERIC" | "TEXT" | "TOKEN";
      value_numeric: number | null;
      value_text: string | null;
      value_token: string | null;
    };

    const effectValuesInsert = (effectRows as DbRow<"technique_effects">[])
      .map((effectRow: DbRow<"technique_effects">, index: number) => {
        const value = dto.effects[index]?.value;
        if (!value) {
          return null;
        }

        return {
          effect_id: effectRow.id,
          value_type: value.valueType,
          value_numeric: value.valueType === "NUMERIC" ? value.valueNumeric : null,
          value_text: value.valueType === "TEXT" ? value.valueText : null,
          value_token: value.valueType === "TOKEN" ? value.valueToken : null,
        };
      })
      .filter((item: EffectValueInsert | null): item is EffectValueInsert => item !== null);

    if (effectValuesInsert.length > 0) {
      const { error: valuesError } = await this.client
        .from("technique_effect_values")
        .insert(effectValuesInsert);

      if (valuesError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to create technique effect values", valuesError);
      }
    }

    if (dto.targetIds.length > 0) {
      const { error: targetsError } = await this.client.from("technique_targets").insert(
        dto.targetIds.map((targetId) => ({
          technique_id: techniqueId,
          target_id: targetId,
        })),
      );

      if (targetsError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to assign technique targets", targetsError);
      }
    }

    if (dto.escapeIds.length > 0) {
      const { error: escapesError } = await this.client.from("technique_escapes").insert(
        dto.escapeIds.map((escapeId) => ({
          technique_id: techniqueId,
          escape_id: escapeId,
        })),
      );

      if (escapesError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to assign technique escapes", escapesError);
      }
    }

    const aggregate = await this.getById(techniqueId);

    if (!aggregate) {
      throw new ApiError("INTERNAL_ERROR", "Technique was created but could not be loaded");
    }

    return aggregate;
  }

  async patch(id: string, dto: PatchTechniqueDto, actorId: string): Promise<TechniqueResponseDto | null> {
    const updatePayload: DbUpdate<"techniques"> = mapPatchDtoToTechniqueUpdate(dto, actorId);

    const { data, error } = await this.client
      .from("techniques")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new ApiError("INTERNAL_ERROR", "Failed to patch technique", error);
    }

    if (!data) {
      return null;
    }

    return mapTechniqueRowToModel(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error, count } = await this.client
      .from("techniques")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) {
      throw new ApiError("INTERNAL_ERROR", "Failed to delete technique", error);
    }

    return (count ?? 0) > 0;
  }
}
