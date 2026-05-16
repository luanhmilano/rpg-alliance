import type {
  CreateTechniqueDto,
  ListTechniquesQueryDto,
  PatchTechniqueDto,
  TechniqueAggregateResponseDto,
  TechniqueResponseDto,
} from "@/lib/modules/techniques/dtos";
import type { TechniquesRepository } from "@/lib/modules/techniques/repository";
import { ApiError } from "@/lib/types/errors";
import type { ActorContext } from "@/lib/types/common";

function requireApproved(actor: ActorContext | null): asserts actor is ActorContext {
  if (!actor) {
    throw new ApiError("UNAUTHORIZED", "User is not authenticated");
  }

  if (actor.approvalStatus !== "APPROVED") {
    throw new ApiError("FORBIDDEN", "User is not approved");
  }
}

function requireKage(actor: ActorContext | null): asserts actor is ActorContext {
  requireApproved(actor);

  if (actor.role !== "KAGE") {
    throw new ApiError("FORBIDDEN", "Only KAGE users can mutate techniques");
  }
}

export class TechniquesService {
  constructor(private readonly repository: TechniquesRepository) {}

  async list(filters: ListTechniquesQueryDto): Promise<TechniqueResponseDto[]> {
    return this.repository.list(filters);
  }

  async getById(id: string): Promise<TechniqueAggregateResponseDto | null> {
    return this.repository.getById(id);
  }

  async create(
    dto: CreateTechniqueDto,
    actor: ActorContext | null,
  ): Promise<TechniqueAggregateResponseDto> {
    requireKage(actor);
    return this.repository.create(dto, actor.userId);
  }

  async patch(
    id: string,
    dto: PatchTechniqueDto,
    actor: ActorContext | null,
  ): Promise<TechniqueResponseDto | null> {
    requireKage(actor);
    return this.repository.patch(id, dto, actor.userId);
  }

  async delete(id: string, actor: ActorContext | null): Promise<boolean> {
    requireKage(actor);
    return this.repository.delete(id);
  }
}
