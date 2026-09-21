import { requireRole } from "@/lib/auth/guards";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { formatExperience } from "@/lib/jobs/experience";

export async function publishJob(
  jobId: string,
  options: {
    whatsapp: boolean;
    telegram: boolean;
    email: boolean;
  },
) {
  const user = await requireRole(["super_admin", "admin", "placement_hr"]);

  const { data: job, error: findError } = await supabaseAdmin
    .from("jobs")
    .select(
      `
        id,
        job_code,
        job_title,
        role_type,
        location,
        workplace_type,
        experience_min_years,
        experience_max_years,
        application_deadline,
        status,

        companies (
          id,
          name,
          verification_status,
          is_active
        )
      `,
    )
    .eq("id", jobId)
    .is("deleted_at", null)
    .single();

  if (findError || !job) {
    throw new Error("Job not found");
  }

  if (job.status !== "pending_checklist") {
    throw new Error("Job is not ready for publishing");
  }

  const company = Array.isArray(job.companies)
    ? job.companies[0]
    : job.companies;

  if (
    !company ||
    company.verification_status !== "verified" ||
    company.is_active === false
  ) {
    throw new Error("Verified active company required");
  }

  const { data: checklist } = await supabaseAdmin
    .from("job_checklists")
    .select(
      `
        id,
        must_have,
        top_3_skills,
        exp_required
      `,
    )
    .eq("job_id", jobId)
    .eq("status", "approved")
    .single();

  if (!checklist) {
    throw new Error("Approved checklist required before publishing");
  }

  if (!Array.isArray(checklist.must_have) || checklist.must_have.length === 0) {
    throw new Error("Checklist must contain must-have requirements");
  }

  const posterPayload = {
    title: job.job_title,

    company: company.name,

    role_type: job.role_type,

    top_3_skills: checklist.top_3_skills,

    exp:
      checklist.exp_required ||
      formatExperience(
        job.experience_min_years ?? 0,
        job.experience_max_years ?? 0,
      ),

    location: job.location,

    workplace_type: job.workplace_type,

    job_code: job.job_code,

    deadline: job.application_deadline,
  };

  const { data: previous } = await supabaseAdmin
    .from("job_publications")
    .select("publication_version")
    .eq("job_id", jobId)
    .order("publication_version", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  const publicationVersion = (previous?.publication_version ?? 0) + 1;

  const { data: publication, error: publicationError } = await supabaseAdmin
    .from("job_publications")
    .insert({
      job_id: jobId,

      checklist_id: checklist.id,

      publication_version: publicationVersion,

      poster_payload: posterPayload,

      broadcast_whatsapp: options.whatsapp,

      broadcast_telegram: options.telegram,

      broadcast_email: options.email,

      published_by: user.id,
    })
    .select()
    .single();

  if (publicationError || !publication) {
    throw new Error(publicationError?.message ?? "Unable to publish job");
  }

  const { error: jobUpdateError } = await supabaseAdmin
    .from("jobs")
    .update({
      status: "published",

      published_by: user.id,

      published_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (jobUpdateError) {
    throw new Error(jobUpdateError.message);
  }

  await Promise.all([
    supabaseAdmin.from("job_status_history").insert({
      job_id: jobId,

      old_status: "pending_checklist",

      new_status: "published",

      changed_by: user.id,

      metadata: {
        publication_id: publication.id,

        checklist_id: checklist.id,
      },
    }),

    supabaseAdmin.from("audit_logs").insert({
      actor_id: user.id,

      entity_type: "job",

      entity_id: jobId,

      action: "JOB_PUBLISHED",

      old_values: {
        status: "pending_checklist",
      },

      new_values: {
        status: "published",

        checklist_id: checklist.id,

        publication_id: publication.id,
      },
    }),
  ]);

  return {
    success: true,
    publication,
  };
}
