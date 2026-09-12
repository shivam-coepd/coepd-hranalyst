import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function getJobs({
  status,
  companyId,
  roleType,
  assignedHrId,
  search,
  page = 1,
  limit = 25,
}: {
  status?: string;
  companyId?: string;
  roleType?: string;
  assignedHrId?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const supabase = await createClient();

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
        experience_min_months,
        experience_max_months,
        salary_min,
        salary_max,
        salary_currency,
        openings,
        status,
        application_deadline,
        assigned_placement_hr,
        created_at,
        published_at,

        companies (
          id,
          name,
          logo
        )
      `,
      {
        count: "exact",
      },
    )
    .is("deleted_at", null)
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (status) {
    query = query.eq("status", status);
  }

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  if (roleType) {
    query = query.eq("role_type", roleType);
  }

  if (assignedHrId) query = query.eq("assigned_placement_hr", assignedHrId);

  if (search?.trim()) {
    const term = search.trim();

    query = query.or(
      `job_title.ilike.%${term}%,job_code.ilike.%${term}%,location.ilike.%${term}%`,
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

export async function getJobById(jobId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
        *,
        companies (
          id,
          name,
          domain,
          website,
          logo,
          verification_status,
          is_active
        ),

        creator:profiles!jobs_created_by_fkey (
          id,
          first_name,
          last_name,
          email
        ),

        placement_hr:profiles!jobs_assigned_placement_hr_fkey (
          id,
          first_name,
          last_name,
          email
        ),

        job_status_history(id,old_status,new_status,reason,changed_at,changed_by)
      `,
    )
    .eq("id", jobId)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getPlacementHrOptions() {
  const { data: role } = await supabaseAdmin
    .from("roles")
    .select("id")
    .eq("name", "placement_hr")
    .single();
  if (!role) return [];
  const { data: assignments, error } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role_id", role.id);
  if (error) throw new Error(error.message);
  const ids = (assignments ?? []).map((r) => r.user_id);
  if (!ids.length) return [];
  const { data, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id,first_name,last_name,email,account_status")
    .in("id", ids)
    .eq("account_status", "approved")
    .order("first_name");
  if (profileError) throw new Error(profileError.message);
  return data ?? [];
}
