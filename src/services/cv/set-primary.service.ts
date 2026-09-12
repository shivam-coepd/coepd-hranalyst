import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function setPrimaryCv(cvId: string) {
  const user = await requireRole("student");
  const { data, error } = await supabaseAdmin.rpc("set_primary_student_cv", {
    p_cv_id: cvId,
    p_actor_id: user.id,
  });
  if (error) throw new Error(error.message);
  return data;
}
export async function deleteCv(cvId: string) {
  const user = await requireRole("student");
  const { data: cv } = await supabaseAdmin
    .from("student_cvs")
    .select("storage_path")
    .eq("id", cvId)
    .is("deleted_at", null)
    .single();
  if (!cv) throw new Error("CV not found");
  const { error } = await supabaseAdmin.rpc("soft_delete_student_cv", {
    p_cv_id: cvId,
    p_actor_id: user.id,
  });
  if (error) throw new Error(error.message);
  await supabaseAdmin.storage.from("student-cvs").remove([cv.storage_path]);
  return { success: true };
}
export async function getCvDownloadUrl(cvId: string) {
  const user = await requireRole("student");
  const { data: student } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!student) throw new Error("Student profile not found");
  const { data: cv } = await supabaseAdmin
    .from("student_cvs")
    .select("storage_path")
    .eq("id", cvId)
    .eq("student_id", student.id)
    .is("deleted_at", null)
    .single();
  if (!cv) throw new Error("CV not found");
  const { data, error } = await supabaseAdmin.storage
    .from("student-cvs")
    .createSignedUrl(cv.storage_path, 60);
  if (error || !data) throw new Error("Unable to create CV download link");
  return data.signedUrl;
}
