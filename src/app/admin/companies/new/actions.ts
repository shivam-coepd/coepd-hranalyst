"use server";
import { redirect } from "next/navigation";
import { createCompany } from "@/services/companies/company.service";
import type { CompanyInput } from "@/lib/validators/company.schema";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export type CompanyFormState = {
  success: boolean;
  message: string;
  fields?: Record<string, string>;
};

export async function createCompanyAction(
  _: CompanyFormState,
  fd: FormData,
): Promise<CompanyFormState> {
  const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
  let companyId: string;

  try {
    const c = await createCompany(raw as unknown as CompanyInput);
    companyId = c.id;
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return {
      success: false,
      message: e instanceof Error ? e.message : "Unable to create company",
      fields: raw,
    };
  }

  // Redirect must be outside the try/catch block because it throws an error to function
  redirect(`/admin/companies/${companyId}`);
}
