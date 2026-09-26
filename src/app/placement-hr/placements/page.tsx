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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
          {placements.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
              No placements found.
            </div>
          )}
          {placements.map((placement) => {
            const student = Array.isArray(placement.student_profiles) ? placement.student_profiles[0] : placement.student_profiles;
            const company = Array.isArray(placement.companies) ? placement.companies[0] : placement.companies;

            let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
            if (placement.placement_status === "placed") statusVariant = "success";
            if (placement.placement_status === "joined") statusVariant = "success";
            if (placement.placement_status === "pending_joining") statusVariant = "pending";
            if (placement.placement_status === "dropped_out") statusVariant = "destructive";

            return (
              <Link
                key={placement.id}
                href={`/placement-hr/placements/${placement.id}`}
                className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                      <span className="font-semibold text-lg">P</span>
                    </div>
                    <Badge variant={statusVariant} className="capitalize">{placement.placement_status.replace('_', ' ')}</Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {[student?.profiles?.first_name, student?.profiles?.last_name].filter(Boolean).join(" ") || "Candidate"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {placement.placed_designation} at {company?.name ?? "Company"}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Joined: {placement.joining_date ? new Date(placement.joining_date).toLocaleDateString() : "TBD"}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {placement.annual_ctc !== null
                      ? `${placement.currency} ${Number(placement.annual_ctc).toLocaleString()}`
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
