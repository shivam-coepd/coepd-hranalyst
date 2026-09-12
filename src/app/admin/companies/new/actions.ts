"use server";
import { redirect } from "next/navigation";
import { createCompany } from "@/services/companies/company.service";
import type { CompanyInput } from "@/lib/validators/company.schema";
type State = {
  success: boolean;
  message: string;
};
export async function createCompanyAction(
  _: State,
  fd: FormData,
): Promise<State> {
  try {
    const c = await createCompany(
      Object.fromEntries(fd.entries()) as unknown as CompanyInput,
    );
    redirect(`/admin/companies/${c.id}`);
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Unable to create company",
    };
  }
}
