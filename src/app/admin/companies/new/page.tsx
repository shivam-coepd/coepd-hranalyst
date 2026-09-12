import { requireAdmin } from "@/lib/auth/guards";
import CompanyForm from "@/components/companies/company-form";
import { createCompanyAction } from "./actions";
export default async function Page() {
  await requireAdmin();
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">Create company</h1>
      <p className="mt-1 text-slate-600">
        Add a client company for verification.
      </p>
      <CompanyForm action={createCompanyAction} />
    </main>
  );
}
