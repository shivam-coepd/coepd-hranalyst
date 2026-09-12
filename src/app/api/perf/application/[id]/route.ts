import { NextResponse } from "next/server";

import { authorizePerformanceRequest } from "@/lib/performance/authorize";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  authorizePerformanceRequest(request);

  const { id } = await context.params;

  const started = performance.now();

  const { data, error } = await supabaseAdmin
    .from("applications")
    .select(
      `
        id,
        status,
        match_score,
        verified_match_score,
        ats_score,
        verified_ats_score,
        created_at,

        jobs!inner (
          job_code,
          job_title,
          role_type,

          companies!inner (
            name
          )
        ),

        student_profiles!inner (
          enrollment_id,
          first_name,
          last_name
        )
      `,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      {
        success: false,

        error: "Application not found",
      },
      {
        status: 404,
      },
    );
  }

  const elapsedMs = performance.now() - started;

  return NextResponse.json({
    success: true,

    elapsedMs: Number(elapsedMs.toFixed(2)),

    application: data,
  });
}
