import type {
  CreateTechniqueDto,
  ListTechniquesQueryDto,
  PatchTechniqueDto,
  TechniqueDetailDto,
  TechniqueCostDto,
  TechniquePriceDto,
  TechniqueLimitsDto,
  TechniqueEffectDto,
  TechniqueListItemDto,
} from "@/lib/modules/techniques/dtos";
import { requireKageActorContext } from "@/lib/access-control";
import type { TechniquesRepository } from "@/lib/modules/techniques/repository";
import type {
  TechniqueModel,
  TechniqueAggregateModel,
  TechniqueCostModel,
  TechniquePriceModel,
  TechniqueLimitsModel,
  TechniqueEffectModel,
} from "@/lib/modules/techniques/types";
import type { ActorContext } from "@/lib/types/common";

// ─── Private mappers (domain model → view DTO) ──────────────────────────────

function toCostDto(model: TechniqueCostModel): TechniqueCostDto {
  return { resource: model.resource, amount: model.amount, frequency: model.frequency };
}

function toPriceDto(model: TechniquePriceModel): TechniquePriceDto {
  return { priceContext: model.priceContext, amount: model.amount, notes: model.notes };
}

function toLimitsDto(model: TechniqueLimitsModel): TechniqueLimitsDto {
  return {
    hasTurnLimit: model.hasTurnLimit,
    maxActiveTurns: model.maxActiveTurns,
    hasFightUseLimit: model.hasFightUseLimit,
    maxUsesPerFight: model.maxUsesPerFight,
    hasCardUseLimit: model.hasCardUseLimit,
    maxUsesPerCard: model.maxUsesPerCard,
  };
}

function toEffectDto(model: TechniqueEffectModel): TechniqueEffectDto {
  return {
    id: model.id,
    targetScope: model.targetScope,
    affectedAttribute: model.affectedAttribute,
    effectKind: model.effectKind,
    operation: model.operation,
    executionOrder: model.executionOrder,
    value: model.value,
  };
}

/**
 * Maps a raw TechniqueModel to the lightweight list-item DTO.
 * Uses human-readable labels; never exposes raw FK IDs in display fields.
 */
export function toTechniqueListItemDto(model: TechniqueModel): TechniqueListItemDto {
  return {
    id: model.id,
    kind: model.kind,
    name: model.name,
    rankValue: model.rankValue ?? "N/D",
    techniqueTypeCode: model.techniqueTypeCode ?? "",
    techniqueTypeName: model.techniqueTypeName ?? "",
    link: model.link,
    observations: model.observations,
    updatedAt: model.updatedAt,
  };
}

/**
 * Maps a full TechniqueAggregateModel to the detail DTO.
 * Display fields use human-readable labels.
 * Admin/edit IDs are preserved separately so forms can pre-populate.
 */
export function toTechniqueDetailDto(aggregate: TechniqueAggregateModel): TechniqueDetailDto {
  const t = aggregate.technique;
  return {
    // Display
    id: t.id,
    kind: t.kind,
    name: t.name,
    rankValue: t.rankValue ?? "N/D",
    techniqueTypeCode: t.techniqueTypeCode ?? "",
    techniqueTypeName: t.techniqueTypeName ?? "",
    link: t.link,
    observations: t.observations,
    costs: aggregate.costs.map(toCostDto),
    prices: aggregate.prices.map(toPriceDto),
    limits: aggregate.limits ? toLimitsDto(aggregate.limits) : null,
    effects: aggregate.effects.map(toEffectDto),
    targets: aggregate.targets,
    escapes: aggregate.escapes,
    updatedAt: t.updatedAt,
    createdAt: t.createdAt,
    // Admin form IDs
    rankId: t.rankId,
    techniqueTypeId: t.techniqueTypeId,
    targetIds: aggregate.targetIds,
    escapeIds: aggregate.escapeIds,
  };
}

// ─── Service ────────────────────────────────────────────────────────────────

export class TechniquesService {
  constructor(private readonly repository: TechniquesRepository) {}

  /**
   * Lists techniques as lightweight items with human-readable labels.
   */
  async list(filters: ListTechniquesQueryDto): Promise<TechniqueListItemDto[]> {
    const models = await this.repository.list(filters);
    return models.map(toTechniqueListItemDto);
  }

  /**
   * Returns a full technique with all relations and human-readable labels.
   * Also exposes admin IDs for edit-form pre-population.
   */
  async getById(id: string): Promise<TechniqueDetailDto | null> {
    const aggregate = await this.repository.getById(id);
    if (!aggregate) return null;
    return toTechniqueDetailDto(aggregate);
  }

  /**
   * Creates a technique with all sub-relations (costs, limits, prices, effects,
   * targets, escapes). Requires KAGE actor context.
   */
  async create(
    dto: CreateTechniqueDto,
    actor: ActorContext | null,
  ): Promise<TechniqueDetailDto> {
    requireKageActorContext(actor);
    const aggregate = await this.repository.create(dto, actor.userId);
    return toTechniqueDetailDto(aggregate);
  }

  /**
   * Patches an existing technique and its sub-relations in a single call.
   * Returns the updated list-item DTO. Requires KAGE actor context.
   */
  async patch(
    id: string,
    dto: PatchTechniqueDto,
    actor: ActorContext | null,
  ): Promise<TechniqueListItemDto | null> {
    requireKageActorContext(actor);
    const model = await this.repository.patch(id, dto, actor.userId);
    if (!model) return null;
    return toTechniqueListItemDto(model);
  }

  /**
   * Deletes a technique by id. Requires KAGE actor context.
   */
  async delete(id: string, actor: ActorContext | null): Promise<boolean> {
    requireKageActorContext(actor);
    return this.repository.delete(id);
  }
}
