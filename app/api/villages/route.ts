import { fail, ok } from "@/app/api/_shared/responses";
import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/types/errors";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("villages")
      .select("id,name")
      .order("name", { ascending: true });

    if (error) {
      throw new ApiError("INTERNAL_ERROR", error.message);
    }

    return ok(data ?? []);
  } catch (error) {
    return fail(error);
  }
}
