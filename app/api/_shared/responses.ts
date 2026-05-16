import { NextResponse } from "next/server";

import type { ApiEnvelope } from "@/lib/types/api";
import { ApiError } from "@/lib/types/errors";

export function ok<T>(data: T, status = 200) {
  const payload: ApiEnvelope<T> = {
    ok: true,
    data,
  };

  return NextResponse.json(payload, { status });
}

export function fail(error: unknown) {
  if (error instanceof ApiError) {
    const status =
      error.code === "UNAUTHORIZED"
        ? 401
        : error.code === "FORBIDDEN"
          ? 403
          : error.code === "NOT_FOUND"
            ? 404
            : error.code === "VALIDATION_ERROR"
              ? 422
              : error.code === "CONFLICT"
                ? 409
                : 500;

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected internal error",
      },
    },
    { status: 500 },
  );
}
