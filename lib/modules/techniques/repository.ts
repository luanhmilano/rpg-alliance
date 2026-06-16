import type { DbRow, DbUpdate } from "@/lib/db";
import type {
  CreateTechniqueDto,
  PatchTechniqueDto,
} from "@/lib/modules/techniques/dtos";
import {
  mapCreateDtoToTechniqueInsert,
  mapPatchDtoToTechniqueUpdate,
  mapTechniqueCostRowToModel,
  mapTechniqueEffectRowToModel,
  mapTechniqueLimitsRowToModel,
  mapTechniquePriceRowToModel,
  mapTechniqueRowToModel,
} from "@/lib/modules/techniques/mappers";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type {
  TechniqueAggregateModel,
  TechniqueFilters,
  TechniqueModel,
} from "@/lib/modules/techniques/types";
import { ApiError } from "@/lib/types/errors";

type TechniqueRowWithLookups = DbRow<"techniques"> & {
  ranks: { value: string } | Array<{ value: string }> | null;
  technique_types:
    | { code: string; name: string }
    | Array<{ code: string; name: string }>
    | null;
};

export interface TechniquesRepository {
  list(filters?: TechniqueFilters): Promise<TechniqueModel[]>;
  getById(id: string): Promise<TechniqueAggregateModel | null>;
  create(dto: CreateTechniqueDto, actorId: string): Promise<TechniqueAggregateModel>;
  patch(id: string, dto: PatchTechniqueDto, actorId: string): Promise<TechniqueModel | null>;
  delete(id: string): Promise<boolean>;
}

export class SupabaseTechniquesRepository implements TechniquesRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  private mapTechniqueRowWithLookups(row: TechniqueRowWithLookups) {
    const rankRelation = Array.isArray(row.ranks) ? row.ranks[0] : row.ranks;
    const typeRelation = Array.isArray(row.technique_types)
      ? row.technique_types[0]
      : row.technique_types;

