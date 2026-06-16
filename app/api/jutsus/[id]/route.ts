import { getApiActorContext } from "@/app/api/_shared/auth";
import { fail, ok } from "@/app/api/_shared/responses";
import { requireKageActorContext } from "@/lib/access-control";
import { createClient } from "@/lib/supabase/server";
import { normalizeJutsuList } from "@/lib/jutsus/normalize";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jutsus")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return ok(normalizeJutsuList([data as Record<string, unknown>])[0], 200);
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const actor = await getApiActorContext();
    requireKageActorContext(actor);

    const { id } = await params;
    const payload = (await request.json()) as Record<string, unknown>;

    const updatePayload = {
      name: payload.name,
      type: payload.type,
      rank: payload.rank,
      description: payload.description,
      chackra: payload.chackra,
      price: payload.price,
      atk: payload.atk ?? null,
      observations: payload.observations ?? null,
      requirements: payload.requirements ?? null,
      escape: payload.escape ?? null,
      link: payload.link,
      characters: payload.characters ?? null,
      cooldown: payload.cooldown ?? null,
      targets: payload.targets ?? null,
      available_to_roles: payload.available_to_roles ?? ["KAGE", "MEMBER"],
      updated_by: actor.userId,
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jutsus")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok(normalizeJutsuList([data as Record<string, unknown>])[0], 200);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await getApiActorContext();
    requireKageActorContext(actor);

    const { id } = await params;
    const payload = (await request.json()) as Record<string, unknown>;

    const updatePayload = {
      ...payload,
      updated_by: actor.userId,
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("jutsus")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return ok(normalizeJutsuList([data as Record<string, unknown>])[0], 200);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const actor = await getApiActorContext();
    requireKageActorContext(actor);

    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase.from("jutsus").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return fail(error);
  }
}
