import "server-only";

import { techniquesRepository } from "@/server/repositories/techniques.repository";

export type SummoningModel = {
  id: string;
  kind: "SUMMONING";
  techniqueTypeId: string;
  techniqueTypeCode: "SUMMONING";
  rankId: string;
  name: string;
  link: string | null;
  observations: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSummoningInput = {
  name: string;
  techniqueTypeId: string;
  rankId: string;
  link?: string | null;
  observations?: string | null;
  updatedBy?: string | null;
};

const DEFAULT_SUMMONING_TYPE_CODE = "SUMMONING" as const;

export class SummoningsRepository {
  private toSummoningModel(
    row: Awaited<ReturnType<typeof techniquesRepository.listWithTypeCodeByKind>>[number],
  ): SummoningModel {
    return {
      id: row.id,
      kind: "SUMMONING",
      techniqueTypeId: row.techniqueTypeId,
      techniqueTypeCode:
        row.techniqueTypeCode === "SUMMONING"
          ? "SUMMONING"
          : DEFAULT_SUMMONING_TYPE_CODE,
      rankId: row.rankId,
      name: row.name,
      link: row.link,
      observations: row.observations,
      updatedBy: row.updatedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async getSummonings(): Promise<SummoningModel[]> {
    const rows = await techniquesRepository.listWithTypeCodeByKind("SUMMONING");
    return rows.map((row) => this.toSummoningModel(row));
  }

  async getSummoningByTechniqueId(techniqueId: string): Promise<SummoningModel | null> {
    const row = await techniquesRepository.getByIdWithTypeCode(techniqueId, "SUMMONING");

    if (!row || row.kind !== "SUMMONING") {
      return null;
    }

    return this.toSummoningModel(row);
  }

  async createSummoning(
    input: CreateSummoningInput,
  ): Promise<SummoningModel | null> {
    const created = await techniquesRepository.createCore({
      kind: "SUMMONING",
      name: input.name,
      techniqueTypeId: input.techniqueTypeId,
      rankId: input.rankId,
      link: input.link ?? null,
      observations: input.observations ?? null,
      updatedBy: input.updatedBy ?? null,
    });

    if (!created) {
      return null;
    }

    return this.getSummoningByTechniqueId(created.id);
  }
}

export const summoningsRepository = new SummoningsRepository();

export async function getSummonings(): Promise<SummoningModel[]> {
  return summoningsRepository.getSummonings();
}

export async function createSummoning(
  input: CreateSummoningInput,
): Promise<SummoningModel | null> {
  return summoningsRepository.createSummoning(input);
}
