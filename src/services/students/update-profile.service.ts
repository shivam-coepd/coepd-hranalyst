import { requireRole } from "@/lib/auth/guards";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { studentProfileSchema } from "@/lib/validators/student-profile.schema";

export async function updateStudentProfile(input: unknown) {
  const user = await requireRole(["student"]);

  const parsed = studentProfileSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid profile");
  }

  const values = parsed.data;

  const { data: student } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!student) {
    throw new Error("Student profile not found");
  }

  const fieldsToCheck = [
    values.firstName,
    values.lastName,
    values.phone,
    values.headline,
    values.city,
    values.country,
    values.qualification,
    values.specialization,
    values.preferredRole,
    values.availabilityStatus,
    values.skills && values.skills.length > 0 ? "has_skills" : null,
    values.summary,
    values.linkedinUrl,
  ];

  const filledCount = fieldsToCheck.filter(
    (v) => v !== null && v !== undefined && String(v).trim() !== ""
  ).length;

  const profileCompletion = Math.round((filledCount / fieldsToCheck.length) * 100);

  const { error } = await supabaseAdmin
    .from("student_profiles")
    .update({
      first_name: values.firstName,
      last_name: values.lastName,
      phone: values.phone,
      headline: values.headline || null,
      city: values.city,
      state: values.state || null,
      country: values.country,
      highest_qualification: values.qualification || null,
      graduation_year: values.graduationYear ?? null,
      specialization: values.specialization || null,
      total_experience_months: values.totalExperienceMonths ?? 0,
      current_company: values.currentCompany || null,
      current_designation: values.currentDesignation || null,
      current_ctc: values.currentCtc ?? null,
      expected_ctc: values.expectedCtc ?? null,
      notice_period_days: values.noticePeriodDays ?? null,
      preferred_role: values.preferredRole || null,
      preferred_locations: values.preferredLocation ? [values.preferredLocation] : [],
      preferred_location_type: values.preferredWorkplaceType || null,
      willing_to_relocate: values.willingToRelocate ?? null,
      current_employment_status: values.availabilityStatus || 'available',
      linkedin_url: values.linkedinUrl || null,
      github_url: values.githubUrl || null,
      portfolio_url: values.portfolioUrl || null,
      summary: values.summary || null,
      profile_completion: profileCompletion,
      updated_at: new Date().toISOString(),
    })
    .eq("id", student.id);

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    profileCompletion,
  };
}
