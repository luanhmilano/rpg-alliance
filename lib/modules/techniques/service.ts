import type {
  CreateTechniqueDto,
  ListTechniquesQueryDto,
  PatchTechniqueDto,
  TechniqueAggregateResponseDto,
  TechniqueResponseDto,
} from "@/lib/modules/techniques/dtos";
import { requireKageActorContext } from "@/lib/access-control";
import type { TechniquesRepository } from "@/lib/modules/techniques/repository";
import type { ActorContext } from "@/lib/types/common";

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
    requireKageActorContext(actor);
    return this.repository.create(dto, actor.userId);
  }

  async patch(
    id: string,
    dto: PatchTechniqueDto,
    actor: ActorContext | null,
  ): Promise<TechniqueResponseDto | null> {
    requireKageActorContext(actor);
    return this.repository.patch(id, dto, actor.userId);
  }

  async delete(id: string, actor: ActorContext | null): Promise<boolean> {
    requireKageActorContext(actor);
    return this.repository.delete(id);
  }
}
