import { requireActiveClientHr } from "@/services/client/client-profile.service";
import { getClientPlacements } from "@/repositories/placements.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ClientPlacementsPage() {
  const { clientProfile } = await requireActiveClientHr();
  const placements = await getClientPlacements(clientProfile.company_id);

  return (
    <div className="p-8">
      <PageHeader
        title="Placements"
        description="Candidates placed with your company."
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
          {placements.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
              No placements yet.
            </div>
          )}
          {placements.map((p) => {
            const student = Array.isArray(p.student_profiles) ? p.student_profiles[0] : p.student_profiles;

            let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
            if (p.placement_status === "placed" || p.placement_status === "joined") statusVariant = "success";
            if (p.placement_status === "pending_joining") statusVariant = "pending";
            if (p.placement_status === "dropped_out") statusVariant = "destructive";

            return (
              <div
                key={p.id}
                className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                      <span className="font-semibold text-lg">P</span>
                    </div>
                    <Badge variant={statusVariant} className="capitalize">{p.placement_status.replace('_', ' ')}</Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground transition-colors line-clamp-1">
                    {[student?.profiles?.first_name, student?.profiles?.last_name].filter(Boolean).join(" ") || "Candidate"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {p.placed_designation}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Joined: {p.joining_date ? new Date(p.joining_date).toLocaleDateString() : "TBD"}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {p.annual_ctc != null
                      ? `${p.currency} ${Number(p.annual_ctc).toLocaleString()}`
                      : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
