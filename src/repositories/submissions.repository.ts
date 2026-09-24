import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function listEligibleApplications(jobId: string) {
  const { data: applications, error } = await supabaseAdmin
    .from("applications")
    .select(
      "id,student_id,status,match_score,ats_score,verified_match_score,verified_ats_score,verified_at",
    )
    .eq("job_id", jobId)
    .eq("status", "verified")
    .order("verified_at", { ascending: false });
  if (error) throw new Error(error.message);
  const eligible = (applications ?? []).filter(
    (row) => (row.verified_match_score ?? row.match_score ?? -1) >= 60,
  );
  const studentProfileIds = [...new Set(eligible.map((row) => row.student_id))];
  if (!studentProfileIds.length) return [];
  
  const { data: students, error: studentError } = await supabaseAdmin
    .from("student_profiles")
    .select(
      "id,user_id,enrollment_id,headline,total_experience_months,current_company,current_designation",
    )
    .in("id", studentProfileIds);

  if (studentError) throw new Error(studentError.message);
  const studentMap = new Map((students ?? []).map((row) => [row.id, row]));

  const userIds = [...new Set((students ?? []).map((row) => row.user_id))];
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id,first_name,last_name,email")
    .in("id", userIds);

  if (profileError) throw new Error(profileError.message);
  const profileMap = new Map((profiles ?? []).map((row) => [row.id, row]));

  return eligible.map((row) => {
    const student = studentMap.get(row.student_id);
    return {
      ...row,
      profiles: student ? (profileMap.get(student.user_id) ?? null) : null,
      student_profiles: student ?? null,
    };
  });
}
export async function listPlacementSubmissions(
  userId: string,
  isAdmin: boolean,
) {
  let q = supabaseAdmin
    .from("submissions")
    .select(
      `id,submission_code,job_id,company_id,status,notes,candidate_count,submitted_at,created_at,jobs!inner(id,job_code,job_title,assigned_placement_hr),companies(id,name,logo)`,
    )
    .order("created_at", { ascending: false });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  if (isAdmin) return rows;
  return rows.filter((row: any) => {
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
    return !job?.assigned_placement_hr || job.assigned_placement_hr === userId;
  });
}
export async function listClientSubmissions(companyId: string) {
  const { data, error } = await supabaseAdmin
    .from("submissions")
    .select(
      `id,submission_code,status,notes,candidate_count,submitted_at,created_at,jobs(id,job_code,job_title,role_type,location,workplace_type),submission_candidates(id,status,candidate_snapshot,submitted_match_score,submitted_ats_score,current_mock_score)`,
    )
    .eq("company_id", companyId)
    .neq("status", "cancelled")
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
export async function getSubmission(id: string) {
  const { data, error } = await supabaseAdmin
    .from("submissions")
    .select(
      `id,submission_code,job_id,company_id,status,notes,candidate_count,submitted_at,created_by,companies(id,name,logo),jobs(id,job_code,job_title,assigned_placement_hr,role_type,location,workplace_type),submission_candidates(id,application_id,student_id,cv_id,status,candidate_snapshot,submitted_match_score,submitted_ats_score,current_mock_score,created_at)`,
    )
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}
