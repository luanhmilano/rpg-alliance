import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { normalizeJutsuList } from "@/lib/jutsus/normalize";

async function requireKageForApi() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role,approval_status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: NextResponse.json({ error: "Profile not found" }, { status: 403 }) };
  }

  if (profile.approval_status !== "APPROVED" || profile.role !== "KAGE") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, userId: user.id };
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("jutsus").select("*").order("name", {
    ascending: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalized = normalizeJutsuList((data ?? []) as Record<string, unknown>[]);
  return NextResponse.json({ data: normalized }, { status: 200 });
}

export async function POST(request: Request) {
  const auth = await requireKageForApi();

  if ("error" in auth) {
    return auth.error;
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const insertPayload = {
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
    updated_by: auth.userId,
  };

  const { data, error } = await auth.supabase
    .from("jutsus")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data: normalizeJutsuList([data as Record<string, unknown>])[0] }, { status: 201 });
}
