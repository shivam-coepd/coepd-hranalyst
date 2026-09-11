import "server-only";

import {
  requireRole,
} from "@/lib/auth/guards";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

export async function
getStudentAnalytics() {

  const user =
    await requireRole([
      "student",
    ]);

  const {
    data:
      student,
    error,
  } =
    await supabaseAdmin
      .from(
        "student_profiles"
      )
      .select("id")
      .eq(
        "user_id",
        user.id
      )
      .single();

  if (
    error ||
    !student
  ) {
    throw new Error(
      "Student profile not found"
    );
  }

  const [
    applications,
    interviews,
    offers,
    placements,
  ] =
    await Promise.all([

      supabaseAdmin
        .from(
          "applications"
        )
        .select(
          "id",
          {
            count:
              "exact",
            head:
              true,
          }
        )
        .eq(
          "student_id",
          student.id
        ),

      supabaseAdmin
        .from(
          "interviews"
        )
        .select(`
          id,

          applications!inner (
            student_id
          )
        `,
          {
            count:
              "exact",
            head:
              true,
          }
        )
        .eq(
          "applications.student_id",
          student.id
        ),

      supabaseAdmin
        .from(
          "offers"
        )
        .select(
          "id",
          {
            count:
              "exact",
            head:
              true,
          }
        )
        .eq(
          "student_id",
          student.id
        ),

      supabaseAdmin
        .from(
          "placements"
        )
        .select(
          "id",
          {
            count:
              "exact",
            head:
              true,
          }
        )
        .eq(
          "student_id",
          student.id
        ),
    ]);

  return {
    applications:
      applications.count ??
      0,

    interviews:
      interviews.count ??
      0,

    offers:
      offers.count ??
      0,

    placements:
      placements.count ??
      0,
  };
}