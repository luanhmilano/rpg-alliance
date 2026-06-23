import type { JutsuModel } from "@/lib/jutsus/query-parser";

type UnknownRecord = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function normalizeJutsuRecord(record: UnknownRecord): JutsuModel {
  const rawKind = asString(record.kind, "JUTSU");
  const kind: "JUTSU" = rawKind === "SUMMONING" ? "JUTSU" : "JUTSU";

  const rawTypeCode = asString(record.techniqueTypeCode ?? record.technique_type_code, "NINJUTSU");
  const techniqueTypeCode: JutsuModel["techniqueTypeCode"] =
    rawTypeCode === "NINJUTSU" || rawTypeCode === "TAIJUTSU" || rawTypeCode === "DOJUTSU" || rawTypeCode === "GENJUTSU"
      ? rawTypeCode
      : "NINJUTSU";

  return {
    id: asString(record.id ?? record.technique_id),
    kind,
    techniqueTypeId: asString(record.techniqueTypeId ?? record.technique_type_id),
    techniqueTypeCode,
    techniqueTypeName: asNullableString(record.techniqueTypeName ?? record.technique_type_name),
    rankId: asString(record.rankId ?? record.rank_id),
    rankValue: asNullableString(record.rankValue ?? record.rank_value),
    name: asString(record.name, "Unknown Jutsu"),
    observations: asNullableString(record.observations),
    link: asNullableString(record.link),
    updatedBy: asNullableString(record.updatedBy ?? record.updated_by),
    createdAt: asString(record.createdAt ?? record.created_at),
    updatedAt: asString(record.updatedAt ?? record.updated_at),
  };
}

export function normalizeJutsuList(records: UnknownRecord[]): JutsuModel[] {
  return records.map((record) => normalizeJutsuRecord(record));
}
