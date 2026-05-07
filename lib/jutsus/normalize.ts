import type { JutsuModel } from "@/lib/jutsus/query-parser";

type UnknownRecord = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const items = value.filter((entry): entry is string => typeof entry === "string");
  return items.length > 0 ? items : [];
}

function normalizeType(value: unknown): JutsuModel["type"] {
  const input = asString(value, "Ninjutsu");

  if (input === "Dojutsu" || input === "Genjutsu" || input === "Taijutsu") {
    return input;
  }

  return "Ninjutsu";
}

function normalizeRank(value: unknown): JutsuModel["rank"] {
  const input = asString(value, "C");

  if (input === "B" || input === "A" || input === "S" || input === "SS" || input === "SSS") {
    return input;
  }

  return "C";
}

function normalizeRoles(value: unknown): Array<"KAGE" | "MEMBER"> {
  if (!Array.isArray(value)) {
    return ["KAGE", "MEMBER"];
  }

  const normalized = value.filter(
    (role): role is "KAGE" | "MEMBER" => role === "KAGE" || role === "MEMBER"
  );

  return normalized.length > 0 ? normalized : ["KAGE", "MEMBER"];
}

export function normalizeJutsuRecord(record: UnknownRecord): JutsuModel {
  const chackra =
    typeof record.chackra === "number"
      ? record.chackra
      : asNumber(record.chakra_cost, 0);

  return {
    id: asString(record.id),
    name: asString(record.name, "Unknown Jutsu"),
    rank: normalizeRank(record.rank),
    atk: asNullableString(record.atk),
    chackra,
    description: asString(record.description),
    observations: asNullableString(record.observations),
    requirements: asNullableString(record.requirements),
    escape: asNullableString(record.escape),
    price: asNumber(record.price, 0),
    link: asString(record.link, "https://example.com"),
    characters: asStringArray(record.characters),
    cooldown: asNullableNumber(record.cooldown),
    targets: asNullableString(record.targets),
    type: normalizeType(record.type),
    available_to_roles: normalizeRoles(record.available_to_roles),
  };
}

export function normalizeJutsuList(records: UnknownRecord[]): JutsuModel[] {
  return records.map((record) => normalizeJutsuRecord(record));
}
