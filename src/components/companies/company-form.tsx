"use client";

import { useActionState } from "react";
import type { CompanyFormState } from "@/app/admin/companies/new/actions";

type CompanyDefaults = Partial<{
  companyName: string;
  legalName: string;
  companyDomain: string;
  websiteUrl: string;
  industry: string;
  companySize: string;
  primaryEmail: string;
  primaryPhone: string;
  registrationNumber: string;
  gstNumber: string;
  linkedinUrl: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}>;

export default function CompanyForm({
  action,
  defaults = {},
  submitLabel = "Save company",
}: {
  action: (state: CompanyFormState, formData: FormData) => Promise<CompanyFormState>;
  defaults?: CompanyDefaults;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {
    success: false,
    message: "",
  });

  // name attr must match Zod companySchema keys so FormData keys align
  const fields: Array<[keyof CompanyDefaults, string, string]> = [
    ["companyName",        "Company name",        "text"],
    ["legalName",          "Legal name",          "text"],
    ["companyDomain",      "Company domain",      "text"],
    ["websiteUrl",         "Website",             "url"],
    ["industry",           "Industry",            "text"],
    ["companySize",        "Company size",        "text"],
    ["primaryEmail",       "Primary email",       "email"],
    ["primaryPhone",       "Primary phone",       "text"],
    ["registrationNumber", "Registration number", "text"],
    ["gstNumber",          "GST number",          "text"],
    ["linkedinUrl",        "LinkedIn URL",        "url"],
    ["address",            "Address",             "text"],
    ["city",               "City",                "text"],
    ["state",              "State",               "text"],
    ["country",            "Country",             "text"],
    ["postalCode",         "Postal code",         "text"],
  ];

  // Use previously submitted value if validation fails, otherwise default
  const getValue = (name: keyof CompanyDefaults) => {
    if (state?.fields && state.fields[name] !== undefined) {
      return state.fields[name];
    }
    return defaults[name] ?? "";
  };

  return (
    <form action={formAction} className="mt-6 grid gap-4 md:grid-cols-2">
      {fields.map(([name, label, type]) => (
        <label key={name} className={name === "address" ? "md:col-span-2" : ""}>
          <span className="mb-1 block text-sm font-medium">
            {label}
            {name === "companyName" && <span className="text-red-500 ml-1">*</span>}
          </span>
          <input
            name={name}
            type={type}
            defaultValue={getValue(name)}
            required={name === "companyName"}
            className="w-full rounded-md border px-3 py-2"
          />
        </label>
      ))}
      {state.message && (
        <p
          className={`md:col-span-2 text-sm font-medium ${state.success ? "text-green-700" : "text-red-700"}`}
        >
          {state.message}
        </p>
      )}
      <div className="md:col-span-2">
        <button
          disabled={pending}
          className="rounded-md bg-slate-950 px-4 py-2 text-white disabled:opacity-50 transition-opacity"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
