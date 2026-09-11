import crypto from "node:crypto";

export function
getOrCreateRequestId(
  request:
    Request
) {

  return (
    request.headers.get(
      "x-request-id"
    )
    ??
    crypto.randomUUID()
  );
}