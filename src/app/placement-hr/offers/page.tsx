import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getTeamOffers } from "@/repositories/offers.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function PlacementOffersPage() {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);
  const isAdmin = user.roles.includes("admin") || user.roles.includes("super_admin");
  const offers = await getTeamOffers(user.id, isAdmin);

  return (
    <div className="p-8">
      <PageHeader
        title="Offers"
        description="Track official offers, student decisions and placement readiness."
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
          {offers.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
              No offers found.
            </div>
          )}
          {offers.map((offer) => {
            const student = Array.isArray(offer.student_profiles) ? offer.student_profiles[0] : offer.student_profiles;
            const company = Array.isArray(offer.companies) ? offer.companies[0] : offer.companies;

            let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
            if (offer.status === "accepted") statusVariant = "success";
            if (offer.status === "pending") statusVariant = "pending";
            if (offer.status === "rejected" || offer.status === "withdrawn") statusVariant = "destructive";

            return (
              <Link
                key={offer.id}
                href={`/placement-hr/offers/${offer.id}`}
                className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                      <span className="font-semibold text-lg">O</span>
                    </div>
                    <Badge variant={statusVariant} className="capitalize">{offer.status}</Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {[student?.profiles?.first_name, student?.profiles?.last_name].filter(Boolean).join(" ") || "Candidate"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {offer.designation} at {company?.name ?? "Company"}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span>CTC:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {offer.annual_ctc != null
                      ? `${offer.currency} ${Number(offer.annual_ctc).toLocaleString()}`
                      : "—"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
