import { getApiActorContext } from "@/app/api/_shared/auth";
import { fail, ok } from "@/app/api/_shared/responses";
import { requireApprovedActorContext } from "@/lib/access-control";
import { playersService } from "@/server/services/players.service";
import { ApiError } from "@/lib/types/errors";

export async function GET() {
  try {
    const actor = await getApiActorContext();
    requireApprovedActorContext(actor);

    const profile = await playersService.getById(actor.userId);
    if (!profile) {
      throw new ApiError("NOT_FOUND", "Player profile not found");
    }

    return ok(profile, 200);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await getApiActorContext();
    requireApprovedActorContext(actor);

    const payload = (await request.json()) as { phone?: unknown };
    const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";

    if (!phone) {
      throw new ApiError("VALIDATION_ERROR", "Phone is required");
    }

    const updated = await playersService.updatePhone(actor.userId, phone);
    if (!updated) {
      throw new ApiError("INTERNAL_ERROR", "Failed to update profile");
    }

    const profile = await playersService.getById(actor.userId);
    if (!profile) {
      throw new ApiError("NOT_FOUND", "Player profile not found");
    }

    return ok(profile, 200);
  } catch (error) {
    return fail(error);
  }
}
