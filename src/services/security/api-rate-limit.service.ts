import "server-only";

import {
  consumeRateLimit,
} from "./rate-limit.service";

import {
  getClientIp,
} from "@/lib/http/client-ip";

export async function
enforceApiRateLimit({
  request,
  route,
  userId,
  limit = 120,
  windowSeconds = 60,
}: {
  request:
    Request;
  route:
    string;
  userId?:
    string | null;
  limit?:
    number;
  windowSeconds?:
    number;
}) {

  const ip =
    getClientIp(
      request
    );

  const identifier =
    userId
      ? `user:${userId}`
      : `ip:${ip}`;

  const result =
    await consumeRateLimit({
      namespace:
        `api:${route}`,

      identifier,

      limit,

      windowSeconds,
    });

  if (!result.allowed) {

    const error =
      new Error(
        "Rate limit exceeded"
      );

    (
      error as
      Error & {
        status?: number;
      }
    ).status =
      429;

    throw error;
  }

  return result;
}