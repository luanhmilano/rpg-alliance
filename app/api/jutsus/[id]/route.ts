import { getApiActorContext } from "@/app/api/_shared/auth";
import { fail, ok } from "@/app/api/_shared/responses";
import { requireKageActorContext } from "@/lib/access-control";
import { getJutsuById } from "@/server/repositories/jutsus.repository";
import { techniquesRepository } from "@/server/repositories/techniques.repository";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    const jutsu = await getJutsuById(id);
    if (!jutsu) {
      throw new Error("Jutsu not found");
    }

    return ok(jutsu, 200);
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  return PATCH(request, { params });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await getApiActorContext();
    requireKageActorContext(actor);

    const { id } = await params;
    const payload = (await request.json()) as Record<string, unknown>;

    const updated = await techniquesRepository.patchCore(id, {
      kind: "JUTSU",
      name: typeof payload.name === "string" ? payload.name : undefined,
      techniqueTypeId:
        typeof payload.techniqueTypeId === "string" ? payload.techniqueTypeId : undefined,
      rankId: typeof payload.rankId === "string" ? payload.rankId : undefined,
      link: payload.link === null || typeof payload.link === "string" ? payload.link : undefined,
      observations:
        payload.observations === null || typeof payload.observations === "string"
          ? payload.observations
          : undefined,
      updatedBy: actor.userId,
    });

    if (!updated) {
      throw new Error("Failed to update jutsu");
    }

    const jutsu = await getJutsuById(id);
    if (!jutsu) {
      throw new Error("Jutsu not found");
    }

    return ok(jutsu, 200);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const actor = await getApiActorContext();
    requireKageActorContext(actor);

    const { id } = await params;
    const deleted = await techniquesRepository.deleteById(id);

    if (!deleted) {
      throw new Error("Failed to delete jutsu");
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return fail(error);
  }
}
