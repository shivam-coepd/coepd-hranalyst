"use server";
import { redirect } from "next/navigation";
import { updateCompany } from "@/services/companies/company.service";
import type { CompanyInput } from "@/lib/validators/company.schema";
import type { CompanyFormState } from "../../new/actions";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function updateCompanyAction(
  companyId: string,
  _: CompanyFormState,
  fd: FormData,
): Promise<CompanyFormState> {
  const raw = Object.fromEntries(fd.entries()) as Record<string, string>;

  try {
    await updateCompany(companyId, raw as unknown as CompanyInput);
    revalidatePath(`/admin/companies/${companyId}`);
    revalidatePath("/admin/companies");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return {
      success: false,
      message: e instanceof Error ? e.message : "Unable to update company",
      fields: raw,
    };
  }

  // Redirect must be outside the try/catch block because it throws an error to function
  redirect(`/admin/companies/${companyId}`);
}
