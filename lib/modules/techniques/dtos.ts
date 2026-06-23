import type {
  CreateTechniqueInput,
  PatchTechniqueInput,
  TechniqueFiltersInput,
  UpdateTechniqueInput,
} from "@/lib/modules/techniques/schemas";
import type { TechniqueKind } from "@/lib/modules/techniques/types";
import type { CatalogEntryDto } from "@/lib/types/catalog";

// ─── Input DTOs (API receives from client) ────────────────────────────────────

export type CreateTechniqueDto = CreateTechniqueInput;
export type UpdateTechniqueDto = UpdateTechniqueInput;
export type PatchTechniqueDto = PatchTechniqueInput;
export type ListTechniquesQueryDto = TechniqueFiltersInput;

// ─── View DTOs (API returns to client) ────────────────────────────────────────
// No raw database IDs are shown in display fields.
// IDs required by edit forms are explicitly labelled as such.

export type TechniqueEffectValueDto =
  | { valueType: "NUMERIC"; valueNumeric: number; valueText: null; valueToken: null }
  | { valueType: "TEXT"; valueNumeric: null; valueText: string; valueToken: null }
  | { valueType: "TOKEN"; valueNumeric: null; valueText: null; valueToken: string };

export type TechniqueEffectDto = {
  id: string;
  targetScope: string;
  affectedAttribute: string;
  effectKind: string;
  operation: string;
  executionOrder: number | null;
  value: TechniqueEffectValueDto | null;
};

export type TechniqueCostDto = {
  resource: string;
  amount: number;
  frequency: string;
};

export type TechniquePriceDto = {
  priceContext: string;
  amount: number;
  notes: string | null;
};

export type TechniqueLimitsDto = {
  hasTurnLimit: boolean;
  maxActiveTurns: number | null;
  hasFightUseLimit: boolean;
  maxUsesPerFight: number | null;
  hasCardUseLimit: boolean;
  maxUsesPerCard: number | null;
};

/**
 * Lightweight item returned by list endpoints.
 * Human-readable rank/type labels; id kept for navigation links.
 */
export type TechniqueListItemDto = {
  id: string;
  kind: TechniqueKind;
  name: string;
  rankValue: string;
  techniqueTypeCode: string;
  techniqueTypeName: string;
  link: string | null;
  observations: string | null;
  updatedAt: string;
};

/**
 * Full detail returned by single-resource endpoints.
 * Display fields use human-readable labels.
 * Admin/edit fields (rankId, techniqueTypeId, targetIds, escapeIds) are
 * kept so that edit forms can pre-populate selects/checkboxes.
 */
export type TechniqueDetailDto = {
  // ── Display ──────────────────────────────────────────────────────────────
  id: string;
  kind: TechniqueKind;
  name: string;
  rankValue: string;
  techniqueTypeCode: string;
  techniqueTypeName: string;
  link: string | null;
  observations: string | null;
  costs: TechniqueCostDto[];
  prices: TechniquePriceDto[];
  limits: TechniqueLimitsDto | null;
  effects: TechniqueEffectDto[];
  targets: CatalogEntryDto[];
  escapes: CatalogEntryDto[];
  updatedAt: string;
  createdAt: string;
  // ── Admin / form IDs (not for display) ───────────────────────────────────
  rankId: string;
  techniqueTypeId: string;
  targetIds: string[];
  escapeIds: string[];
};
