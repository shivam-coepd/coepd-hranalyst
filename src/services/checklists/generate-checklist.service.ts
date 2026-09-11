import {
  requireRole,
} from "@/lib/auth/guards";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  generateChecklistFromJD,
} from "@/services/ai/generate-checklist.service";

export async function generateJobChecklist(
  jobId: string
) {

  const user =
    await requireRole([
      "super_admin",
      "admin",
      "placement_hr",
    ]);

  const {
    data: job,
    error: jobError,
  } =
    await supabaseAdmin
      .from("jobs")
      .select(`
        id,
        job_title,
        role_type,
        location_type,
        location,
        experience_min_months,
        experience_max_months,
        jd_text,
        status
      `)
      .eq(
        "id",
        jobId
      )
      .single();

  if (
    jobError ||
    !job
  ) {
    throw new Error(
      "Job not found"
    );
  }

  if (
    job.status !==
    "pending_checklist"
  ) {
    throw new Error(
      "Checklist can only be generated for jobs awaiting checklist"
    );
  }

  const {
    data: previous,
  } =
    await supabaseAdmin
      .from(
        "job_checklists"
      )
      .select(
        "version"
      )
      .eq(
        "job_id",
        jobId
      )
      .order(
        "version",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

  const nextVersion =
    (previous?.version ?? 0) +
    1;

  const {
    data: run,
    error: runError,
  } =
    await supabaseAdmin
      .from(
        "ai_generation_runs"
      )
      .insert({
        entity_type:
          "job",

        entity_id:
          jobId,

        operation:
          "generate_checklist",

        provider:
          "openai",

        model:
          process.env
            .OPENAI_CHECKLIST_MODEL,

        prompt_version:
          "checklist-v1",

        status:
          "started",

        requested_by:
          user.id,

        input_snapshot: {
          job_title:
            job.job_title,

          role_type:
            job.role_type,

          jd_text:
            job.jd_text,
        },
      })
      .select()
      .single();

  if (
    runError ||
    !run
  ) {
    throw new Error(
      "Unable to create AI generation run"
    );
  }

  try {

    const result =
      await generateChecklistFromJD({
        jobTitle:
          job.job_title,

        roleType:
          job.role_type,

        locationType:
          job.location_type,

        location:
          job.location,

        experienceMinMonths:
          job
            .experience_min_months,

        experienceMaxMonths:
          job
            .experience_max_months,

        jdText:
          job.jd_text,
      });

    const checklist =
      result.checklist;

    const {
      data: createdChecklist,
      error,
    } =
      await supabaseAdmin
        .from(
          "job_checklists"
        )
        .insert({
          job_id:
            jobId,

          version:
            nextVersion,

          status:
            "draft",

          source:
            "ai",

          must_have:
            checklist.must_have,

          good_to_have:
            checklist.good_to_have,

          tools:
            checklist.tools,

          domain:
            checklist.domain,

          exp_required:
            checklist.exp_required,

          top_3_skills:
            checklist.top_3_skills,

          checklist_summary:
            checklist
              .checklist_summary,

          ai_model:
            result.model,

          ai_response_id:
            result.responseId,

          prompt_version:
            result.promptVersion,

          generated_by:
            user.id,

          generated_at:
            new Date()
              .toISOString(),

          created_by:
            user.id,

          updated_by:
            user.id,
        })
        .select()
        .single();

    if (
      error ||
      !createdChecklist
    ) {
      throw new Error(
        error?.message ??
        "Unable to save checklist"
      );
    }

    await supabaseAdmin
      .from(
        "ai_generation_runs"
      )
      .update({
        status:
          "completed",

        response_id:
          result.responseId,

        output_snapshot:
          checklist,

        input_tokens:
          result.usage
            ?.input_tokens ??
          null,

        output_tokens:
          result.usage
            ?.output_tokens ??
          null,

        total_tokens:
          result.usage
            ?.total_tokens ??
          null,

        completed_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        run.id
      );

    await supabaseAdmin
      .from(
        "audit_logs"
      )
      .insert({
        actor_user_id:
          user.id,

        entity_type:
          "job_checklist",

        entity_id:
          createdChecklist.id,

        action:
          "CHECKLIST_AI_GENERATED",

        new_data: {
          job_id:
            jobId,

          version:
            nextVersion,
        },
      });

    return createdChecklist;

  } catch (error) {

    await supabaseAdmin
      .from(
        "ai_generation_runs"
      )
      .update({
        status:
          "failed",

        error_message:
          error instanceof Error
            ? error.message
            : "Unknown error",

        completed_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        run.id
      );

    throw error;
  }
}