import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function getCompanies({
  status,
  search,
  page = 1,
  limit = 25,
}: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const supabase = await createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("companies")
    .select(
      `
      id,
      company_name,
      company_domain,
      website_url,
      industry,
      city,
      country,
      verification_status,
      is_active,
      created_at,
      updated_at
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
    query = query.eq("verification_status", status);
  }

  if (search?.trim()) {
    const term = search.trim();

    query = query.or(
      `company_name.ilike.%${term}%,company_domain.ilike.%${term}%,industry.ilike.%${term}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    companies: data ?? [],
    count: count ?? 0,
    page,
    limit,
  };
}

export async function getCompanyById(companyId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select(
      `
      *,
      client_hr_profiles (
        id,
        designation,
        department,
        is_primary_contact,
        user_id,
        profiles (
          id,
          first_name,
          last_name,
          email,
          phone,
          account_status
        )
      )
    `,
    )
    .eq("id", companyId)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getVerifiedActiveCompanies() {
  const { data, error } = await supabaseAdmin
    .from("companies")
    .select("id,company_name,company_domain")
    .eq("verification_status", "verified")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("company_name");
  if (error) throw new Error(error.message);
  return data ?? [];
}
