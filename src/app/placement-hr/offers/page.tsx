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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
              <tr>
                <th className="px-5 py-4 font-medium text-muted-foreground">Candidate</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">Company</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">Designation</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">CTC</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-4 font-medium text-right text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {offers.map((offer) => {
                const student = Array.isArray(offer.student_profiles) ? offer.student_profiles[0] : offer.student_profiles;
                const company = Array.isArray(offer.companies) ? offer.companies[0] : offer.companies;

                let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
                if (offer.status === "accepted") statusVariant = "success";
                if (offer.status === "pending") statusVariant = "pending";
                if (offer.status === "rejected" || offer.status === "withdrawn") statusVariant = "destructive";

                return (
                  <tr key={offer.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4 font-medium text-foreground">
                      {[student?.first_name, student?.last_name].filter(Boolean).join(" ") || "Candidate"}
                    </td>
                    <td className="px-5 py-4">{company?.name ?? "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{offer.designation}</td>
                    <td className="px-5 py-4 font-medium">
                      {offer.annual_ctc != null
                        ? `${offer.currency} ${Number(offer.annual_ctc).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={statusVariant} className="capitalize">{offer.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/placement-hr/offers/${offer.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {offers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No offers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
