export function
getClientIp(
  request:
    Request
) {

  const forwarded =
    request.headers.get(
      "x-forwarded-for"
    );

  if (forwarded) {

    return forwarded
      .split(",")[0]
      .trim();
  }

  const realIp =
    request.headers.get(
      "x-real-ip"
    );

  if (realIp) {
    return realIp;
  }

  return "unknown";
}