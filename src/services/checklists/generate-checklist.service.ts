import "server-only";
import { requireServiceRole } from "@/lib/auth/service-guard";
import { AppError } from "@/lib/http/route-error";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateChecklistFromJD } from "@/services/ai/generate-checklist.service";
export async function generateJobChecklist(jobId: string) {
  const user = await requireServiceRole([
    "super_admin",
    "admin",
    "placement_hr",
  ]);
  const { data: job, error } = await supabaseAdmin
    .from("jobs")
    .select(
      "id,job_title,role_type,location_type,location,experience_min_months,experience_max_months,jd_text,status,assigned_placement_hr",
    )
    .eq("id", jobId)
    .is("deleted_at", null)
    .single();
  if (error || !job) throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
  if (job.status !== "pending_checklist")
    throw new AppError(
      "Checklist can only be generated for jobs awaiting checklist",
      409,
      "INVALID_JOB_STATUS",
    );
  if (
    user.roles.includes("placement_hr") &&
    !user.roles.some((r) => r === "admin" || r === "super_admin") &&
    job.assigned_placement_hr !== user.id
  ) {
    throw new AppError(
      "This job is not assigned to you",
      403,
      "JOB_NOT_ASSIGNED",
    );
  }
  const model = process.env.GEMINI_CHECKLIST_MODEL?.trim();
  if (!model)
    throw new AppError(
      "AI checklist model is not configured",
      503,
      "AI_NOT_CONFIGURED",
    );
  const { data: run, error: runError } = await supabaseAdmin
    .from("ai_generation_runs")
    .insert({
      entity_type: "job",
      entity_id: jobId,
      operation: "generate_checklist",
      provider: "gemini",
      model,
      prompt_version: "checklist-v2",
      status: "started",
      requested_by: user.id,
      input_snapshot: {
        job_title: job.job_title,
        role_type: job.role_type,
        jd_text: job.jd_text,
      },
    })
    .select("id")
    .single();
  if (runError || !run)
    throw new AppError(
      "Unable to start AI checklist generation",
      500,
      "AI_RUN_CREATE_FAILED",
    );
  try {
    const result = await generateChecklistFromJD({
      jobTitle: job.job_title,
      roleType: job.role_type,
      locationType: job.location_type,
      location: job.location,
      experienceMinMonths: job.experience_min_months ?? 0,
      experienceMaxMonths: job.experience_max_months ?? 0,
      jdText: job.jd_text,
    });
    const { data: previous } = await supabaseAdmin
      .from("job_checklists")
      .select("version")
      .eq("job_id", jobId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = (previous?.version ?? 0) + 1;

    const { data: created, error: saveError } = await supabaseAdmin
      .from("job_checklists")
      .insert({
        job_id: jobId,
        version: nextVersion,
        status: "draft",
        source: "ai",
        must_have: result.checklist.must_have,
        good_to_have: result.checklist.good_to_have,
        tools: result.checklist.tools,
        domain: result.checklist.domain,
        exp_required: result.checklist.exp_required,
        top_3_skills: result.checklist.top_3_skills,
        checklist_summary: result.checklist.checklist_summary,
        ai_model: result.model,
        ai_response_id: result.responseId,
        prompt_version: result.promptVersion,
        generated_by: user.id,
        generated_at: new Date().toISOString(),
        created_by: user.id,
        updated_by: user.id,
      })
      .select("*")
      .single();

    if (saveError || !created)
      throw new Error(saveError?.message ?? "Unable to save checklist");

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: user.id,
      entity_type: "job_checklist",
      entity_id: created.id,
      action: "CHECKLIST_AI_GENERATED",
      new_values: { job_id: jobId, version: nextVersion },
      metadata: {}
    });
    await supabaseAdmin
      .from("ai_generation_runs")
      .update({
        status: "completed",
        response_id: result.responseId,
        output_snapshot: result.checklist,
        input_tokens: result.usage?.input_tokens ?? null,
        output_tokens: result.usage?.output_tokens ?? null,
        total_tokens: result.usage?.total_tokens ?? null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);
    return created;
  } catch (error) {
    await supabaseAdmin
      .from("ai_generation_runs")
      .update({
        status: "failed",
        error_message:
          error instanceof Error
            ? error.message.slice(0, 2000)
            : "Unknown error",
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);
    throw error instanceof AppError
      ? error
      : new AppError(
          "AI checklist generation failed",
          502,
          "AI_GENERATION_FAILED",
        );
  }
}
