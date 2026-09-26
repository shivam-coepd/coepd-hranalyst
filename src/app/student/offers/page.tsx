import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentOffers } from "@/repositories/offers.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Building2, Award, Briefcase, ExternalLink, IndianRupee } from "lucide-react";

import { Card } from "@/components/ui/card";

export default async function StudentOffersPage() {
  const user = await requireRole(["student"]);

  const { data: studentProfile, error } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (error || !studentProfile) {
    throw new Error("Student profile not found");
  }

  const offers = await getStudentOffers(studentProfile.id);

  return (
    <div className="p-8">
      <PageHeader 
        title="My Offers" 
        description="Review your official placement offers."
      />

      <Card className="mt-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
        {offers.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
            No offers available.
          </div>
        )}
        
        {offers.map((offer) => {
          const company = Array.isArray(offer.companies) ? offer.companies[0] : offer.companies;
          const job = Array.isArray(offer.jobs) ? offer.jobs[0] : offer.jobs;

          let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
          if (offer.status === "pending") statusVariant = "pending";
          if (offer.status === "accepted") statusVariant = "success";
          if (offer.status === "rejected" || offer.status === "revoked") statusVariant = "destructive";

          return (
            <Link
              key={offer.id}
              href={`/student/offers/${offer.id}`}
              className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                    <Award className="h-6 w-6" />
                  </div>
                  <Badge variant={statusVariant} className="capitalize">{offer.status}</Badge>
                </div>
                
                <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {offer.designation}
                </h2>
                
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 shrink-0 text-primary" />
                    <span className="font-medium text-foreground">{company?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">{job?.job_title}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                {offer.annual_ctc !== null ? (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Annual CTC</div>
                    <div className="flex items-center font-bold text-lg text-emerald-600 dark:text-emerald-400">
                      {offer.currency === 'INR' ? <IndianRupee className="h-4 w-4 mr-1" /> : offer.currency} 
                      {Number(offer.annual_ctc).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Annual CTC</div>
                    <div className="font-medium text-muted-foreground">TBD</div>
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-end text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  View Offer Details <ExternalLink className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      </Card>
    </div>
  );
}
