import { z } from "zod";

import {
  COST_FREQUENCIES,
  COST_RESOURCES,
  EFFECT_KINDS,
  EFFECT_OPERATIONS,
  EFFECT_VALUE_TYPES,
  PRICE_CONTEXTS,
  TARGET_SCOPES,
  TECHNIQUE_KINDS,
} from "@/lib/modules/techniques/constants";

const uuidSchema = z.string().uuid();

export const techniqueFiltersSchema = z.object({
  kind: z.enum(TECHNIQUE_KINDS).optional(),
  techniqueTypeId: uuidSchema.optional(),
  rankId: uuidSchema.optional(),
  q: z.string().trim().min(1).max(120).optional(),
});

export const techniqueCostInputSchema = z.object({
  resource: z.enum(COST_RESOURCES),
  amount: z.number().nonnegative(),
  frequency: z.enum(COST_FREQUENCIES),
});

export const techniqueLimitsInputSchema = z
  .object({
    hasTurnLimit: z.boolean(),
    maxActiveTurns: z.number().int().positive().nullable().optional(),
    hasFightUseLimit: z.boolean(),
    maxUsesPerFight: z.number().int().positive().nullable().optional(),
    hasCardUseLimit: z.boolean(),
    maxUsesPerCard: z.number().int().positive().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.hasTurnLimit && typeof value.maxActiveTurns !== "number") {
      ctx.addIssue({
        code: "custom",
        path: ["maxActiveTurns"],
        message: "maxActiveTurns is required when hasTurnLimit is true",
      });
    }

    if (!value.hasTurnLimit && value.maxActiveTurns != null) {
      ctx.addIssue({
        code: "custom",
        path: ["maxActiveTurns"],
        message: "maxActiveTurns must be null when hasTurnLimit is false",
      });
    }

    if (value.hasFightUseLimit && typeof value.maxUsesPerFight !== "number") {
      ctx.addIssue({
        code: "custom",
        path: ["maxUsesPerFight"],
        message: "maxUsesPerFight is required when hasFightUseLimit is true",
      });
    }

    if (!value.hasFightUseLimit && value.maxUsesPerFight != null) {
      ctx.addIssue({
        code: "custom",
        path: ["maxUsesPerFight"],
        message: "maxUsesPerFight must be null when hasFightUseLimit is false",
      });
    }

    if (value.hasCardUseLimit && typeof value.maxUsesPerCard !== "number") {
      ctx.addIssue({
        code: "custom",
        path: ["maxUsesPerCard"],
        message: "maxUsesPerCard is required when hasCardUseLimit is true",
      });
    }

    if (!value.hasCardUseLimit && value.maxUsesPerCard != null) {
      ctx.addIssue({
        code: "custom",
        path: ["maxUsesPerCard"],
        message: "maxUsesPerCard must be null when hasCardUseLimit is false",
      });
    }
  });

export const techniquePriceInputSchema = z.object({
  priceContext: z.enum(PRICE_CONTEXTS),
  amount: z.number().nonnegative(),
  notes: z.string().trim().max(300).nullable().optional(),
});

const numericEffectValueSchema = z.object({
  valueType: z.literal(EFFECT_VALUE_TYPES[0]),
  valueNumeric: z.number(),
  valueText: z.null().optional(),
  valueToken: z.null().optional(),
});

const textEffectValueSchema = z.object({
  valueType: z.literal(EFFECT_VALUE_TYPES[1]),
  valueNumeric: z.null().optional(),
  valueText: z.string().trim().min(1),
  valueToken: z.null().optional(),
});

const tokenEffectValueSchema = z.object({
  valueType: z.literal(EFFECT_VALUE_TYPES[2]),
  valueNumeric: z.null().optional(),
  valueText: z.null().optional(),
  valueToken: z.string().trim().min(1),
});

export const techniqueEffectValueInputSchema = z.discriminatedUnion("valueType", [
  numericEffectValueSchema,
  textEffectValueSchema,
  tokenEffectValueSchema,
]);

export const techniqueEffectInputSchema = z.object({
  targetScope: z.enum(TARGET_SCOPES),
  affectedAttribute: z.string().trim().min(1).max(50),
  effectKind: z.enum(EFFECT_KINDS),
  operation: z.enum(EFFECT_OPERATIONS),
  executionOrder: z.number().int().positive().nullable().optional(),
  value: techniqueEffectValueInputSchema.optional(),
});

const createTechniqueBaseSchema = z.object({
  kind: z.enum(TECHNIQUE_KINDS),
  techniqueTypeId: uuidSchema,
  name: z.string().trim().min(2).max(140),
  rankId: uuidSchema,
  link: z.string().trim().url().nullable().optional(),
  observations: z.string().trim().max(2000).nullable().optional(),
  costs: z.array(techniqueCostInputSchema).default([]),
  prices: z.array(techniquePriceInputSchema).default([]),
  limits: techniqueLimitsInputSchema.nullable().optional(),
  effects: z.array(techniqueEffectInputSchema).default([]),
  targetIds: z.array(uuidSchema).default([]),
  escapeIds: z.array(uuidSchema).default([]),
});

export const createTechniqueSchema = createTechniqueBaseSchema
  .superRefine((value, ctx) => {
    const requiredPriceContext =
      value.kind === "SUMMONING"
        ? "SUMMON_UNIT_PURCHASE"
        : "TECHNIQUE_PURCHASE";

    const hasRequiredPurchasePrice = value.prices.some(
      (price) => price.priceContext === requiredPriceContext,
    );

    if (!hasRequiredPurchasePrice) {
      ctx.addIssue({
        code: "custom",
        path: ["prices"],
        message:
          value.kind === "SUMMONING"
            ? "Summonings require a purchase price"
            : "Jutsus require a purchase price",
      });
    }
  });

export const updateTechniqueSchema = createTechniqueSchema;

export const patchTechniqueSchema = createTechniqueBaseSchema
  .partial()
  .extend({
    effects: z.array(techniqueEffectInputSchema).optional(),
  });

export const techniqueIdParamsSchema = z.object({
  id: uuidSchema,
});

export type TechniqueFiltersInput = z.infer<typeof techniqueFiltersSchema>;
export type TechniqueCostInput = z.infer<typeof techniqueCostInputSchema>;
export type TechniqueLimitsInput = z.infer<typeof techniqueLimitsInputSchema>;
export type TechniquePriceInput = z.infer<typeof techniquePriceInputSchema>;
export type TechniqueEffectValueInput = z.infer<typeof techniqueEffectValueInputSchema>;
export type TechniqueEffectInput = z.infer<typeof techniqueEffectInputSchema>;
export type CreateTechniqueInput = z.infer<typeof createTechniqueSchema>;
export type UpdateTechniqueInput = z.infer<typeof updateTechniqueSchema>;
export type PatchTechniqueInput = z.infer<typeof patchTechniqueSchema>;
