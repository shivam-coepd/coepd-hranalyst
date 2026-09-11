import {
  requireRole,
} from "@/lib/auth/guards";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  studentProfileSchema,
} from "@/lib/validators/student-profile.schema";

export async function updateStudentProfile(
  input: unknown
) {

  const user =
    await requireRole([
      "student",
    ]);

  const parsed =
    studentProfileSchema.safeParse(
      input
    );

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]
        ?.message ??
        "Invalid profile"
    );
  }

  const values =
    parsed.data;

  const {
    data: student,
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

  if (!student) {
    throw new Error(
      "Student profile not found"
    );
  }

  const {
    error,
  } =
    await supabaseAdmin
      .from(
        "student_profiles"
      )
      .update({
        first_name:
          values.firstName,

        last_name:
          values.lastName,

        phone:
          values.phone,

        city:
          values.city,

        state:
          values.state || null,

        country:
          values.country,

        total_experience_months:
          values.totalExperienceMonths,

        current_company:
          values.currentCompany || null,

        current_designation:
          values.currentDesignation || null,

        current_ctc:
          values.currentCtc ?? null,

        expected_ctc:
          values.expectedCtc ?? null,

        notice_period_days:
          values.noticePeriodDays ?? null,

        preferred_role:
          values.preferredRole ?? null,

        linkedin_url:
          values.linkedinUrl || null,

        summary:
          values.summary || null,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        student.id
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return {
    success: true,
  };
}