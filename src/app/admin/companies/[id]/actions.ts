"use server";

import { revalidatePath } from "next/cache";
import {
  verifyCompany,
  rejectCompany,
  setCompanyActive,
} from "@/services/companies/company.service";

export async function verifyCompanyAction(companyId: string) {
  try {
    await verifyCompany(companyId);
    revalidatePath(`/admin/companies/${companyId}`);
    revalidatePath("/admin/companies");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to verify company",
    };
  }
}

export async function rejectCompanyAction(companyId: string, reason: string) {
  try {
    await rejectCompany(companyId, reason);
    revalidatePath(`/admin/companies/${companyId}`);
    revalidatePath("/admin/companies");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to reject company",
    };
  }
}

export async function toggleCompanyActiveAction(companyId: string, active: boolean) {
  try {
    await setCompanyActive(companyId, active);
    revalidatePath(`/admin/companies/${companyId}`);
    revalidatePath("/admin/companies");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to update company status",
    };
  }
}
