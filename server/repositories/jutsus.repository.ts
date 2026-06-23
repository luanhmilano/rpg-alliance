import 'server-only'
import type { JutsuModel, JutsuTypeCode } from "@/lib/jutsus/query-parser";
import { techniquesRepository } from "@/server/repositories/techniques.repository";

const DEFAULT_JUTSU_TYPE_CODE: JutsuTypeCode = "NINJUTSU";

export type CreateJutsuInput = {
  name: string;
  techniqueTypeId: string;
  rankId: string;
  link?: string | null;
  observations?: string | null;
  updatedBy?: string | null;
};

export class JutsusRepository {
  private toJutsuModel(
    row: Awaited<ReturnType<typeof techniquesRepository.listWithTypeCodeByKind>>[number],
  ): JutsuModel {
    const techniqueTypeCode: JutsuTypeCode =
      row.techniqueTypeCode === "NINJUTSU" ||
      row.techniqueTypeCode === "TAIJUTSU" ||
      row.techniqueTypeCode === "DOJUTSU" ||
      row.techniqueTypeCode === "GENJUTSU"
        ? row.techniqueTypeCode
        : DEFAULT_JUTSU_TYPE_CODE;

    return {
      id: row.id,
      kind: "JUTSU",
      techniqueTypeId: row.techniqueTypeId,
      techniqueTypeCode,
      techniqueTypeName: row.techniqueTypeName,
      rankId: row.rankId,
      rankValue: row.rankValue,
      name: row.name,
      link: row.link,
      observations: row.observations,
      updatedBy: row.updatedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private async getJutsuByTechniqueId(techniqueId: string): Promise<JutsuModel | null> {
    const row = await techniquesRepository.getByIdWithTypeCode(techniqueId, "JUTSU");
    if (!row || row.kind !== "JUTSU") {
      return null;
    }

    return this.toJutsuModel(row);
  }

  public async getJutsus(): Promise<JutsuModel[]> {
    const rows = await techniquesRepository.listWithTypeCodeByKind("JUTSU");
    return rows.map((row) => this.toJutsuModel(row));
  }

  public async getJutsuById(techniqueId: string): Promise<JutsuModel | null> {
    return this.getJutsuByTechniqueId(techniqueId);
  }

  public async createJutsu(jutsu: CreateJutsuInput): Promise<JutsuModel | null> {
    const created = await techniquesRepository.createCore({
      kind: "JUTSU",
      name: jutsu.name,
      techniqueTypeId: jutsu.techniqueTypeId,
      rankId: jutsu.rankId,
      link: jutsu.link ?? null,
      observations: jutsu.observations ?? null,
      updatedBy: jutsu.updatedBy ?? null,
    });

    if (!created) {
      return null;
    }

    return this.getJutsuByTechniqueId(created.id);
  }
}

export const jutsusRepository = new JutsusRepository();

export async function getJutsus(): Promise<JutsuModel[]> {
  return jutsusRepository.getJutsus();
}

export async function createJutsu(jutsu: CreateJutsuInput): Promise<JutsuModel | null> {
  return jutsusRepository.createJutsu(jutsu);
}

export async function getJutsuById(techniqueId: string): Promise<JutsuModel | null> {
  return jutsusRepository.getJutsuById(techniqueId);
}
