import { NextRequest } from "next/server";

import { getApiActorContext } from "@/app/api/_shared/auth";
import { fail, ok } from "@/app/api/_shared/responses";
import { patchTechniqueSchema, techniqueIdParamsSchema } from "@/lib/modules/techniques/schemas";
import { buildTechniquesService } from "@/server/services/techniques.service";
import { ApiError } from "@/lib/types/errors";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = techniqueIdParamsSchema.parse(await params);
    const service = await buildTechniquesService();

    const data = await service.getById(id);
    if (!data) {
      throw new ApiError("NOT_FOUND", "Technique not found");
    }

    return ok(data, 200);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = techniqueIdParamsSchema.parse(await params);
    const payload = await request.json();
    const parsed = patchTechniqueSchema.safeParse(payload);

    if (!parsed.success) {
      throw new ApiError("VALIDATION_ERROR", "Invalid patch payload", parsed.error.flatten());
    }

    const service = await buildTechniquesService();
    const actor = await getApiActorContext();
    const data = await service.patch(id, parsed.data, actor);

    if (!data) {
      throw new ApiError("NOT_FOUND", "Technique not found");
    }

    return ok(data, 200);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = techniqueIdParamsSchema.parse(await params);
    const service = await buildTechniquesService();
    const actor = await getApiActorContext();

    const deleted = await service.delete(id, actor);
    if (!deleted) {
      throw new ApiError("NOT_FOUND", "Technique not found");
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return fail(error);
  }
}
