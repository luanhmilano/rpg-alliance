import { z } from "zod";

import { fail, ok } from "@/app/api/_shared/responses";
import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/types/errors";

const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  phone: z.string().regex(/^\(\d{2}\)\s\d{5}-\d{4}$/),
  villageId: z.uuid("villageId deve ser um UUID valido"),
  characterId: z.uuid("characterId deve ser um UUID valido"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError("VALIDATION_ERROR", "Dados de cadastro invalidos", {
        issues: parsed.error.issues,
      });
    }

    const supabase = await createClient();
    const redirectTo = new URL("/dashboard", request.url).toString();

    const normalizedPhone = parsed.data.phone.replace(/\D/g, "");

    const [{ data: villageRow }, { data: characterRow }] = await Promise.all([
      supabase
        .from("villages")
        .select("id")
        .eq("id", parsed.data.villageId)
        .maybeSingle(),
      supabase
        .from("characters")
        .select("id")
        .eq("id", parsed.data.characterId)
        .maybeSingle(),
    ]);

    if (!villageRow?.id) {
      throw new ApiError("VALIDATION_ERROR", "Vila selecionada nao existe");
    }

    if (!characterRow?.id) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "Personagem selecionado nao existe",
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          phone: normalizedPhone,
          villageId: parsed.data.villageId,
          characterId: parsed.data.characterId,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        throw new ApiError("CONFLICT", "E-mail ja cadastrado");
      }

      throw new ApiError("INTERNAL_ERROR", error.message);
    }

    if (!data.user) {
      throw new ApiError("INTERNAL_ERROR", "Usuario nao retornado no cadastro");
    }

    return ok({
      userId: data.user.id,
      role: "MEMBER",
      approvalStatus: "PENDING",
    });
  } catch (error) {
    return fail(error);
  }
}
