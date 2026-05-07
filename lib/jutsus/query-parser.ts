export const JUTSU_RANKS = ["C", "B", "A", "S", "SS", "SSS"] as const;
export const JUTSU_TYPES = [
  "Ninjutsu",
  "Taijutsu",
  "Dojutsu",
  "Genjutsu",
] as const;

export type JutsuRank = (typeof JUTSU_RANKS)[number];
export type JutsuType = (typeof JUTSU_TYPES)[number];

export type JutsuModel = {
  id: string;
  name: string;
  rank: JutsuRank;
  atk: string | null;
  chackra: number;
  description: string;
  observations: string | null;
  requirements: string | null;
  escape: string | null;
  price: number;
  link: string;
  characters: string[] | null;
  cooldown: number | null;
  targets: string | null;
  type: JutsuType;
  available_to_roles: Array<"KAGE" | "MEMBER">;
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

type QueryPrimitive = string | number | boolean | null;

export type QueryBuilderLike = {
  eq: (column: string, value: QueryPrimitive) => QueryBuilderLike;
  gte: (column: string, value: number) => QueryBuilderLike;
  lte: (column: string, value: number) => QueryBuilderLike;
  ilike: (column: string, value: string) => QueryBuilderLike;
  contains: (column: string, value: string[]) => QueryBuilderLike;
  or: (filters: string) => QueryBuilderLike;
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
