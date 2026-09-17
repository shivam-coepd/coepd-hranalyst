import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/guards";
import { AppError } from "@/lib/http/route-error";
export async function createSubmittedCvSignedUrl(
  submissionCandidateId: string,
) {
  const user = await requireRole(["client_hr", "admin", "super_admin"]);
  const { data: row, error } = await supabaseAdmin
    .from("submission_candidates")
    .select(
      `id,cv_id,submissions!inner(company_id,status),student_cvs!inner(storage_path,original_file_name,deleted_at)`,
    )
    .eq("id", submissionCandidateId)
    .single();
  if (error || !row)
    throw new AppError("Submitted candidate not found", 404, "NOT_FOUND");
  const submission = Array.isArray(row.submissions)
    ? row.submissions[0]
    : row.submissions;
  const cv = Array.isArray(row.student_cvs)
    ? row.student_cvs[0]
    : row.student_cvs;
  if (!submission || submission.status === "cancelled" || !cv || cv.deleted_at)
    throw new AppError("CV is not available", 404, "CV_UNAVAILABLE");
  if (user.roles.includes("client_hr")) {
    const { data: cp } = await supabaseAdmin
      .from("client_hr_profiles")
      .select("company_id,is_active")
      .eq("user_id", user.id)
      .single();
    if (!cp?.is_active || cp.company_id !== submission.company_id)
      throw new AppError("Not authorized for this candidate", 403, "FORBIDDEN");
  }
  const { data, error: signedError } = await supabaseAdmin.storage
    .from("student-cvs")
    .createSignedUrl(cv.storage_path, 300, { download: cv.original_file_name });
  if (signedError || !data?.signedUrl)
    throw new AppError("Unable to create CV link", 500, "CV_LINK_FAILED");
  return { url: data.signedUrl, expiresIn: 300 };
}
