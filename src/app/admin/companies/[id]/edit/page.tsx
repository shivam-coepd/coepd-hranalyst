import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getCompanyById } from "@/repositories/companies.repository";
import CompanyForm from "@/components/companies/company-form";
import { updateCompanyAction } from "./actions";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  
  const company = await getCompanyById(id);
  
  if (!company) {
    notFound();
  }

  const defaults = {
    companyName: company.name,
    legalName: company.legal_name || "",
    companyDomain: company.domain || "",
    websiteUrl: company.website || "",
    industry: company.industry || "",
    companySize: company.size || "",
    primaryEmail: company.primary_email || "",
    primaryPhone: company.primary_phone || "",
    registrationNumber: company.registration_number || "",
    gstNumber: company.gst_number || "",
    linkedinUrl: company.linkedin_url || "",
    address: company.address || "",
    city: company.city || "",
    state: company.state || "",
    country: company.country || "",
    postalCode: company.postal_code || "",
  };

  const actionWithId = updateCompanyAction.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit company</h1>
        <p className="text-slate-500 mt-2">
          Update the details for {company.name}.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <CompanyForm 
          action={actionWithId} 
          defaults={defaults} 
          submitLabel="Save changes" 
        />
      </div>
    </div>
  );
}
