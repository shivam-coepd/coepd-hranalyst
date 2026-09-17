import { requireActiveClientHr } from "@/services/client/client-profile.service";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Building2, Globe, Briefcase, Users,
  Mail, Phone, MapPin, CheckCircle2, ShieldAlert
} from "lucide-react";

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

  const address = [
    comp.address,
    comp.city,
    comp.state,
    comp.country,
    comp.postal_code,
  ].filter(Boolean).join(", ");

  const details = [
    { label: "Domain", value: comp.domain, icon: Globe },
    { label: "Website", value: comp.website, icon: Globe, isLink: true },
    { label: "Industry", value: comp.industry, icon: Briefcase },
    { label: "Company Size", value: comp.size, icon: Users },
    { label: "Primary Email", value: comp.primary_email, icon: Mail },
    { label: "Phone Number", value: comp.primary_phone, icon: Phone },
    { label: "Headquarters", value: address, icon: MapPin },
  ];

  return (
    <main className="mx-auto max-w-5xl p-8">

      {/* Premium Header Banner */}
      <div className="relative mb-12 rounded-3xl bg-gradient-to-br from-indigo-100 via-primary to-blue-200 p-8 pt-24 shadow-lg sm:p-12 sm:pt-32">
        {/* Subtle overlay pattern */}
        <div className="absolute inset-0 rounded-3xl bg-[url('/company_bg.jpg')] bg-cover bg-center bg-no-repeat opacity-20 mix-blend-overlay"></div>

        {/* Floating Header Card */}
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner ring-1 ring-white/20 backdrop-blur-md">
              <Building2 className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {comp.name}
              </h1>
              {comp.legal_name && comp.legal_name !== comp.name && (
                <p className="mt-1 text-lg font-medium text-white/80">
                  {comp.legal_name}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex gap-2">
              <Badge
                variant={comp.is_active ? "success" : "destructive"}
                className="bg-white/20 text-white backdrop-blur-md hover:bg-white/30 border-0 shadow-sm"
              >
                {comp.is_active ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant={comp.verification_status === "verified" ? "success" : "secondary"}
                className="bg-white/20 text-white backdrop-blur-md hover:bg-white/30 border-0 shadow-sm capitalize"
              >
                {comp.verification_status}
              </Badge>
            </div>
            {comp.verification_status === "verified" ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-white/90">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Verified Partner
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-white/90">
                <ShieldAlert className="h-4 w-4 text-amber-300" /> Pending Verification
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Company Overview</h2>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {details.map((detail, idx) => (
          <Card
            key={idx}
            className="group relative overflow-hidden rounded-2xl border-border/50 bg-gradient-to-br from-card to-muted/10 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <detail.icon className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <dt className="text-sm font-medium text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="truncate text-base font-semibold text-foreground">
                  {detail.value ? (
                    detail.isLink ? (
                      <a href={detail.value.startsWith('http') ? detail.value : `https://${detail.value}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                        {detail.value}
                      </a>
                    ) : (
                      detail.value
                    )
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </dd>
              </div>
            </div>
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10"></div>
          </Card>
        ))}
      </div>
    </main>
  );
}
