import { requireRole } from "@/lib/auth/guards";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function approveChecklist(checklistId: string) {
  const user = await requireRole(["super_admin", "admin", "placement_hr"]);

  const { data: checklist } = await supabaseAdmin
    .from("job_checklists")
    .select(
      `
        id,
        job_id,
        status,
        must_have,
        good_to_have,
        tools,
        domain,
        exp_required,
        top_3_skills
      `,
    )
    .eq("id", checklistId)
    .single();

  if (!checklist) {
    throw new Error("Checklist not found");
  }

  if (checklist.status !== "draft") {
    throw new Error("Only draft checklists can be approved");
  }

  if (!Array.isArray(checklist.must_have) || checklist.must_have.length === 0) {
    throw new Error("At least one must-have requirement is required");
  }

  if (!checklist.domain?.trim()) {
    throw new Error("Domain is required");
  }

  if (!checklist.exp_required?.trim()) {
    throw new Error("Experience requirement is required");
  }

  if (
    !Array.isArray(checklist.top_3_skills) ||
    checklist.top_3_skills.length === 0 ||
    checklist.top_3_skills.length > 3
  ) {
    throw new Error("Select up to three key skills");
  }

  await supabaseAdmin
    .from("job_checklists")
    .update({
      status: "superseded",
    })
    .eq("job_id", checklist.job_id)
    .eq("status", "approved");

  const { error } = await supabaseAdmin
    .from("job_checklists")
    .update({
      status: "approved",

      approved_by: user.id,

      approved_at: new Date().toISOString(),

      updated_by: user.id,
    })
    .eq("id", checklistId);

  if (error) {
    throw new Error(error.message);
  }

  await supabaseAdmin.from("audit_logs").insert({
    actor_id: user.id,

    entity_type: "job_checklist",

    entity_id: checklistId,

    action: "CHECKLIST_APPROVED",

    new_values: {
      job_id: checklist.job_id,
    },
  });

  return {
    success: true,
  };
}
