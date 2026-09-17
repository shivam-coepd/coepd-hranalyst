import { requireActiveClientHr } from "@/services/client/client-profile.service";
import { supabaseAdmin } from "@/lib/supabase/admin";
export default async function Page() {
  const { clientProfile } = await requireActiveClientHr();
  const { data: c, error } = await supabaseAdmin
    .from("companies")
    .select(
      "id,name,legal_name,domain,website,industry,size,primary_email,primary_phone,address,city,state,country,postal_code,verification_status,is_active",
    )
    .eq("id", clientProfile.company_id)
    .single();
  if (error || !c) throw new Error("Company not found");
  const comp = c;
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">{comp.name}</h1>
      <p className="mt-1 text-slate-600">
        {comp.verification_status} · {comp.is_active ? "Active" : "Inactive"}
      </p>
      <dl className="mt-8 grid gap-5 md:grid-cols-2">
        {Object.entries({
          Domain: comp.domain,
          Website: comp.website,
          Industry: comp.industry,
          Size: comp.size,
          Email: comp.primary_email,
          Phone: comp.primary_phone,
          Address: [
            comp.address,
            comp.city,
            comp.state,
            comp.country,
            comp.postal_code,
          ]
            .filter(Boolean)
            .join(", "),
        }).map(([k, v]) => (
          <div key={k}>
            <dt className="text-sm text-slate-500">{k}</dt>
            <dd>{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
