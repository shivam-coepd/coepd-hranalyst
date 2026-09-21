import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function listMockEvaluators() {
  const { data: roles, error: roleError } = await supabaseAdmin
    .from("roles")
    .select("id")
    .in("name", ["placement_hr", "admin", "super_admin"]);
  if (roleError) throw new Error(roleError.message);
  const roleIds = (roles ?? []).map((r) => r.id);
  if (!roleIds.length) return [];
  const { data: links, error: linkError } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .in("role_id", roleIds);
  if (linkError) throw new Error(linkError.message);
  const ids = [...new Set((links ?? []).map((x) => x.user_id))];
  if (!ids.length) return [];
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id,first_name,last_name,email")
    .in("id", ids)
    .eq("account_status", "approved")
    .order("first_name");
  if (error) throw new Error(error.message);
  return data ?? [];
}
export async function listPlacementMockApplications(
  userId: string,
  isAdmin: boolean,
) {
  let q = supabaseAdmin
    .from("applications")
    .select(
      `id,status,job_id,student_id,jobs!inner(id,job_code,job_title,assigned_placement_hr,companies(name))`,
    )
    .in("status", [
      "submitted_to_client",
      "client_review",
      "shortlisted",
      "mock_pending",
      "mock_scheduled",
      "mock_completed",
    ])
    .order("updated_at", { ascending: false });
  if (!isAdmin) q = q.eq("jobs.assigned_placement_hr", userId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const studentProfileIds = [...new Set((data ?? []).map((x) => x.student_id))];
  const { data: students, error: studentError } = studentProfileIds.length
    ? await supabaseAdmin
        .from("student_profiles")
        .select("id,user_id,enrollment_id,headline")
        .in("id", studentProfileIds)
    : { data: [], error: null };
  if (studentError) throw new Error(studentError.message);
  const userIds = [...new Set((students ?? []).map((x) => x.user_id))];
  const { data: profiles, error: profileError } = userIds.length
    ? await supabaseAdmin
        .from("profiles")
        .select("id,first_name,last_name,email")
        .in("id", userIds)
    : { data: [], error: null };
  if (profileError) throw new Error(profileError.message);
  const sm = new Map((students ?? []).map((x) => [x.id, x]));
  const pm = new Map((profiles ?? []).map((x) => [x.id, x]));
  return (data ?? []).map((x) => {
    const sp = sm.get(x.student_id) ?? null;
    return {
      ...x,
      profile: sp ? (pm.get(sp.user_id) ?? null) : null,
      student_profile: sp,
    };
  });
}
export async function listPlacementMocks(userId: string, isAdmin: boolean) {
  let q = supabaseAdmin
    .from("mock_interviews")
    .select(
      `id,mock_code,application_id,evaluator_user_id,scheduled_at,duration_minutes,mode,meeting_link,location,status,booking_source,completed_at,applications!inner(id,student_id,jobs!inner(id,job_code,job_title,assigned_placement_hr,companies(name))),mock_scorecards(id,status,scoring_version,overall_score,recommendation,student_visible_notes,submitted_at)`,
    )
    .order("scheduled_at", { ascending: true });
  if (!isAdmin) q = q.eq("applications.jobs.assigned_placement_hr", userId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}
export async function getMockDetail(id: string) {
  const { data, error } = await supabaseAdmin
    .from("mock_interviews")
    .select(
      `*,applications(id,status,student_id,jobs(id,job_code,job_title,assigned_placement_hr,companies(name))),mock_scorecards(*)`,
    )
    .eq("id", id)
    .single();
  if (error) return null;
  const studentId = data.applications?.student_id;
  if (!studentId) return data;
  const [{ data: profile }, { data: student }] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id,first_name,last_name,email")
      .eq("id", studentId)
      .maybeSingle(),
    supabaseAdmin
      .from("student_profiles")
      .select("id,enrollment_id,headline")
      .eq("id", studentId)
      .maybeSingle(),
  ]);
  return { ...data, profile, student_profile: student };
}
export async function listAvailableMockSlots() {
  const { data, error } = await supabaseAdmin
    .from("mock_availability_slots")
    .select(
      `id,evaluator_user_id,starts_at,ends_at,mode,meeting_provider,location,status`,
    )
    .eq("status", "available")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}
export async function listStudentMockApplications(studentId: string) {
  const { data, error } = await supabaseAdmin
    .from("applications")
    .select(`id,status,jobs(id,job_code,job_title,companies(name))`)
    .eq("student_id", studentId)
    .in("status", [
      "submitted_to_client",
      "client_review",
      "shortlisted",
      "mock_pending",
      "mock_scheduled",
      "mock_completed",
    ])
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
export async function listStudentMocks(studentId: string) {
  const { data, error } = await supabaseAdmin
    .from("mock_interviews")
    .select(
      `id,mock_code,application_id,scheduled_at,duration_minutes,mode,meeting_link,location,status,booking_source,completed_at,applications!inner(id,student_id,jobs(id,job_code,job_title,companies(name))),mock_scorecards(id,status,scoring_version,communication_score,technical_score,domain_score,overall_score,strengths,improvement_areas,student_visible_notes,recommendation,submitted_at)`,
    )
    .eq("applications.student_id", studentId)
    .order("scheduled_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
