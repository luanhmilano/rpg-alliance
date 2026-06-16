import type { UUID } from "@/lib/types/common";

export const JUTSU_RANKS = ["C", "B", "A", "S", "SS", "SSS"] as const;
export const JUTSU_TYPES = [
  "Ninjutsu",
  "Taijutsu",
  "Dojutsu",
  "Genjutsu",
] as const;
export const JUTSU_TYPE_CODES = ["NINJUTSU", "TAIJUTSU", "DOJUTSU", "GENJUTSU"] as const;

const JUTSU_TYPE_CODE_BY_LABEL: Record<(typeof JUTSU_TYPES)[number], (typeof JUTSU_TYPE_CODES)[number]> = {
  Ninjutsu: "NINJUTSU",
  Taijutsu: "TAIJUTSU",
  Dojutsu: "DOJUTSU",
  Genjutsu: "GENJUTSU",
};

const JUTSU_TYPE_LABEL_BY_CODE: Record<(typeof JUTSU_TYPE_CODES)[number], (typeof JUTSU_TYPES)[number]> = {
  NINJUTSU: "Ninjutsu",
  TAIJUTSU: "Taijutsu",
  DOJUTSU: "Dojutsu",
  GENJUTSU: "Genjutsu",
};

export type JutsuRank = (typeof JUTSU_RANKS)[number];
export type JutsuType = (typeof JUTSU_TYPES)[number];
export type JutsuTypeCode = (typeof JUTSU_TYPE_CODES)[number];

// Canonical V2 projection for jutsus stored in techniques + relations.
export type JutsuModel = {
  id: UUID;
  kind: "JUTSU";
  techniqueTypeId: UUID;
  techniqueTypeCode: JutsuTypeCode;
  techniqueTypeName: string | null;
  rankId: UUID;
  rankValue: string | null;
  name: string;
  link: string | null;
  observations: string | null;
  updatedBy: UUID | null;
  createdAt: string;
  updatedAt: string;
};

export type JutsuFilters = {
  rank?: JutsuRank;
  type?: JutsuType;
  minPrice?: number;
  maxPrice?: number;
  minChackra?: number;
  maxChackra?: number;
  maxCooldown?: number;
  character?: string;
  targets?: string;
  q?: string;
};

export type JutsuV2Filters = {
  kind?: "JUTSU";
  rankId?: UUID;
  techniqueTypeId?: UUID;
  q?: string;
};

export type JutsuFilterLookup = {
  rankIdByValue?: Partial<Record<JutsuRank, UUID>>;
  techniqueTypeIdByCode?: Partial<Record<JutsuTypeCode, UUID>>;
};

export type JutsuFilterTranslation = {
  filters: JutsuV2Filters;
  droppedLegacyFilters: Array<"minPrice" | "maxPrice" | "minChackra" | "maxChackra" | "maxCooldown" | "character" | "targets">;
};

type QueryPrimitive = string | number | boolean | null;

export type QueryBuilderLike = {
  eq: (column: string, value: QueryPrimitive) => QueryBuilderLike;
  gte: (column: string, value: number) => QueryBuilderLike;
  lte: (column: string, value: number) => QueryBuilderLike;
  ilike: (column: string, value: string) => QueryBuilderLike;
  contains: (column: string, value: string[]) => QueryBuilderLike;
  or: (filters: string) => QueryBuilderLike;
};

export type TechniqueQueryBuilderLike = {
  eq: (column: string, value: QueryPrimitive) => TechniqueQueryBuilderLike;
  ilike: (column: string, value: string) => TechniqueQueryBuilderLike;
  or: (filters: string) => TechniqueQueryBuilderLike;
};

function parseNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseRank(value: string | undefined): JutsuRank | undefined {
  if (!value) {
    return undefined;
  }

  return JUTSU_RANKS.includes(value as JutsuRank)
    ? (value as JutsuRank)
    : undefined;
}

function parseType(value: string | undefined): JutsuType | undefined {
  if (!value) {
    return undefined;
  }

  return JUTSU_TYPES.includes(value as JutsuType)
    ? (value as JutsuType)
    : undefined;
}

export function parseJutsuFiltersFromSearchParams(
  searchParams: URLSearchParams
): JutsuFilters {
  return {
    rank: parseRank(searchParams.get("rank") ?? undefined),
    type: parseType(searchParams.get("type") ?? undefined),
    minPrice: parseNumber(searchParams.get("minPrice") ?? undefined),
    maxPrice: parseNumber(searchParams.get("maxPrice") ?? undefined),
    minChackra: parseNumber(searchParams.get("minChackra") ?? undefined),
    maxChackra: parseNumber(searchParams.get("maxChackra") ?? undefined),
    maxCooldown: parseNumber(searchParams.get("maxCooldown") ?? undefined),
    character: searchParams.get("character") ?? undefined,
    targets: searchParams.get("targets") ?? undefined,
    q: searchParams.get("q") ?? undefined,
  };
}

