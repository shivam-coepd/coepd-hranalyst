import {
  requireRole,
} from "@/lib/auth/guards";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  checklistInputSchema,
} from "@/lib/validators/checklist.schema";

export async function updateChecklist(
  checklistId: string,
  input: unknown
) {

  const user =
    await requireRole([
      "super_admin",
      "admin",
      "placement_hr",
    ]);

  const parsed =
    checklistInputSchema
      .safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error
        .issues[0]
        ?.message ??
        "Invalid checklist"
    );
  }

  const {
    data: existing,
  } =
    await supabaseAdmin
      .from(
        "job_checklists"
      )
      .select(`
        id,
        status,
        source
      `)
      .eq(
        "id",
        checklistId
      )
      .single();

  if (!existing) {
    throw new Error(
      "Checklist not found"
    );
  }

  if (
    existing.status !==
    "draft"
  ) {
    throw new Error(
      "Only draft checklists can be edited"
    );
  }

  const values =
    parsed.data;

  const newSource =
    existing.source === "ai"
      ? "ai_edited"
      : existing.source;

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "job_checklists"
      )
      .update({

        must_have:
          values.mustHave,

        good_to_have:
          values.goodToHave,

        tools:
          values.tools,

        domain:
          values.domain,

        exp_required:
          values.expRequired,

        top_3_skills:
          values.top3Skills,

        checklist_summary:
          values
            .checklistSummary ??
          null,

        source:
          newSource,

        updated_by:
          user.id,
      })
      .eq(
        "id",
        checklistId
      )
      .select()
      .single();

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data;
}