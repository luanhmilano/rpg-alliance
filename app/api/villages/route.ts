import { fail, ok } from "@/app/api/_shared/responses";
import { catalogsRepository } from "@/server/repositories/catalogs.repository";

export async function GET() {
  try {
    const villages = await catalogsRepository.listVillageOptions();
    return ok(villages);
  } catch (error) {
    return fail(error);
  }
}
