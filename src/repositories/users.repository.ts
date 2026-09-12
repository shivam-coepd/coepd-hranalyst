import "server-only";
import { createClient } from "@/lib/supabase/server";

interface GetUsersOptions {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getUsers({
  status,
  search,
  page = 1,
  limit = 25,
}: GetUsersOptions = {}) {
  const supabase = await createClient();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100);
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      phone,
      account_status,
      created_at,
      approved_at,
      user_roles (
        roles (
          id,
          name,
          display_name
        )
      )
      `,
      {
        count: "exact",
      },
    )
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (status) {
    query = query.eq("account_status", status);
  }

  if (search?.trim()) {
    const term = search.trim();

    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`,
    );
  }

  const { data: users, error, count } = await query;
  if (error) throw new Error(error.message);

  const userIds = (users ?? []).map((user) => user.id);
  const roleMap = new Map<
    string,
    Array<{ id: string; name: string; display_name: string }>
  >();

  if (userIds.length) {
    const { data: assignments, error: assignmentError } = await supabase
      .from("user_roles")
      .select("user_id,role_id")
      .in("user_id", userIds);
    if (assignmentError) throw new Error(assignmentError.message);

    const roleIds = [...new Set((assignments ?? []).map((row) => row.role_id))];
    const { data: roles, error: rolesError } = roleIds.length
      ? await supabase
          .from("roles")
          .select("id,name,display_name")
          .in("id", roleIds)
      : { data: [], error: null };
    if (rolesError) throw new Error(rolesError.message);

    const byId = new Map((roles ?? []).map((role) => [role.id, role]));
    for (const assignment of assignments ?? []) {
      const role = byId.get(assignment.role_id);
      if (!role) continue;
      const list = roleMap.get(assignment.user_id) ?? [];
      list.push(role);
      roleMap.set(assignment.user_id, list);
    }
  }

  return {
    users: (users ?? []).map((user) => ({
      ...user,
      roles: roleMap.get(user.id) ?? [],
    })),
    count: count ?? 0,
    page: safePage,
    limit: safeLimit,
  };
}

export async function getUserById(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      phone,
      account_status,
      rejection_reason,
      approved_at,
      created_at,

      user_roles!user_id (
        roles (
          id,
          name,
          display_name
        )
      ),

      student_profiles (
        enrollment_id,
        verification_status,
        verification_source,
        total_experience_months,
        city,
        state,
        country
      ),

      placement_hr_profiles (
        employee_code,
        designation,
        department,
        is_active
      ),

      client_hr_profiles (
        designation,
        department,
        company_id,
        companies (
          id,
          name,
          verification_status
        )
      )
    `,
    )
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
