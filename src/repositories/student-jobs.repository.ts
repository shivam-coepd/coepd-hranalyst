import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getStudentJobFeed({
  search,
  roleType,
  locationType,
  workplaceType,
  page = 1,
  limit = 20,
}: {
  search?: string;
  roleType?: string;
  locationType?: string;
  workplaceType?: string;
  page?: number;
  limit?: number;
} = {}) {
  const supabase = supabaseAdmin;

  const from = (page - 1) * limit;

  const to = from + limit - 1;

  let query = supabase
    .from("jobs")
    .select(
      `
        id,
        job_code,
        job_title,
        role_type,
        location_type,
        location,
        country,
        workplace_type,
        employment_type,
        experience_min_years,
        experience_max_years,
        salary_min,
        salary_max,
        salary_currency,
        openings,
        application_deadline,
        published_at,

        companies (
          id,
          name,
          logo
        ),

        job_checklists (
          id,
          top_3_skills,
          domain,
          exp_required
        )
      `,
      {
        count: "exact",
      },
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", {
      ascending: false,
    })
    .range(from, to);

  if (roleType) {
    query = query.eq("role_type", roleType);
  }

  if (locationType) {
    query = query.eq("location_type", locationType);
  }

  if (workplaceType) {
    query = query.eq("workplace_type", workplaceType);
  }

  if (search?.trim()) {
    const term = search.trim();

    query = query.or(
      `job_title.ilike.%${term}%,location.ilike.%${term}%,job_code.ilike.%${term}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    jobs: data ?? [],

    count: count ?? 0,

    page,
    limit,
  };
}
