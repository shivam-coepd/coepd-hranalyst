import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import {
  listPlacementMocks,
  listPlacementMockApplications,
  listMockEvaluators,
} from "@/repositories/mocks.repository";
import { ScheduleMockForm } from "@/components/mocks/schedule-mock-form";
import { CreateMockSlotForm } from "@/components/mocks/create-slot-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function Page() {
  const u = await requireRole(["placement_hr", "admin", "super_admin"]);
  const admin = u.roles.some((r) => r === "admin" || r === "super_admin");
  const [mocks, apps, evals] = await Promise.all([
    listPlacementMocks(u.id, admin),
    listPlacementMockApplications(u.id, admin),
    listMockEvaluators(),
  ]);

  return (
    <main className="p-8">
      <PageHeader 
        title="Mock Interviews"
        description="Schedule mocks, publish bookable slots, and submit scorecards."
      />
      
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <ScheduleMockForm applications={apps} evaluators={evals} />
        <CreateMockSlotForm evaluators={evals} />
      </div>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
              <tr>
                <th className="p-4 font-medium text-muted-foreground">Mock</th>
                <th className="p-4 font-medium text-muted-foreground">Schedule</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground">Score</th>
                <th className="p-4 font-medium text-right text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mocks.map((m) => {
                const rawSc = m.mock_scorecards;
                const scList = Array.isArray(rawSc) ? rawSc : (rawSc ? [rawSc] : []);
                const sc = [...scList]
                  .sort((a: any, b: any) => parseInt(b.scoring_version || "0") - parseInt(a.scoring_version || "0"))
                  .find((x: any) => x.status === "submitted");

                let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
                if (m.status === "scheduled") statusVariant = "pending";
                if (m.status === "completed") statusVariant = "success";
                if (m.status === "cancelled") statusVariant = "destructive";

                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-4 font-medium text-foreground">{m.mock_code}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(m.scheduled_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="p-4">
                      <Badge variant={statusVariant} className="capitalize">
                        {m.status.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {sc?.overall_score ? (
                        <Badge variant="outline">{sc.overall_score}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/placement-hr/mocks/${m.id}`}>
                        <Button variant="ghost" size="sm">Open</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {mocks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    No mock interviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}

