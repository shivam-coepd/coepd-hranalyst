import "server-only";
import { AppError } from "@/lib/http/route-error";

export function authorizeCron(request: Request) {
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    throw new AppError("Cron is not configured", 500, "CRON_NOT_CONFIGURED");
  }

  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${expected}`) {
    throw new AppError("Unauthorized cron request", 401, "UNAUTHENTICATED");
  }
}
