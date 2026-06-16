import { NextRequest } from "next/server";

import { getApiActorContext } from "@/app/api/_shared/auth";
import { fail, ok } from "@/app/api/_shared/responses";
import { createTechniqueSchema, techniqueFiltersSchema } from "@/lib/modules/techniques/schemas";
import { buildTechniquesService } from "@/server/services/techniques.service";
import { ApiError } from "@/lib/types/errors";

export async function GET(request: NextRequest) {
  try {
    const service = await buildTechniquesService();
    const parsed = techniqueFiltersSchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

    if (!parsed.success) {
      throw new ApiError("VALIDATION_ERROR", "Invalid list filters", parsed.error.flatten());
    }

    const data = await service.list(parsed.data);
    return ok(data, 200);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const service = await buildTechniquesService();
    const actor = await getApiActorContext();

    const parsed = createTechniqueSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError("VALIDATION_ERROR", "Invalid technique payload", parsed.error.flatten());
    }

    const data = await service.create(parsed.data, actor);
    return ok(data, 201);
  } catch (error) {
    return fail(error);
  }
}
