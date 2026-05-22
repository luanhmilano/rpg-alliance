import { getApiActorContext } from "@/app/api/_shared/auth";
import { fail, ok } from "@/app/api/_shared/responses";
import { requireKageActorContext } from "@/lib/access-control";
import { createJutsu, getJutsus } from "@/server/repositories/jutsus.repository";

export async function GET() {
  try {
    const jutsus = await getJutsus();
    return ok(jutsus, 200);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await getApiActorContext();
    requireKageActorContext(actor);

    const payload = (await request.json()) as Record<string, unknown>;
    const insertPayload = {
      name: typeof payload.name === "string" ? payload.name : "",
      techniqueTypeId: typeof payload.techniqueTypeId === "string" ? payload.techniqueTypeId : "",
      rankId: typeof payload.rankId === "string" ? payload.rankId : "",
      link: typeof payload.link === "string" ? payload.link : null,
      observations: typeof payload.observations === "string" ? payload.observations : null,
      updatedBy: actor.userId,
    };

    if (!insertPayload.name || !insertPayload.techniqueTypeId || !insertPayload.rankId) {
      throw new Error("name, techniqueTypeId and rankId are required");
    }

    const created = await createJutsu(insertPayload);
    if (!created) {
      throw new Error("Failed to create jutsu");
    }

    return ok(created, 201);
  } catch (error) {
    return fail(error);
  }
}
