import type { DbRow } from "@/lib/db";
import type { ISODateTime, UUID } from "@/lib/types/common";
import type {
  COST_FREQUENCIES,
  COST_RESOURCES,
  EFFECT_KINDS,
  EFFECT_OPERATIONS,
  EFFECT_VALUE_TYPES,
  TARGET_SCOPES,
  TECHNIQUE_KINDS,
} from "@/lib/modules/techniques/constants";

export type TechniqueKind = (typeof TECHNIQUE_KINDS)[number];
export type TechniqueCostResource = (typeof COST_RESOURCES)[number];
export type TechniqueCostFrequency = (typeof COST_FREQUENCIES)[number];
export type TechniqueTargetScope = (typeof TARGET_SCOPES)[number];
export type TechniqueEffectKind = (typeof EFFECT_KINDS)[number];
export type TechniqueEffectOperation = (typeof EFFECT_OPERATIONS)[number];
export type TechniqueEffectValueType = (typeof EFFECT_VALUE_TYPES)[number];

export type TechniqueModel = {
  id: UUID;
  kind: TechniqueKind;
  name: string;
  rankId: UUID;
  link: string | null;
  observations: string | null;
  updatedBy: UUID | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type TechniqueCostModel = {
  id: UUID;
  techniqueId: UUID;
  resource: TechniqueCostResource;
  amount: number;
  frequency: TechniqueCostFrequency;
  createdAt: ISODateTime;
};

export type TechniqueLimitsModel = {
  techniqueId: UUID;
  hasTurnLimit: boolean;
  maxActiveTurns: number | null;
  hasFightUseLimit: boolean;
  maxUsesPerFight: number | null;
};

export type TechniqueEffectValueModel =
  | {
      valueType: "NUMERIC";
      valueNumeric: number;
      valueText: null;
      valueToken: null;
    }
  | {
      valueType: "TEXT";
      valueNumeric: null;
      valueText: string;
      valueToken: null;
    }
  | {
      valueType: "TOKEN";
      valueNumeric: null;
      valueText: null;
      valueToken: string;
    };

export type TechniqueEffectModel = {
  id: UUID;
  techniqueId: UUID;
  targetScope: TechniqueTargetScope;
  affectedAttribute: string;
  effectKind: TechniqueEffectKind;
  operation: TechniqueEffectOperation;
  executionOrder: number | null;
  value: TechniqueEffectValueModel | null;
};

export type TechniqueAggregateModel = {
  technique: TechniqueModel;
  costs: TechniqueCostModel[];
  limits: TechniqueLimitsModel | null;
  effects: TechniqueEffectModel[];
  targetIds: UUID[];
  escapeIds: UUID[];
};

export type TechniqueFilters = {
  kind?: TechniqueKind;
  rankId?: UUID;
  q?: string;
};

export type TechniqueRow = DbRow<"techniques">;
export type TechniqueCostRow = DbRow<"technique_costs">;
export type TechniqueLimitsRow = DbRow<"technique_limits">;
export type TechniqueEffectRow = DbRow<"technique_effects">;
export type TechniqueEffectValueRow = DbRow<"technique_effect_values">;
