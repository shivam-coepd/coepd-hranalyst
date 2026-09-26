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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
          {mocks.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
              No mock interviews found.
            </div>
          )}
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
              <Link
                href={`/placement-hr/mocks/${m.id}`}
                key={m.id}
                className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                      <span className="font-semibold text-lg">M</span>
                    </div>
                    <Badge variant={statusVariant} className="capitalize">{m.status.replaceAll("_", " ")}</Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {m.mock_code}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {new Date(m.scheduled_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Score:</span>
                  {sc?.overall_score ? (
                    <Badge variant="outline">{sc.overall_score}/100</Badge>
                  ) : (
                    <span className="italic">—</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </main>
  );
}

