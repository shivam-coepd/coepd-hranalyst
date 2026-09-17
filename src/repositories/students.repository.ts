import "server-only";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getOwnStudentProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getOwnStudentCvs(studentId: string) {
  const { data, error } = await supabaseAdmin
    .from("student_cvs")
    .select(
      "id,original_file_name,mime_type,file_size,file_extension,is_primary,parsing_status,uploaded_at,parsed_at",
    )
    .eq("student_id", studentId)
    .is("deleted_at", null)
    .order("uploaded_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getStudentApplicationList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
    id,status,score_status,match_score,ats_score,applied_at,
    jobs(id,job_code,job_title,role_type,location,workplace_type,companies(name,logo))
  `,
    )
    .order("applied_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
