import type { ApiErrorPayload } from "@/lib/types/errors";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: ApiErrorPayload;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
