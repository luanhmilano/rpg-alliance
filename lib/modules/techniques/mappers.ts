import type { DbInsert, DbRow, DbUpdate } from "@/lib/db";
import type { CreateTechniqueDto, PatchTechniqueDto } from "@/lib/modules/techniques/dtos";
import type {
  TechniqueCostModel,
  TechniqueEffectModel,
  TechniqueEffectValueModel,
  TechniqueLimitsModel,
  TechniqueModel,
  TechniquePriceModel,
} from "@/lib/modules/techniques/types";

export function mapTechniqueRowToModel(row: DbRow<"techniques">): TechniqueModel {
  return {
    id: row.id,
    kind: row.kind,
    techniqueTypeId: row.technique_type_id,
    name: row.name,
    rankId: row.rank_id,
    link: row.link,
    observations: row.observations,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTechniqueCostRowToModel(row: DbRow<"technique_costs">): TechniqueCostModel {
  return {
    id: row.id,
    techniqueId: row.technique_id,
    resource: row.resource,
    amount: row.amount,
    frequency: row.frequency,
    createdAt: row.created_at,
  };
}

export function mapTechniqueLimitsRowToModel(
  row: DbRow<"technique_limits">,
): TechniqueLimitsModel {
  return {
    techniqueId: row.technique_id,
    hasTurnLimit: row.has_turn_limit,
    maxActiveTurns: row.max_active_turns,
    hasFightUseLimit: row.has_fight_use_limit,
    maxUsesPerFight: row.max_uses_per_fight,
    hasCardUseLimit: row.has_card_use_limit,
    maxUsesPerCard: row.max_uses_per_card,
  };
}

export function mapTechniquePriceRowToModel(row: DbRow<"technique_prices">): TechniquePriceModel {
  return {
    id: row.id,
    techniqueId: row.technique_id,
    priceContext: row.price_context,
    amount: row.amount,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function mapEffectValueRowToModel(
  row: DbRow<"technique_effect_values">,
): TechniqueEffectValueModel | null {
  if (row.value_type === "NUMERIC" && typeof row.value_numeric === "number") {
    return {
      valueType: "NUMERIC",
      valueNumeric: row.value_numeric,
      valueText: null,
      valueToken: null,
    };
  }

  if (row.value_type === "TEXT" && typeof row.value_text === "string") {
    return {
      valueType: "TEXT",
      valueNumeric: null,
      valueText: row.value_text,
      valueToken: null,
    };
  }

  if (row.value_type === "TOKEN" && typeof row.value_token === "string") {
    return {
      valueType: "TOKEN",
      valueNumeric: null,
      valueText: null,
      valueToken: row.value_token,
    };
  }

  return null;
}

export function mapTechniqueEffectRowToModel(
  row: DbRow<"technique_effects">,
  valueRow?: DbRow<"technique_effect_values">,
): TechniqueEffectModel {
  return {
    id: row.id,
    techniqueId: row.technique_id,
    targetScope: row.target_scope,
    affectedAttribute: row.affected_attribute,
    effectKind: row.effect_kind,
    operation: row.operation,
    executionOrder: row.execution_order,
    value: valueRow ? mapEffectValueRowToModel(valueRow) : null,
  };
}

export function mapCreateDtoToTechniqueInsert(
  dto: CreateTechniqueDto,
  actorId: string,
): DbInsert<"techniques"> {
  return {
    kind: dto.kind,
    technique_type_id: dto.techniqueTypeId,
    name: dto.name,
    rank_id: dto.rankId,
    link: dto.link ?? null,
    observations: dto.observations ?? null,
    updated_by: actorId,
  };
}

export function mapPatchDtoToTechniqueUpdate(
  dto: PatchTechniqueDto,
  actorId: string,
): DbUpdate<"techniques"> {
  const update: DbUpdate<"techniques"> = {
    updated_by: actorId,
  };

  if (typeof dto.kind === "string") {
    update.kind = dto.kind;
  }

  if (typeof dto.techniqueTypeId === "string") {
    update.technique_type_id = dto.techniqueTypeId;
  }

  if (typeof dto.name === "string") {
    update.name = dto.name;
  }

  if (typeof dto.rankId === "string") {
    update.rank_id = dto.rankId;
  }

  if (dto.link !== undefined) {
    update.link = dto.link ?? null;
  }

  if (dto.observations !== undefined) {
    update.observations = dto.observations ?? null;
  }

  return update;
}
