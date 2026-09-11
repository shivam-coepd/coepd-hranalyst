import {
  NextResponse,
} from "next/server";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

export async function GET() {

  const startedAt =
    Date.now();

  try {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "system_schema_versions"
        )
        .select(
          "version"
        )
        .order(
          "applied_at",
          {
            ascending:
              false,
          }
        )
        .limit(1)
        .single();

    if (error) {
      throw error;
    }

    const latencyMs =
      Date.now()
      -
      startedAt;

    return NextResponse.json({
      status:
        "ready",

      database:
        "connected",

      schemaVersion:
        data.version,

      databaseLatencyMs:
        latencyMs,

      timestamp:
        new Date()
          .toISOString(),
    });

  } catch {

    return NextResponse.json(
      {
        status:
          "not_ready",

        database:
          "unavailable",

        timestamp:
          new Date()
            .toISOString(),
      },
      {
        status:
          503,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}