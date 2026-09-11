import "server-only";

import crypto from "node:crypto";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

function hash(
  value:
    string
) {

  return crypto
    .createHash(
      "sha256"
    )
    .update(value)
    .digest("hex");
}

export async function
consumeRateLimit({
  namespace,
  identifier,
  limit,
  windowSeconds,
}: {
  namespace:
    string;
  identifier:
    string;
  limit:
    number;
  windowSeconds:
    number;
}) {

  const key =
    `${namespace}:${hash(
      identifier
    )}`;

  const {
    data,
    error,
  } =
    await supabaseAdmin.rpc(
      "consume_rate_limit",
      {
        p_bucket_key:
          key,

        p_limit:
          limit,

        p_window_seconds:
          windowSeconds,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  const result =
    data as {
      allowed:
        boolean;
      remaining:
        number;
      reset_at:
        string;
    };

  return result;
}