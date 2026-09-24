import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

const PLACEMENT_SELECT = `
  id, placement_code, application_id, offer_id, student_id, job_id, company_id,
  placed_designation, placed_department, joining_location, annual_ctc, currency,
  joining_date, placement_status, placed_at, joined_at, closed_at, closure_reason, notes,
  companies(id,name,logo),
  jobs!inner(id,job_code,job_title,assigned_placement_hr),
  student_profiles(id,user_id,enrollment_id,profiles(first_name,last_name)),
  placement_status_history(id,old_status,new_status,reason,changed_at)
`;

export async function getPlacementById(
  placementId: string,
  actorId?: string,
  isAdmin = true,
) {
  let query = supabaseAdmin
    .from("placements")
    .select(PLACEMENT_SELECT)
    .eq("id", placementId);
  if (!isAdmin && actorId)
    query = query.eq("jobs.assigned_placement_hr", actorId);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getAllPlacements(actorId?: string, isAdmin = true) {
  let query = supabaseAdmin
    .from("placements")
    .select(PLACEMENT_SELECT)
    .order("placed_at", { ascending: false });
  if (!isAdmin && actorId)
    query = query.eq("jobs.assigned_placement_hr", actorId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getStudentPlacements(studentId: string) {
  const { data, error } = await supabaseAdmin
    .from("placements")
    .select(PLACEMENT_SELECT)
    .eq("student_id", studentId)
    .order("placed_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getClientPlacements(companyId: string) {
  const { data, error } = await supabaseAdmin
    .from("placements")
    .select(PLACEMENT_SELECT)
    .eq("company_id", companyId)
    .order("placed_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
