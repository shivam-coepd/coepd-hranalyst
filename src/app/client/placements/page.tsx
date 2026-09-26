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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
              <tr>
                <th className="px-5 py-4 font-medium text-muted-foreground">Candidate</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">Designation</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">CTC</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">Joining Date</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {placements.map((p) => {
                const student = Array.isArray(p.student_profiles) ? p.student_profiles[0] : p.student_profiles;

                let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
                if (p.placement_status === "placed" || p.placement_status === "joined") statusVariant = "success";
                if (p.placement_status === "pending_joining") statusVariant = "pending";
                if (p.placement_status === "dropped_out") statusVariant = "destructive";

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4 font-medium text-foreground">
                      {/* {[student?.first_name, student?.last_name].filter(Boolean).join(" ")} */}
                      {[student?.profiles?.first_name, student?.profiles?.last_name].filter(Boolean).join(" ")}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{p.placed_designation}</td>
                    <td className="px-5 py-4 font-medium">
                      {p.annual_ctc != null
                        ? `${p.currency} ${Number(p.annual_ctc).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {p.joining_date ? new Date(p.joining_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={statusVariant} className="capitalize">
                        {p.placement_status.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {placements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    No placements yet.
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