    return mapTechniqueRowToModel(row, {
      rankValue: rankRelation?.value ?? null,
      techniqueTypeCode: typeRelation?.code,
      techniqueTypeName: typeRelation?.name ?? null,
    });
  }

  private async syncTechniqueSubtype(techniqueId: string, kind: "JUTSU" | "SUMMONING") {
    if (kind === "JUTSU") {
      const { error: keepError } = await this.client
        .from("jutsus")
        .upsert({ technique_id: techniqueId } as never, { onConflict: "technique_id" });
      if (keepError) throw new ApiError("INTERNAL_ERROR", "Failed to sync technique subtype", keepError);
      const { error: dropError } = await this.client.from("summonings").delete().eq("technique_id", techniqueId);
      if (dropError) throw new ApiError("INTERNAL_ERROR", "Failed to sync technique subtype", dropError);
    } else {
      const { error: keepError } = await this.client
        .from("summonings")
        .upsert({ technique_id: techniqueId } as never, { onConflict: "technique_id" });
      if (keepError) throw new ApiError("INTERNAL_ERROR", "Failed to sync technique subtype", keepError);
      const { error: dropError } = await this.client.from("jutsus").delete().eq("technique_id", techniqueId);
      if (dropError) throw new ApiError("INTERNAL_ERROR", "Failed to sync technique subtype", dropError);
    }
  }

  async list(filters?: TechniqueFilters): Promise<TechniqueModel[]> {
    let query = this.client
      .from("techniques")
      .select("id,kind,technique_type_id,name,rank_id,link,observations,updated_by,created_at,updated_at,ranks(value),technique_types(code,name)")
      .order("name", { ascending: true });

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
      throw new ApiError("INTERNAL_ERROR", "Failed to list techniques", error);
    }

    return (data ?? []).map((row) => this.mapTechniqueRowWithLookups(row as TechniqueRowWithLookups));
  }

  async getById(id: string): Promise<TechniqueAggregateModel | null> {
    const { data: techniqueRow, error: techniqueError } = await this.client
      .from("techniques")
      .select("id,kind,technique_type_id,name,rank_id,link,observations,updated_by,created_at,updated_at,ranks(value),technique_types(code,name)")
      .eq("id", id)
      .maybeSingle();

    if (techniqueError) {
      throw new ApiError("INTERNAL_ERROR", "Failed to get technique", techniqueError);
    }

    if (!techniqueRow) {
      return null;
    }

    const [costsResult, pricesResult, limitsResult, effectsResult, valuesResult, targetsResult, escapesResult] =
      await Promise.all([
        this.client.from("technique_costs").select("*").eq("technique_id", id),
        this.client
          .from("technique_prices")
          .select("*")
          .eq("technique_id", id)
          .order("created_at", { ascending: true }),
        this.client.from("technique_limits").select("*").eq("technique_id", id).maybeSingle(),
        this.client
          .from("technique_effects")
          .select("*")
          .eq("technique_id", id)
          .order("execution_order", { ascending: true, nullsFirst: false }),
        this.client.from("technique_effect_values").select("*").then((r) => r),
        this.client
          .from("technique_targets")
          .select("target_id,targets(id,code,description)")
          .eq("technique_id", id),
        this.client
          .from("technique_escapes")
          .select("escape_id,escapes(id,code,description)")
          .eq("technique_id", id),
      ]);

    if (
      costsResult.error ||
      pricesResult.error ||
      limitsResult.error ||
      effectsResult.error ||
      valuesResult.error ||
      targetsResult.error ||
      escapesResult.error
    ) {
      throw new ApiError("INTERNAL_ERROR", "Failed to load technique aggregate", {
        costs: costsResult.error,
        prices: pricesResult.error,
        limits: limitsResult.error,
        effects: effectsResult.error,
        values: valuesResult.error,
        targets: targetsResult.error,
        escapes: escapesResult.error,
      });
    }

    const valueRows = (valuesResult.data ?? []) as DbRow<"technique_effect_values">[];
    const valueMap = new Map(valueRows.map((row) => [row.effect_id, row]));

    const effectRows = (effectsResult.data ?? []) as DbRow<"technique_effects">[];

    const targetRows = (targetsResult.data ?? []) as Array<{
      target_id: string;
      targets:
        | {
            id: string;
            code: string;
            description: string;
          }
        | Array<{ id: string; code: string; description: string }>
        | null;
    }>;

    const escapeRows = (escapesResult.data ?? []) as Array<{
      escape_id: string;
      escapes:
        | {
            id: string;
            code: string;
            description: string;
          }
        | Array<{ id: string; code: string; description: string }>
        | null;
    }>;

    return {
      technique: this.mapTechniqueRowWithLookups(techniqueRow as TechniqueRowWithLookups),
      costs: (costsResult.data ?? []).map((row) => mapTechniqueCostRowToModel(row)),
      prices: (pricesResult.data ?? []).map((row) => mapTechniquePriceRowToModel(row)),
      limits: limitsResult.data ? mapTechniqueLimitsRowToModel(limitsResult.data) : null,
      effects: effectRows.map((row) => mapTechniqueEffectRowToModel(row, valueMap.get(row.id))),
      targetIds: targetRows.map((row) => row.target_id),
      escapeIds: escapeRows.map((row) => row.escape_id),
      targets: targetRows
        .map((row) => (Array.isArray(row.targets) ? row.targets[0] : row.targets))
        .filter((row): row is { id: string; code: string; description: string } => Boolean(row))
        .map((row) => ({ id: row.id, code: row.code, description: row.description })),
      escapes: escapeRows
        .map((row) => (Array.isArray(row.escapes) ? row.escapes[0] : row.escapes))
        .filter((row): row is { id: string; code: string; description: string } => Boolean(row))
        .map((row) => ({ id: row.id, code: row.code, description: row.description })),
    };
  }

  async create(dto: CreateTechniqueDto, actorId: string): Promise<TechniqueAggregateModel> {
    const techniqueInsert = mapCreateDtoToTechniqueInsert(dto, actorId);

    const { data: techniqueRow, error: techniqueError } = await this.client
      .from("techniques")
      .insert(techniqueInsert as never)
      .select("*")
      .single();

    if (techniqueError) {
      throw new ApiError("CONFLICT", "Failed to create technique", techniqueError);
    }

    const created = techniqueRow as unknown as DbRow<"techniques">;
    const techniqueId = created.id;

    await this.syncTechniqueSubtype(techniqueId, dto.kind);

    if (dto.costs.length > 0) {
      const { error: costsError } = await this.client.from("technique_costs").insert(
        dto.costs.map((item) => ({
          technique_id: techniqueId,
          resource: item.resource,
          amount: item.amount,
          frequency: item.frequency,
        })) as never[],
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
        has_card_use_limit: dto.limits.hasCardUseLimit,
        max_uses_per_card: dto.limits.maxUsesPerCard ?? null,
      } as never);

      if (limitsError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to create technique limits", limitsError);
      }
    }

    if (dto.prices.length > 0) {
      const { error: pricesError } = await this.client.from("technique_prices").insert(
        dto.prices.map((item) => ({
          technique_id: techniqueId,
          price_context: item.priceContext,
          amount: item.amount,
          notes: item.notes ?? null,
        })) as never[],
      );

      if (pricesError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to create technique prices", pricesError);
      }
    }

    let effectRows: DbRow<"technique_effects">[] = [];
    if (dto.effects.length > 0) {
      const { data, error: effectsError } = await this.client
        .from("technique_effects")
        .insert(
          dto.effects.map((effect) => ({
            technique_id: techniqueId,
            target_scope: effect.targetScope,
            affected_attribute: effect.affectedAttribute,
            effect_kind: effect.effectKind,
            operation: effect.operation,
            execution_order: effect.executionOrder ?? null,
          })) as never[],
        )
        .select("*");

      if (effectsError || !data) {
        throw new ApiError("INTERNAL_ERROR", "Failed to create technique effects", effectsError);
      }

      effectRows = (data as unknown as DbRow<"technique_effects">[]);
    }

    type EffectValueInsert = {
      effect_id: string;
      value_type: "NUMERIC" | "TEXT" | "TOKEN";
      value_numeric: number | null;
      value_text: string | null;
      value_token: string | null;
    };

    const effectValuesInsert = effectRows
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
        .insert(effectValuesInsert as never[]);

      if (valuesError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to create technique effect values", valuesError);
      }
    }

    if (dto.targetIds.length > 0) {
      const { error: targetsError } = await this.client.from("technique_targets").insert(
        dto.targetIds.map((targetId) => ({
          technique_id: techniqueId,
          target_id: targetId,
        })) as never[],
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
        })) as never[],
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

  async patch(id: string, dto: PatchTechniqueDto, actorId: string): Promise<TechniqueModel | null> {
    const updatePayload: DbUpdate<"techniques"> = mapPatchDtoToTechniqueUpdate(dto, actorId);

    const { data, error } = await this.client
      .from("techniques")
      .update(updatePayload as never)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new ApiError("INTERNAL_ERROR", "Failed to patch technique", error);
    }

    if (!data) {
      return null;
    }

    if (dto.kind) {
      await this.syncTechniqueSubtype(id, dto.kind);
    }

    if (dto.costs) {
      const { error: deleteCostsError } = await this.client.from("technique_costs").delete().eq("technique_id", id);
      if (deleteCostsError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to reset technique costs", deleteCostsError);
      }

      if (dto.costs.length > 0) {
        const { error: insertCostsError } = await this.client.from("technique_costs").insert(
          dto.costs.map((item) => ({
            technique_id: id,
            resource: item.resource,
            amount: item.amount,
            frequency: item.frequency,
          })) as never[],
        );

        if (insertCostsError) {
          throw new ApiError("INTERNAL_ERROR", "Failed to update technique costs", insertCostsError);
        }
      }
    }

    if (dto.prices) {
      const { error: deletePricesError } = await this.client
        .from("technique_prices")
        .delete()
        .eq("technique_id", id);
      if (deletePricesError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to reset technique prices", deletePricesError);
      }

      if (dto.prices.length > 0) {
        const { error: insertPricesError } = await this.client.from("technique_prices").insert(
          dto.prices.map((item) => ({
            technique_id: id,
            price_context: item.priceContext,
            amount: item.amount,
            notes: item.notes ?? null,
          })) as never[],
        );

        if (insertPricesError) {
          throw new ApiError("INTERNAL_ERROR", "Failed to update technique prices", insertPricesError);
        }
      }
    }

    if (dto.limits !== undefined) {
      if (dto.limits === null) {
        const { error: deleteLimitsError } = await this.client
          .from("technique_limits")
          .delete()
          .eq("technique_id", id);
        if (deleteLimitsError) {
          throw new ApiError("INTERNAL_ERROR", "Failed to clear technique limits", deleteLimitsError);
        }
      } else {
        const { error: upsertLimitsError } = await this.client.from("technique_limits").upsert(
          {
            technique_id: id,
            has_turn_limit: dto.limits.hasTurnLimit,
            max_active_turns: dto.limits.maxActiveTurns ?? null,
            has_fight_use_limit: dto.limits.hasFightUseLimit,
            max_uses_per_fight: dto.limits.maxUsesPerFight ?? null,
            has_card_use_limit: dto.limits.hasCardUseLimit,
            max_uses_per_card: dto.limits.maxUsesPerCard ?? null,
          } as never,
          { onConflict: "technique_id" },
        );

        if (upsertLimitsError) {
          throw new ApiError("INTERNAL_ERROR", "Failed to update technique limits", upsertLimitsError);
        }
      }
    }

    if (dto.effects) {
      const { error: deleteEffectsError } = await this.client
        .from("technique_effects")
        .delete()
        .eq("technique_id", id);

      if (deleteEffectsError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to reset technique effects", deleteEffectsError);
      }

      if (dto.effects.length > 0) {
        const { data: effectRows, error: insertEffectsError } = await this.client
          .from("technique_effects")
          .insert(
            dto.effects.map((effect) => ({
              technique_id: id,
              target_scope: effect.targetScope,
              affected_attribute: effect.affectedAttribute,
              effect_kind: effect.effectKind,
              operation: effect.operation,
              execution_order: effect.executionOrder ?? null,
            })) as never[],
          )
          .select("*");

        if (insertEffectsError || !effectRows) {
          throw new ApiError("INTERNAL_ERROR", "Failed to update technique effects", insertEffectsError);
        }

        const typedEffectRows = (effectRows as unknown as DbRow<"technique_effects">[]);

        type EffectValueInsert = {
          effect_id: string;
          value_type: "NUMERIC" | "TEXT" | "TOKEN";
          value_numeric: number | null;
          value_text: string | null;
          value_token: string | null;
        };

        const effectValuesInsert = typedEffectRows
          .map((effectRow: DbRow<"technique_effects">, index: number) => {
            const value = dto.effects?.[index]?.value;
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
          const { error: insertValuesError } = await this.client
            .from("technique_effect_values")
            .insert(effectValuesInsert as never[]);

          if (insertValuesError) {
            throw new ApiError("INTERNAL_ERROR", "Failed to update technique effect values", insertValuesError);
          }
        }
      }
    }

    if (dto.targetIds) {
      const { error: deleteTargetsError } = await this.client
        .from("technique_targets")
        .delete()
        .eq("technique_id", id);
      if (deleteTargetsError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to reset technique targets", deleteTargetsError);
      }

      if (dto.targetIds.length > 0) {
        const { error: insertTargetsError } = await this.client.from("technique_targets").insert(
          dto.targetIds.map((targetId) => ({
            technique_id: id,
            target_id: targetId,
          })) as never[],
        );

        if (insertTargetsError) {
          throw new ApiError("INTERNAL_ERROR", "Failed to update technique targets", insertTargetsError);
        }
      }
    }

    if (dto.escapeIds) {
      const { error: deleteEscapesError } = await this.client
        .from("technique_escapes")
        .delete()
        .eq("technique_id", id);
      if (deleteEscapesError) {
        throw new ApiError("INTERNAL_ERROR", "Failed to reset technique escapes", deleteEscapesError);
      }

      if (dto.escapeIds.length > 0) {
        const { error: insertEscapesError } = await this.client.from("technique_escapes").insert(
          dto.escapeIds.map((escapeId) => ({
            technique_id: id,
            escape_id: escapeId,
          })) as never[],
        );

        if (insertEscapesError) {
          throw new ApiError("INTERNAL_ERROR", "Failed to update technique escapes", insertEscapesError);
        }
      }
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
