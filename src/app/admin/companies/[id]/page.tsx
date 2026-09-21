import { requireAdmin } from "@/lib/auth/guards";
import { getCompanyById } from "@/repositories/companies.repository";
import CompanyActions from "@/components/companies/company-actions";
export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const c = await getCompanyById(id);
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">{c.name}</h1>
      <p className="mt-1 text-slate-600">
        {c.domain ?? "No domain"} · {c.industry ?? "Industry not set"}
      </p>
      <div className="mt-6">
        <CompanyActions
          companyId={c.id}
          status={c.verification_status}
          active={c.is_active}
        />
      </div>
      <dl className="mt-8 grid gap-4 md:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-500">Website</dt>
          <dd>{c.website ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Location</dt>
          <dd>
            {[c.city, c.state, c.country].filter(Boolean).join(", ") || "—"}
          </dd>
        </div>
      </dl>
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Client HR contacts</h2>
        <div className="mt-3 space-y-2">
          {(c.client_hr_profiles ?? []).map((h) => (
            <div key={h.id} className="rounded border p-3">
              {[h.profiles?.first_name, h.profiles?.last_name]
                .filter(Boolean)
                .join(" ") || h.profiles?.email}{" "}
              · {h.designation ?? "Client HR"}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
