import "server-only";

export function
authorizeCron(
  request:
    Request
) {

  const expected =
    process.env
      .CRON_SECRET;

  if (!expected) {
    throw new Error(
      "CRON_SECRET is not configured"
    );
  }

  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    authorization !==
    `Bearer ${expected}`
  ) {
    throw new Error(
      "Unauthorized cron request"
    );
  }
}