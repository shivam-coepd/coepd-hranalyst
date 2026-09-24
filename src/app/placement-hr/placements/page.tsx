import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getAllPlacements } from "@/repositories/placements.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function PlacementsPage() {
  await requireRole(["placement_hr", "admin", "super_admin"]);
  const placements = await getAllPlacements();

  return (
    <div className="p-8">
      <PageHeader 
        title="Placements" 
        description="Track placed candidates, joining and closure."
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
                <th className="px-5 py-4 font-medium text-muted-foreground">Joining Date</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-4 font-medium text-right text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {placements.map((placement) => {
                const student = Array.isArray(placement.student_profiles) ? placement.student_profiles[0] : placement.student_profiles;
                const company = Array.isArray(placement.companies) ? placement.companies[0] : placement.companies;

                let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
                if (placement.placement_status === "placed") statusVariant = "success";
                if (placement.placement_status === "joined") statusVariant = "success";
                if (placement.placement_status === "pending_joining") statusVariant = "pending";
                if (placement.placement_status === "dropped_out") statusVariant = "destructive";

                return (
                  <tr key={placement.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4 font-medium text-foreground">
                      {[student?.profiles?.first_name, student?.profiles?.last_name].filter(Boolean).join(" ")}
                    </td>
                    <td className="px-5 py-4">{company?.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{placement.placed_designation}</td>
                    <td className="px-5 py-4 font-medium">
                      {placement.annual_ctc !== null
                        ? `${placement.currency} ${Number(placement.annual_ctc).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {placement.joining_date ? new Date(placement.joining_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={statusVariant} className="capitalize">
                        {placement.placement_status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/placement-hr/placements/${placement.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {placements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    No placements found.
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