export function mapJutsuTypeToCode(type: JutsuType): JutsuTypeCode {
  return JUTSU_TYPE_CODE_BY_LABEL[type];
}

export function mapJutsuTypeCodeToLabel(code: JutsuTypeCode): JutsuType {
  return JUTSU_TYPE_LABEL_BY_CODE[code];
}

export function toJutsuV2Filters(
  filters: JutsuFilters,
  lookup?: JutsuFilterLookup,
): JutsuFilterTranslation {
  const droppedLegacyFilters: JutsuFilterTranslation["droppedLegacyFilters"] = [];

  if (typeof filters.minPrice === "number") droppedLegacyFilters.push("minPrice");
  if (typeof filters.maxPrice === "number") droppedLegacyFilters.push("maxPrice");
  if (typeof filters.minChackra === "number") droppedLegacyFilters.push("minChackra");
  if (typeof filters.maxChackra === "number") droppedLegacyFilters.push("maxChackra");
  if (typeof filters.maxCooldown === "number") droppedLegacyFilters.push("maxCooldown");
  if (filters.character) droppedLegacyFilters.push("character");
  if (filters.targets) droppedLegacyFilters.push("targets");

  const mapped: JutsuV2Filters = {
    kind: "JUTSU",
    q: filters.q,
  };

  if (filters.rank && lookup?.rankIdByValue?.[filters.rank]) {
    mapped.rankId = lookup.rankIdByValue[filters.rank];
  }

  if (filters.type) {
    const code = mapJutsuTypeToCode(filters.type);
    if (lookup?.techniqueTypeIdByCode?.[code]) {
      mapped.techniqueTypeId = lookup.techniqueTypeIdByCode[code];
    }
  }

  return {
    filters: mapped,
    droppedLegacyFilters,
  };
}

export function applyJutsuFilters<T extends QueryBuilderLike>(
  query: T,
  filters: JutsuFilters
): T {
  let next = query;

  if (filters.rank) {
    next = next.eq("rank", filters.rank) as T;
  }

  if (filters.type) {
    next = next.eq("type", filters.type) as T;
  }

  if (typeof filters.minPrice === "number") {
    next = next.gte("price", filters.minPrice) as T;
  }

  if (typeof filters.maxPrice === "number") {
    next = next.lte("price", filters.maxPrice) as T;
  }

  if (typeof filters.minChackra === "number") {
    next = next.gte("chackra", filters.minChackra) as T;
  }

  if (typeof filters.maxChackra === "number") {
    next = next.lte("chackra", filters.maxChackra) as T;
  }

  if (typeof filters.maxCooldown === "number") {
    next = next.lte("cooldown", filters.maxCooldown) as T;
  }

  if (filters.character) {
    next = next.contains("characters", [filters.character]) as T;
  }

  if (filters.targets) {
    next = next.ilike("targets", `%${filters.targets}%`) as T;
  }

  if (filters.q) {
    const escaped = filters.q.replaceAll(",", "\\,").trim();
    if (escaped) {
      next = next.or(
        `name.ilike.%${escaped}%,description.ilike.%${escaped}%,observations.ilike.%${escaped}%,requirements.ilike.%${escaped}%`
      ) as T;
    }
  }

  return next;
}

export function applyJutsuV2Filters<T extends TechniqueQueryBuilderLike>(
  query: T,
  filters: JutsuV2Filters,
): T {
  let next = query.eq("kind", "JUTSU") as T;

  if (filters.rankId) {
    next = next.eq("rank_id", filters.rankId) as T;
  }

  if (filters.techniqueTypeId) {
    next = next.eq("technique_type_id", filters.techniqueTypeId) as T;
  }

  if (filters.q) {
    const escaped = filters.q.replaceAll(",", "\\,").trim();
    if (escaped) {
      next = next.or(`name.ilike.%${escaped}%,observations.ilike.%${escaped}%`) as T;
    }
  }

  return next;
}

export function buildJutsuSelectQuery() {
  return [
    "id",
    "name",
    "rank",
    "atk",
    "chackra",
    "description",
    "observations",
    "requirements",
    "escape",
    "price",
    "link",
    "characters",
    "cooldown",
    "targets",
    "type",
    "available_to_roles",
  ].join(",");
}

export function buildJutsuV2SelectQuery() {
  return [
    "id",
    "kind",
    "technique_type_id",
    "name",
    "rank_id",
    "link",
    "observations",
    "updated_by",
    "created_at",
    "updated_at",
  ].join(",");
}
