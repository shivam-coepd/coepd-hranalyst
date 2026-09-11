import "server-only";

import {
  consumeRateLimit,
} from "./rate-limit.service";

export async function
enforceLoginRateLimit({
  ip,
  email,
}: {
  ip:
    string;
  email:
    string;
}) {

  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const [
    ipLimit,
    emailLimit,
  ] =
    await Promise.all([

      consumeRateLimit({
        namespace:
          "login-ip",

        identifier:
          ip,

        limit:
          20,

        windowSeconds:
          900,
      }),

      consumeRateLimit({
        namespace:
          "login-email",

        identifier:
          normalizedEmail,

        limit:
          10,

        windowSeconds:
          900,
      }),
    ]);

  if (
    !ipLimit.allowed ||
    !emailLimit.allowed
  ) {
    throw new Error(
      "Too many login attempts. Please try again later."
    );
  }
}