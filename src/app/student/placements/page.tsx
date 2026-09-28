import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentPlacements } from "@/repositories/placements.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Building2, Briefcase, Calendar, CheckCircle } from "lucide-react";

import { Card } from "@/components/ui/card";

export default async function StudentPlacementsPage() {
  const user = await requireRole("student");
  const { data: student } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  const placements = student ? await getStudentPlacements(student.id) : [];

  return (
    <div className="p-8">
      <PageHeader 
        title="My Placements" 
        description="Track placement confirmation and joining status."
      />

      <Card className="mt-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
        {placements.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
            No confirmed placements yet.
          </div>
        )}
        
        {placements.map((p) => {
          const company = Array.isArray(p.companies) ? p.companies[0] : p.companies;

          let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
          if (p.placement_status === "placed" || p.placement_status === "joined") statusVariant = "success";
          if (p.placement_status === "pending_joining") statusVariant = "pending";
          if (p.placement_status === "dropped_out") statusVariant = "destructive";

          return (
            <div key={p.id} className="flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <Badge variant={statusVariant} className="capitalize">
                    {p.placement_status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground line-clamp-1">
                  {p.placed_designation}
                </h2>
                
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 shrink-0 text-primary" />
                    <span className="font-medium text-foreground">{company?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Briefcase className="h-4 w-4 shrink-0" />
                    <span>
                      {p.annual_ctc != null
                        ? `${p.currency} ${Number(p.annual_ctc).toLocaleString()}`
                        : "CTC not specified"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Joining Date:</span>
                  <span className="font-medium text-foreground">{p.joining_date ?? "Not specified"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </Card>
    </div>
  );
}
