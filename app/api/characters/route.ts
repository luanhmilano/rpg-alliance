import { fail, ok } from "@/app/api/_shared/responses";
import { catalogsRepository } from "@/server/repositories/catalogs.repository";

export async function GET() {
  try {
    const characters = await catalogsRepository.listCharacterOptions();
    return ok(characters);
  } catch (error) {
    return fail(error);
  }
}
