import "server-only";

import crypto from "node:crypto";

import { assertPerformanceEnabled, getPerformanceSecret } from "./config";

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);

  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function authorizePerformanceRequest(request: Request) {
  assertPerformanceEnabled();

  const expected = getPerformanceSecret();

  const supplied = request.headers.get("x-perf-secret") ?? "";

  if (!secureEqual(expected, supplied)) {
    const error = new Error("Unauthorized performance request");

    (
      error as Error & {
        status?: number;
      }
    ).status = 401;

    throw error;
  }
}
