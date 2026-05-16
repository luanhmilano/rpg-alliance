import type {
  CreateTechniqueInput,
  PatchTechniqueInput,
  TechniqueFiltersInput,
  UpdateTechniqueInput,
} from "@/lib/modules/techniques/schemas";
import type { TechniqueAggregateModel, TechniqueModel } from "@/lib/modules/techniques/types";

export type CreateTechniqueDto = CreateTechniqueInput;
export type UpdateTechniqueDto = UpdateTechniqueInput;
export type PatchTechniqueDto = PatchTechniqueInput;
export type ListTechniquesQueryDto = TechniqueFiltersInput;

export type TechniqueResponseDto = TechniqueModel;
export type TechniqueAggregateResponseDto = TechniqueAggregateModel;
