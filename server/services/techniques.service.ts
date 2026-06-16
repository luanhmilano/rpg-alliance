import "server-only";

import { createClient } from "@/lib/supabase/server";
import { SupabaseTechniquesRepository } from "@/lib/modules/techniques/repository";
import { TechniquesService } from "@/lib/modules/techniques/service";

export async function buildTechniquesService() {
  const client = await createClient();
  const repository = new SupabaseTechniquesRepository(client);
  return new TechniquesService(repository);
}
