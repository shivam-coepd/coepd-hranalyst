import { requireAdmin } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { companySchema, CompanyInput } from "@/lib/validators/company.schema";

async function writeAudit(input: {
  actorId: string;
  entityId: string;
  action: string;
  oldData?: unknown;
  newData?: unknown;
}) {
  const { error } = await supabaseAdmin
    .from("audit_logs")
    .insert({
      actor_user_id: input.actorId,
      entity_type: "company",
      entity_id: input.entityId,
      action: input.action,
      old_data: input.oldData ?? null,
      new_data: input.newData ?? null,
    });
  if (error) throw new Error(error.message);
}

export async function createCompany(input: CompanyInput) {
  const admin = await requireAdmin();

  const parsed = companySchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company data");
  }

  const values = parsed.data;

  const { data, error } = await supabaseAdmin
    .from("companies")
    .insert({
      company_name: values.companyName,
      legal_name: values.legalName || null,
      company_domain: values.companyDomain?.toLowerCase() || null,
      website_url: values.websiteUrl || null,
      industry: values.industry || null,
      company_size: values.companySize || null,
      primary_email: values.primaryEmail || null,
      primary_phone: values.primaryPhone || null,
      registration_number: values.registrationNumber || null,
      gst_number: values.gstNumber || null,
      linkedin_url: values.linkedinUrl || null,
      address: values.address || null,
      city: values.city || null,
      state: values.state || null,
      country: values.country || null,
      postal_code: values.postalCode || null,
      verification_status: "pending",
      is_active: true,
      created_by: admin.id,
    })
    .select()
    .single();

  if (error || !data)
    throw new Error(error?.message ?? "Unable to create company");

  await supabaseAdmin.from("audit_logs").insert({
    actor_user_id: admin.id,

    entity_type: "company",

    entity_id: data.id,

    action: "COMPANY_CREATED",

    new_data: {
      company_name: data.company_name,
      status: "pending",
    },
  });

  return data;
}

export async function updateCompany(companyId: string, input: CompanyInput) {
  const admin = await requireAdmin();
  const parsed = companySchema.safeParse(input);
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company data");
  const { data: before, error: beforeError } = await supabaseAdmin
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .is("deleted_at", null)
    .single();
  if (beforeError || !before) throw new Error("Company not found");
  const v = parsed.data;
  const { data, error } = await supabaseAdmin
    .from("companies")
    .update({
      company_name: v.companyName,
      legal_name: v.legalName || null,
      company_domain: v.companyDomain?.toLowerCase() || null,
      website_url: v.websiteUrl || null,
      industry: v.industry || null,
      company_size: v.companySize || null,
      primary_email: v.primaryEmail || null,
      primary_phone: v.primaryPhone || null,
      registration_number: v.registrationNumber || null,
      gst_number: v.gstNumber || null,
      linkedin_url: v.linkedinUrl || null,
      address: v.address || null,
      city: v.city || null,
      state: v.state || null,
      country: v.country || null,
      postal_code: v.postalCode || null,
    })
    .eq("id", companyId)
    .select()
    .single();
  if (error || !data)
    throw new Error(error?.message ?? "Unable to update company");
  await writeAudit({
    actorId: admin.id,
    entityId: companyId,
    action: "COMPANY_UPDATED",
    oldData: before,
    newData: data,
  });
  return data;
}


export async function verifyCompany(companyId: string) {
  const admin = await requireAdmin();

  const { data: company } = await supabaseAdmin
    .from("companies")
    .select(
      `
      id,
      verification_status
    `,
    )
    .eq("id", companyId)
    .single();

  if (!company) {
    throw new Error("Company not found");
  }

  const oldStatus = company.verification_status;

  const { error } = await supabaseAdmin
    .from("companies")
    .update({
      verification_status: "verified",

      verified_by: admin.id,

      verified_at: new Date().toISOString(),

      rejection_reason: null,
    })
    .eq("id", companyId);

  if (error) {
    throw new Error(error.message);
  }

  await Promise.all([
    supabaseAdmin.from("company_status_history").insert({
      company_id: companyId,

      old_status: oldStatus,

      new_status: "verified",

      changed_by: admin.id,
    }),

    supabaseAdmin.from("audit_logs").insert({
      actor_user_id: admin.id,

      entity_type: "company",

      entity_id: companyId,

      action: "COMPANY_VERIFIED",

      old_data: {
        status: oldStatus,
      },

      new_data: {
        status: "verified",
      },
    }),
  ]);

  return {
    success: true,
  };
}

export async function rejectCompany(companyId: string, reason: string) {
  const admin = await requireAdmin();

  if (!reason.trim()) {
    throw new Error("Rejection reason is required");
  }

  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("verification_status")
    .eq("id", companyId)
    .single();

  if (!company) {
    throw new Error("Company not found");
  }

  await supabaseAdmin
    .from("companies")
    .update({
      verification_status: "rejected",

      rejection_reason: reason.trim(),

      verified_by: null,
      verified_at: null,
    })
    .eq("id", companyId);

  await supabaseAdmin.from("company_status_history").insert({
    company_id: companyId,

    old_status: company.verification_status,

    new_status: "rejected",

    reason: reason.trim(),

    changed_by: admin.id,
  });

  return {
    success: true,
  };
}

export async function setCompanyActive(companyId: string, active: boolean) {
  const admin = await requireAdmin();
  const { data: before, error: findError } = await supabaseAdmin
    .from("companies")
    .select("id,is_active")
    .eq("id", companyId)
    .is("deleted_at", null)
    .single();
  if (findError || !before) throw new Error("Company not found");
  const { error } = await supabaseAdmin
    .from("companies")
    .update({ is_active: active })
    .eq("id", companyId);
  if (error) throw new Error(error.message);
  await writeAudit({
    actorId: admin.id,
    entityId: companyId,
    action: active ? "COMPANY_ACTIVATED" : "COMPANY_DEACTIVATED",
    oldData: { is_active: before.is_active },
    newData: { is_active: active },
  });
  return { success: true };
}